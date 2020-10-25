function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

function defineReactive(obj, key, value) {
  observe(value);

  // key和dep一一对应, 每个key有一个唯一的dep示例来管理watchers
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      Dep.target && dep.addDep(Dep.target);
      // console.log('[getter key]', key);
      return value;
    },
    set(newValue) {
      observe(newValue);
      value = newValue;
      // 依赖触发
      // window.watches.forEach((w) => w.update());
      dep.notify();
    },
  });
}

function observe(obj) {
  // if (!isObject(obj)) {
  //   return;
  // }
  new Observer(obj);
}

function proxy(vm, prop) {
  const data = vm[prop];
  if (isObject(data)) {
    Object.keys(data).forEach((k) => {
      Object.defineProperty(vm, k, {
        get() {
          return data[k];
        },
        set(newValue) {
          data[k] = newValue;
        },
      });
    });
  }
}

// obj: {a: {b: {c: 'Hello'}}}  path: 'a.b.c'
// return 'hello'
function get(obj, path) {
  if (isObject(obj) && typeof path === 'string') {
    let pathArr = path.split('.');
    let i = 0;
    let len = pathArr.length;
    while (obj !== null && i < len) {
      try {
        obj = obj[pathArr[i++]];
      } catch (error) {
        console.warn('[捕获错误信息]', error);
        obj = null;
      }
    }
    return obj;
  }
}

class Vue {
  constructor(options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = typeof options.data === 'function' ? options.data() : options.data;
    this.$methods = options.methods;
    // 响应式
    observe(this.$data);
    // 将$data的数据代理到实例上
    proxy(this, '$data');
    // 将method代理到实例上
    proxy(this, '$methods');
    // 编译
    new Compile(this.$el, this);
  }

  $set(obj, key, value) {
    defineReactive(obj, key, value);
  }
}

class Observer {
  constructor(data) {
    this.data = data;
    if (isObject(data)) {
      this.reactiveObject(data);
    }
    if (Array.isArray(data)) {
      this.reactiveArray(data);
    }
  }
  // 对象响应化
  reactiveObject(obj) {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
  // 数组响应化
  reactiveArray(arr) {
    // todo...
  }
}

class Compile {
  constructor(node, vm) {
    this.vm = vm;
    this.node = node;
    console.log(node);
    console.log(node.childNodes);
    this.traverse(node);
  }
  traverse(node) {
    Array.from(node.childNodes).forEach((n) => {
      if (this.isElementNode(n)) {
        // 元素节点
        this.compileElement(n);
      } else if (this.isTextNode(n)) {
        this.compileText(n);
      }
      if (n.childNodes && n.childNodes.length > 0) {
        this.traverse(n);
      }
    });
  }
  isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
  }

  compileText(node) {
    if (!document.body.contains(node)) {
      return;
    }
    if (/\{\{(\S+)\}\}/.test(node.textContent)) {
      const exp = RegExp.$1;
      this.update(node, get(this.vm, exp));
      new Watcher(this.vm, exp, (val) => {
        this.update(node, val);
      });
    }
  }

  update(node, val) {
    // 最简单粗暴的实现
    node.textContent = val;
  }

  // compileText(node) {
  //   if (!document.body.contains(node)) {
  //     return;
  //   }
  //   const textContent = node.textContent;
  //   const matches = textContent.match(/\{\{\S+(\.\S)*\}\}/g); // {{count}}
  //   if (matches) {
  //     // console.log(matches);
  //     matches.forEach((exp) => {
  //       const rawExp = exp.replace(/\{\{(.*)\}\}/, '$1');
  //       const re = new RegExp(`(\w*)${exp}(\w*)`, 'g');
  //       const value = get(this.vm, rawExp);
  //       console.log(rawExp + ': ' + value);
  //       node.textContent = node.textContent.replace(re, `$1${value}$2`);
  //     });
  //   }
  // }

  compileElement(node) {
    if (!document.body.contains(node)) {
      return;
    }
    for (const attr of node.attributes) {
      if (attr.name.startsWith('v-')) {
        const attrs = attr.name.slice(2).split(':');
        let directive = attrs[0];
        directive = directive.charAt(0).toUpperCase() + directive.slice(1);
        // console.log(directive);
        this[`handleDirective${directive}`](node, attrs[1]);
      }
    }
  }

  handleDirectiveText(node) {
    // console.log(node);
    const attrName = 'v-text';
    const key = node.getAttribute(attrName);
    node.removeAttribute(attrName);
    this.update(node, this.vm[key]);
    new Watcher(this.vm, key, (val) => {
      this.update(node, val);
    });
  }
  handleDirectiveHtml(node) {
    // console.log(node);
    const attrName = 'v-html';
    const key = node.getAttribute(attrName);
    node.removeAttribute(attrName);
    node.innerHTML = this.vm[key];
    new Watcher(this.vm, key, (val) => {
      node.innerHTML = val;
    });
  }

  handleDirectiveOn(node, eventName) {
    // console.log(eventName);
    const attrName = `v-on:${eventName}`;
    node.addEventListener(eventName, this.vm[node.getAttribute(attrName)].bind(this.vm));
    node.removeAttribute(attrName);
  }
  
  // handleDirectiveIf(node) {
  //   // console.log(node);
  //   const attrName = 'v-if';
  //   const value = this.vm[node.getAttribute(attrName)];
  //   if (!value) {
  //     node.remove();
  //   }
  //   node.removeAttribute(attrName);
  // }
  // handleDirectiveFor(node) {
  //   // console.log(node);
  //   const attrName = 'v-for';
  //   const expression = node.getAttribute(attrName);
  //   const tag = node.tagName.toLowerCase();
  //   if (/(\w+)\s+in\s+(\w+)/.test(expression)) {
  //     // const item = RegExp.$1;
  //     const list = this.vm[RegExp.$2]; // list
  //     const compileText = function (n, i) {
  //       const textContent = n.textContent;
  //       const matches = textContent.match(/\{\{\S+(\.\S)*\}\}/g); // {{count}}
  //       if (matches) {
  //         matches.forEach((exp) => {
  //           const rawExp = exp.replace(/\{\{(.*)\}\}/, '$1');
  //           const re = new RegExp(`(\w*)${exp}(\w*)`, 'g');
  //           const value = get(i, rawExp.split('.').slice(1).join('.'));
  //           // console.log(rawExp + ': ' + value);
  //           n.textContent = n.textContent.replace(re, `$1${value}$2`);
  //         });
  //       }
  //     };
  //     for (const key in list) {
  //       const item = list[key];
  //       const itemEl = document.createElement(tag); // li
  //       const path = node.getAttribute('v-bind:key').split('.').slice(1).join('.'); // item.id but maybe item.a.id
  //       itemEl.setAttribute('key', get(item, path));
  //       itemEl.textContent = node.textContent;
  //       // console.log(item);
  //       compileText(itemEl, item);
  //       node.parentNode.appendChild(itemEl);
  //     }
  //     node.remove();
  //   }
  //   node.removeAttribute(attrName);
  // }
}

// window.watches = [];
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm;
    this.key = key;
    this.updateFn = updateFn;
    // 在获取绑定的状态数据时，将每个数据对应的依赖收集起来。
    Dep.target = this; // 巧妙的设计
    this.vm[this.key]; // 触发getter
    Dep.target = null;
    // window.watches.push(this);
  }
  update() {
    this.updateFn.call(this.vm, this.vm[this.key]);
  }
}

class Dep {
  constructor() {
    this.deps = [];
  }
  addDep(dep) {
    this.deps.push(dep);
  }
  notify() {
    this.deps.forEach((dep) => dep.update());
  }
}
