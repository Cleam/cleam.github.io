// vdom
function h(tag, props, children) {
  if (Array.isArray(props) || typeof props === 'string') {
    children = props;
    props = {};
  }
  return {
    tag,
    props,
    children,
  };
}

function mount(vDom, container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (typeof vDom === 'string') {
    container.textContent = vDom;
  } else {
    // tag (这里将el存储在vDom上，方便patch里面进行dom操作)
    const el = (vDom.el = document.createElement(vDom.tag));
    // props/attributes
    if (vDom.props) {
      // Object.keys(vDom.props).forEach((k) => {
      //   el.setAttribute(k, vDom.props[k]);
      // });
      for (const key in vDom.props) {
        const value = vDom.props[key];
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.setAttribute(key, value);
        }
      }
    }
    // children
    if (vDom.children) {
      if (typeof vDom.children === 'string') {
        el.textContent = vDom.children;
      } else {
        vDom.children.forEach((child) => {
          if (typeof child === 'string') {
            el.textContent = child;
          } else {
            mount(child, el);
          }
        });
      }
    }
    container.appendChild(el);
  }
}

function patch(oldVDom, newVDom) {
  const el = (newVDom.el = oldVDom.el);
  if (newVDom.tag === oldVDom.tag) {
    // props eg:
    // old: {id: 'red', class: 'cls'}
    // new: {id: 'green', name: 'test'}
    const oldProps = oldVDom.props || {};
    const newProps = newVDom.props || {};
    for (const key in newProps) {
      const value = newProps[key];
      if (value !== oldProps[key]) {
        el.setAttribute(key, value);
      }
    }
    for (const key in oldProps) {
      if (!newProps[key]) {
        el.removeAttribute(key);
      }
    }
    // children eg:
    // old: 'hello' or ['hello', h('span', 'world')]
    // new: [h('span', 'Hello')] or [h('p', {id: 'p'}, 'test')]
    const newChildren = newVDom.children || [];
    const oldChildren = oldVDom.children || [];
    if (typeof newChildren === 'string') {
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren;
        }
      } else {
        el.textContent = newChildren;
      }
    } else {
      if (typeof oldChildren === 'string') {
        el.innerHTML = '';
        newChildren.forEach((child) => {
          mount(child, el);
        });
      } else {
        // el.innerHTML = '';
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < commonLength; i++) {
          // mount(newChildren[i], el)
          patch(oldChildren[i], newChildren[i]);
        }
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(commonLength).forEach((child) => {
            mount(child, el);
          });
        } else {
          oldChildren.slice(commonLength).forEach((child) => {
            el.removeChild(child.el);
          });
        }
      }
    }
  } else {
    // replace
    mount(newVDom, el.parentNode);
    // el.outerHTML = ''
    el.remove();
  }
}

// reactivity

let _activeEffect = null;
class Dep {
  constructor(value) {
    this.subscribers = new Set();
    this._value = value;
  }
  set value(v) {
    this._value = v;
    this.notify();
  }
  get value() {
    this.depend();
    return this._value;
  }
  depend() {
    if (_activeEffect) {
      this.subscribers.add(_activeEffect);
    }
  }
  notify() {
    this.subscribers.forEach((effect) => effect());
  }
}
function watchEffect(effect) {
  _activeEffect = effect;
  effect();
  _activeEffect = null;
}
const targetMap = new WeakMap();
function getDep(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}
// 实际上用下面这种方式也行，目前不知道为啥上面要多弄一个targetMap
// let depsMap = new Map();
// function getDep(target, key) {
//   let dep = depsMap.get(key);
//   if (!dep) {
//     dep = new Dep();
//     depsMap.set(key, dep);
//   }
//   return dep;
// }
const _reactiveHandler = {
  get(target, key, receiver) {
    const dep = getDep(target, key);
    dep.depend();
    // return target[key];
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const dep = getDep(target, key);
    const result = Reflect.set(target, key, value, receiver);
    dep.notify();
    return result;
  },
};
function reactive(raw) {
  return new Proxy(raw, _reactiveHandler);
}

function createApp(app) {
  return {
    mount(container) {
      let isMounted = false;
      // 更新
      let prevVdom = null;
      watchEffect(() => {
        if (!isMounted) {
          // 首次挂载
          prevVdom = app.setup();
          mount(prevVdom, container);
          isMounted = true;
        } else {
          // 当state更新时
          let newVdom = app.setup();
          patch(prevVdom, newVdom);
          prevVdom = newVdom;
        }
      });
    },
  };
}
