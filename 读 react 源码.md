## 读 react 源码

先看 react 包

入口文件暴露了react，在react.js中：

```
const React = {
    Children: {
        map,
        forEach,
        count,
        toArray,
        only
    },

    createRef,
    Component,
    PureComponent,

    createContext,
    forwardRef,
    lazy,
    memo,
    
	// 下面的先不看
    Fragment: REACT_FRAGMENT_TYPE,
    StrictMode: REACT_STRICT_MODE_TYPE,
    Suspense: REACT_SUSPENSE_TYPE,

    createElement: __DEV__ ? createElementWithValidation : createElement,
    cloneElement: __DEV__ ? cloneElementWithValidation : cloneElement,
    createFactory: __DEV__ ? createFactoryWithValidation : createFactory,
    isValidElement: isValidElement,

    version: ReactVersion,

    unstable_ConcurrentMode: REACT_CONCURRENT_MODE_TYPE,
    unstable_Profiler: REACT_PROFILER_TYPE,

    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternals
}
```



先看一下常用的**Component** 和**PureComponent** 的定义，这两个类都在ReactBaseClasses.js中

```
function Component(props, context, updater) {
    this.props = props
    this.context = context
    // 如果组件具有字符串引用，我们稍后将分配不同的对象。
    this.refs = emptyObject
    // 初始化一个updater，真正的updater由渲染器注入
    // ReactNoopUpdateQueue在没有传入updater的时候就是一个空函数，什么都不做
    // 在 v16.7.0中，updater是在react-dom中传进来的
    // 这部分代码在 react-reconciler中，稍后看
    this.updater = updater || ReactNoopUpdateQueue
}
Component.prototype.isReactComponent = {}
// 定义setstate
Component.prototype.setState = function(partialState, callback) {
    this.updater.enqueueSetState(this, partialState, callback, 'setState')
}

Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, 'forceUpdate')
}


// 下面这个原型继承可以研究一下为什么这么写
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype

function PureComponent(props, context, updater) {
    this.props = props
    this.context = context
    this.refs = emptyObject
    this.updater = updater || ReactNoopUpdateQueue
}
const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy())
pureComponentPrototype.constructor = PureComponent
// Avoid an extra prototype jump for these methods.
// 避免为这些方法进行额外的原型跳转。
Object.assign(pureComponentPrototype, Component.prototype)
pureComponentPrototype.isPureReactComponent = true
```

这里面重要的就是 **this.updater**，看一下 ReactNoopUpdateQueue 中有什么东西

```
默认没有updater则什么都不做
其实真正的updater不在这里
现在我们大致看一下 ReactNoopUpdateQueue 包含什么东西
function warnNoop() {}

const ReactNoopUpdateQueue = {

  isMounted: function(publicInstance) {
    return false;
  },
  // 强制更新队列
  enqueueForceUpdate: function(publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },
  // 这个方法在ReplaceState被弃用以后用不到了
  enqueueReplaceState: function(
    publicInstance,
    completeState,
    callback,
    callerName,
  ) {
    warnNoop(publicInstance, 'replaceState');
  },
  // setstate队列
  enqueueSetState: function(
    publicInstance,
    partialState,
    callback,
    callerName,
  ) {
    warnNoop(publicInstance, 'setState');
  },
};

```

