// utils
// function isObject(obj) {
//   return obj !== null && typeof obj === 'object';
// }

// function isArray(arr) {
//   return Array.isArray(arr);
// }

// function h(tag, props, children) {
//   if (typeof props === 'string') {
//     children = [props];
//     props = {};
//   } else if (isArray(props)) {
//     children = props;
//     props = {};
//   }
//   return { tag, props, children };
// }

// const render = h('div', { id: 'app' }, [
//   h('h3', 'vue模板编译分析'),
//   h('p', msg),
//   shown ? h('p', '我显示了吗？') : '',
//   h('p', msg === '你好' ? 'Hello' : 'Front-End Brother'),
//   h(
//     'ul',
//     { class: 'list' },
//     list.map(item => h('li', { class: 'item', key: item.id }, item.name))
//   ),
// ]);

// 目标：将以下模板编译成render函数
/*
  <div id="app">
    <h3>vue模板编译分析</h3>
    <!-- 了解编译过程 -->
    <p>{{msg}}</p>
    <p v-if="shown">我显示了吗？</p>
    <p>{{msg === '你好' ? 'Hello' : 'Front-End Brother'}}</p>
    <ul class="list">
      <li v-for="item in list" class="item" :key="item.id">{{item.name}}</li>
    </ul>
  </div>
*/

// 转化成render函数：
// const render = h('div', { id: 'app' }, [
//   h('h3', 'vue模板编译分析'),
//   h('p', msg),
//   shown ? h('p', '我显示了吗？') : '',
//   h('p', msg === '你好' ? 'Hello' : 'Front-End Brother'),
//   h(
//     'ul',
//     { class: 'list' },
//     list.map(item => h('li', { class: 'item', key: item.id }, item.name))
//   ),
// ]);

const template = `
<div id="app">
  <h3>vue模板编译分析</h3>
  <!-- 了解编译过程 -->
  <p>
    {{
      msg
    }}
    -
    {{msg}} - 😝
  </p>
  <p v-if="shown">我显示了吗？</p>
  <p>{{msg === '你好' ? 'Hello' : 'Front-End Brother'}}</p>
  <ul class="list">
    <li v-for="item in list" class="item" :key="item.id">{{item.name}}</li>
  </ul>
</div>
`;
// AST分析:
// 1. 常用节点类型：
// - Node.ELEMENT_NODE 1 元素节点
// - Node.ATTRIBUTE_NODE 2 特性节点
// - Node.TEXT_NODE 3 文本节点
// 2. 节点特征
// - 元素节点含有属性、子节点
// - 特性节点含有key、value
// - 文本节点含有文本

// vue模板额外特征：
// 1.特性节点的key和value都有特殊形式（key：v-if、v-for等，value：js变量、js表达式等）
// 2.文本节点有特殊形式（js变量、js表达式）

// AST格式：
// 元素节点
// const ast = {
//   type: 1,
//   // 标签
//   tag: '',
//   // 属性
//   attrs: [],
//   // 子节点
//   children: [],
//   // 处理if
//   if: '',
//   ifProcessed: null,
//   // 处理for
//   for: '',
//   forProcessed: null,
//   key: '',
//   alias: '',
// };
// （属性值或文本节点中的）表达式AST
// export interface ASTExpression {
//   type: 2;
//   expression: string;
//   text: string;
//   tokens: (string | Record<string, any>)[];
// }
// 文本节点
// export interface ASTText {
//   type: 3;
//   text: string;
// }

function getAttrs(el) {
  const attrs = [];
  if (el.hasAttributes()) {
    let attributes = el.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const element = attributes[i];
      attrs.push({ name: element.name, value: element.value });
    }
  }
  return attrs;
}

function getIf(attrs) {
  let vif;
  attrs.some(attr => {
    if (attr.name === 'v-if') {
      vif = attr.value;
      return true;
    }
    return false;
  });
  return vif || '';
}

function getFor(attrs) {
  let vfor, key, alias;
  attrs.forEach(attr => {
    if (attr.name === 'v-for') {
      vfor = attr.value;
    }
    if (attr.name === ':key') {
      key = attr.value;
    }
  });
  return {
    key: key || '',
    alias: vfor ? vfor.split(' in ')[0].trim() : '',
    for: vfor || '',
  };
}

function genAst(el) {
  let tag = el.tagName.toLowerCase();
  let attrs = getAttrs(el); // 这里没有处理特殊属性，比如：v-if v-for key 等
  // 处理v-if
  let vif = getIf(attrs);
  // 处理v-for、key
  let vfor = getFor(attrs);
  let children = [];

  if (el.hasChildNodes()) {
    const nodes = el.childNodes;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      let child = {};
      // 分情况讨论
      if (n.nodeType === Node.ELEMENT_NODE) {
        // 1、元素节点 ELEMENT_NODE
        child = genAst(n);
      } else if (n.nodeType === Node.TEXT_NODE) {
        // 2、文本节点 TEXT_NODE 这里需要处理插值绑定"{{ xxx }}"
        const textRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
        const text = n.nodeValue;
        if (textRE.test(text)) {
          // 文本中包含表达式
          child = parseText(text);
        } else {
          child.text = text;
          child.type = 3;
        }
      } else if (n.nodeType === Node.COMMENT_NODE) {
        // 注释节点
        child.text = n.nodeValue;
        child.type = 8;
      }
      children.push(child);
    }
  }
  return {
    tag,
    attrs,
    children,
    if: vif,
    ...vfor,
  };
}

function parseText(text) {
  text = text.trim();
  const type = 2;
  const tokens = [];
  const tagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  let match,
    index,
    tokenValue,
    lastIndex = 0;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // 处理文本 xxx
    if (index > lastIndex) {
      tokenValue = text.slice(lastIndex, index);
      tokens.push(JSON.stringify(tokenValue));
    }
    // 处理插值运算符 {{xxx}}
    tokens.push(`_s(${match[1].trim()})`);
    // 移动指针
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return {
    type,
    text,
    expression: tokens.join(''),
    tokens,
  };
}

// src/core/instance/render.js
//! vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
// src/core/instance/render-helpers/index.js
//! _v: createTextVNode
//! _e: createEmptyVNode
//! _s: toString

// 先将模板字符串转成AST
function parse(tpl, options) {
  // vue是通过分析字符串，复杂的正则匹配进行一个个字符分析转成AST再转成render函数的。
  // 因为传入的字符串符合html标准的，所以我们简单点，直接将字符串转成DOM，借助DOM API来操作生成AST，进而生成render函数。
  // 先不考虑边界情况
  const wrapEl = document.createElement('div');
  wrapEl.innerHTML = tpl.trim();
  const rootEl = wrapEl.childNodes[0];
  // console.log(rootEl.attributes.item());
  const ast = genAst(rootEl);

  return ast;
}

// 再将AST转成render函数
function codeGen(ast, options) {
  const render = new Function(``);

  return render;
}

console.log(parse(template));

/*
vue中
template：
  <div id="app">
    <h3>vue 源码分析</h3>
    <!-- 了解初始化过程 -->
    <p>{{msg}}</p>
  </div>
render：
  function anonymous() {
    with (this) {
      return _c('div', { attrs: { id: 'app' } }, [
        _c('h3', [_v('vue 源码分析')]),
        _v(' '),
        _c('p', [_v(_s(msg))]),
      ]);
    }
  }
*/
