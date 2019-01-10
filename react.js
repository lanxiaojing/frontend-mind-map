/**
 *  React 源码解读
 *  react 部分
 */

// 入口文件 react.js

// React 包含内容
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

// 看 Component 和 PureComponent 定义
function Component(props, context, updater) {
    this.props = props
    this.context = context
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject
    // 初始化一个updater，真正的updater由渲染器注入
    // ReactNoopUpdateQueue在没有传入updater的时候
    this.updater = updater || ReactNoopUpdateQueue
}
Component.prototype.isReactComponent = {}
Component.prototype.setState = function(partialState, callback) {
    this.updater.enqueueSetState(this, partialState, callback, 'setState')
}
Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, 'forceUpdate')
}

function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype

function PureComponent(props, context, updater) {
    this.props = props
    this.context = context
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject
    this.updater = updater || ReactNoopUpdateQueue
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy())
pureComponentPrototype.constructor = PureComponent
// Avoid an extra prototype jump for these methods.
// 避免为这些方法进行额外的原型跳转。
Object.assign(pureComponentPrototype, Component.prototype)
pureComponentPrototype.isPureReactComponent = true
