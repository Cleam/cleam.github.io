function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

function isArray(arr) {
  return Array.isArray(arr);
}

function isString(str) {
  return typeof str === 'string';
}

// 支持多种写法
// 1. h('div', 'hello');
// 2. h('div', [h(……), h(……)]);
// 3. h('div', {class: 'app'}, 'hello');
// 4. h('div', {class: 'app'}, [h(……), h(……)]);
// 用js对象表示DOM树
function h(tag, props, children) {
  if (isArray(props) || !isObject(props)) {
    children = props;
    props = {};
  }
  return { tag, props, children };
}

// 挂载
// 用js树构建真实的DOM树，并插入到页面文档中。
function mount(vDom, container, refVNode) {
  if (isString(container)) {
    container = document.querySelector(container);
  }
  const { tag, props, children } = vDom;
  // 保存vDom.el，方便diff
  const el = (vDom.el = document.createElement(tag));
  // 属性处理
  if (props) {
    Object.keys(props).forEach((k) => {
      let v = props[k];
      if (k.startsWith('on')) {
        // 事件处理
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else {
        // 属性处理
        el.setAttribute(k, props[k]);
      }
    });
  }
  // 子节点处理
  if (children) {
    if (isString(children)) {
      el.textContent = children;
    } else if (isArray(children)) {
      children.forEach((child) => {
        if (isString(child)) {
          el.textContent = child;
        } else {
          // 递归
          mount(child, el);
        }
      });
    }
  }
  if (!refVNode) {
    container.appendChild(el);
  } else {
    if (refVNode.el.parentNode === container) {
      container.insertBefore(el, refVNode.el);
    }
  }
}

/*
  old:
      <div id="app">
        <ul class="list">
          <li class="item">item1</li>
          <li class="item">item2</li>
          <li class="item">item3</li>
        </ul>
      </div>
  new1:
      <div id="root" class="root">
        <ul class="list">
          <li class="item">item3</li>
          <li class="item">item2</li>
          <li class="item">item4</li>
          <li class="item">item5</li>
        </ul>
        <p>Hello, P!</p>
      </div>
  new2:
      <div id="root" class="root">
        <p class="list" id="list">
          <a class="item">item3</a>
          <a class="item">item2</a>
          <a class="item">item4</a>
          <a class="item">item6</a>
          <a class="item">item5</a>
        </p>
        <p>Hello, P!</p>
      </div>
  new3: 
    <p>Hello, World!</p>
*/

// 列表比较
function updateChildren(oldCh, newCh) {
  if (!isArray(oldCh) || !isArray(newCh)) {
    return;
  }
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVNode = oldCh[oldStartIdx];
  let oldEndVNode = oldCh[oldEndIdx];

  let startIdx = 0;
  let endIdx = newCh.length - 1;
  let startVNode = newCh[startIdx];
  let endVNode = newCh[endIdx];
  let parentEl = oldStartVNode.el.parentNode;

  while (oldStartIdx <= oldEndIdx && startIdx <= endIdx) {
    //? 为什么要这样判断，边界处理？
    if (!oldStartVNode) {
      oldStartVNode = oldCh[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldCh[--oldEndIdx];
    } else if (!startVNode) {
      startVNode = newCh[++startIdx];
    } else if (!endVNode) {
      endVNode = newCh[--endIdx];
    }
    // 旧首、新首比较
    if (isSameVNode(oldStartVNode, startVNode)) {
      // 如果两个节点相同，即可复用
      patchVNode(oldStartVNode, startVNode);
      oldStartVNode = oldCh[++oldStartIdx];
      startVNode = newCh[++startIdx];
    }
    // 旧尾、新尾比较
    else if (isSameVNode(oldEndVNode, endVNode)) {
      // 如果两个节点相同，即可复用
      patchVNode(oldEndVNode, endVNode);
      oldEndVNode = oldCh[--oldEndIdx];
      endVNode = newCh[--endIdx];
    }
    // 旧首、新尾比较
    else if (isSameVNode(oldStartVNode, endVNode)) {
      // 更新旧首vnode
      patchVNode(oldStartVNode, endVNode);
      // 移动更新后的节点到队尾
      parentEl.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling);
      oldStartVNode = oldCh[++oldStartIdx];
      endVNode = newCh[--endIdx];
    }
    // 旧尾、新首比较
    else if (isSameVNode(oldEndVNode, startVNode)) {
      // 更新旧尾vnode
      patchVNode(oldEndVNode, startVNode);
      // 移动旧尾vnode到队首
      parentEl.insertBefore(oldEndVNode.el, oldStartVNode.el);
    }
    // 如果没找到相同的，则从剩余（新）vnode列表取队首vnode，去剩余oldVNode列表一一查找，是否存在相同的。
    else {
      const idxInOld = findIdxInOld(startVNode, oldCh, oldStartIdx, oldEndIdx);
      // 没有找到可服用的vNode
      if (!idxInOld) {
        // 1. 创建新节点
        // 2. 插入到oldStartVNode前面
        mount(startVNode, parentEl, oldStartVNode);
      } else {
        patchVNode(oldCh[idxInOld], startVNode);
      }
      startVNode = newCh[++startIdx];
    }
  }
  // 当新节点列表还有剩余时，说明是新增的，需要新增。
  // 当旧节点列表还有剩余时，说明是多余的需要删除掉
  if (oldStartIdx > oldEndIdx) {
    if (startIdx <= endIdx) {
      // startIdx ~ endIdx 之间的vnode都需要新增
      for (let i = startIdx; i <= endIdx; i++) {
        mount(newCh[i], parentEl);
      }
    }
  } else {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      oldCh[i].el.remove();
    }
  }
}

function findIdxInOld(vNode, oldCh, oldStartIdx, oldEndIdx) {
  for (let i = oldStartIdx; i < oldEndIdx; i++) {
    if (isSameVNode(vNode, oldCh[i])) {
      return i;
    }
  }
}

// tag相同，认为node相同，可以复用。
function isSameVNode(oldVNode, vNode) {
  // 暂时没考虑key
  return oldVNode.tag === vNode.tag;
}

// 新旧虚拟DOM树对比更新
// 根据分析，DOM树操作有以下特点：
// 1. 很少会跨越层级地移动DOM元素，所以选择同层级元素比较的方案，降低算法复杂度。
// 2. 采用深度优先遍历算法
function patch(oldVNode, newVNode) {
  const el = (newVNode.el = oldVNode.el); // 将el存储在
  // 如果节点tag相同
  if (oldVNode.tag === newVNode.tag) {
    patchVNode(oldVNode, newVNode);
  } else {
    // 插入新节点
    mount(newVNode, el.parentNode);
    // 删除旧节点。
    el.remove();
  }
}

function patchVNode(oldVNode, newVNode) {
  const el = (newVNode.el = oldVNode.el); // 将el存储在
  // 更新props
  const oldProps = oldVNode.props;
  const newProps = newVNode.props;
  // 新旧props都存在
  if (oldProps && newProps) {
    const oldPropKeys = Object.keys(oldProps);
    const newPropKeys = Object.keys(newProps);
    for (const ok in oldPropKeys) {
      // 旧props有的key，新props没有，则删除。
      if (!newProps[ok]) {
        el.removeAttribute(ok);
      }
      // if (!newPropKeys.hasOwnProperty(ok)) {
      //   el.removeAttribute(ok);
      // }
    }
    for (const nk in newPropKeys) {
      const newValue = newProps[nk];
      const oldValue = oldProps[nk];
      // 新props有的key，旧props有，但值不同，则更新。
      if (oldValue !== newValue) {
        el.setAttribute(nk, newValue);
      }
    }
  }
  // 新props存在，旧props不存在，则添加。
  else if (newProps) {
    for (const key in newProps) {
      el.setAttribute(key, newProps[key]);
    }
  }
  // 新props不存在，旧props存在，则删除。
  else if (oldProps) {
    for (const key in oldProps) {
      el.removeAttribute(key);
    }
  }

  // 更新children
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;
  // 新旧children都存在，则比较children
  if (newChildren && oldChildren) {
    // 新children为文本节点
    if (typeof newChildren === 'string') {
      el.innerHTML = '';
      el.textContent = newChildren;
    }
    // 旧children为文本节点
    else if (typeof oldChildren === 'string') {
      el.textContent = '';
      if (isArray(newChildren)) {
        newChildren.forEach((ch) => {
          mount(ch, el);
        });
      }
    }
    // 新旧children都不为文本节点
    else {
      updateChildren(oldChildren, newChildren);
    }
  }
  // 新children存在，旧children不存在，则添加。
  else if (newChildren) {
    newChildren.forEach((ch) => {
      mount(ch, el);
    });
  }
  // 新children不存在，旧children存在，则删除。
  else if (oldChildren) {
    oldChildren.forEach((ch) => {
      el.removeChild(ch.el);
    });
  }
}
