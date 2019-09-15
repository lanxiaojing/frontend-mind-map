

# Web-component

### 是什么

Web component 是w3c推出的关于组件化的一个标准（2011），是标准化的底层浏览器API的集合，方便我们创建共享的可重用UI组件。

### 为什么

**不局限于团队、项目、框架的组件复用**

组件化、复用，这是目前前端的趋势。Web Component就是为此而提出的。

虽然类似vue、react这类框架也主导向组件化方向走，但是这些框架对于组件化各自有各自的实现、理念、规范。如果我们想在不同的框架间切换，成本还是挺高的。虽然现在市面上也有不少支持vue-react互换的库，但是只要框架api稍有修改，这个转换就变得不可靠。

并且在当下我们想要在运行时做到组件即引即用其实很困难。组件基于不同的框架开发，所以想要跨项目跨框架引用组件很难实现。而且还有同一个框架不同版本之间无法共存这种情况，导致组件不能跨框架还只能固定在框架的某个版本。

**浏览器支持，w3c标准**

目前，它还在不断发展，但已经可用于生产环境。目前Chrome、Opera、Firefox已经默认支持，Safari、Edge支持其中部分的api。而且也有一系列的polyfill作为保障。



## web component的组成部分

Web Component 是由一系列 W3C 定义的浏览器标准组成，这些标准包括4个部分：

- **自定义元素（custom elements）**：定义新HTML元素的一系列API。支持开发者定义一类新html元素，声明他的样式及其行为，然后可以在用户界面中按照需要使用。
- **HTML模版（HTML Template）**：HTML内的DOM模版，在<template>元素内声明
- **影子DOM（shadow DOM）**： 组合对DOM和样式的封装
- **HTML导入（HTML Imports）**：定义在文档中导入其他HTML文档的方式。这个是另一个Web Component 规范提出的标准。[Firefox 团队在交叉参考ES Module 规范后，认为这不是一种最佳实践](https://link.juejin.im/?target=https%3A%2F%2Fhacks.mozilla.org%2F2015%2F06%2Fthe-state-of-web-components%2F)，所以现在这个规范也就没多少人在提了。

**custom elements**和**shadow DOM**规范经历了一些迭代，现在已经是第二个版本了。在16年的时候有人推动将 Shadow DOM 和 Custom Element 并入 DOM 标准规范里面，而不再作为独立的规范存在。



#### 自定义元素（custom elements）

**自定义元素的种类**

有两种custom elements：

- **Autonomous custom elements** 是独立的元素，它不继承其他内建的HTML元素。

```js
// 使用方式：
// html中
<user-info name="lanxiaojing" gender="w"></user-info>

// 或js中
document.createElement("user-info")

```



- **Customized built-in elements** 继承自基本的HTML元素。在创建时，我们必须指定它所需扩展的元素，使用时，需要先写出基本的元素标签，并通过 `is` 属性指定custom element的名称

```js
// 使用方式：
// html中
<div is="user-info"></div>

// 或js中
document.createElement("div", { is: "user-info" })
```



**创建custom elements**

通过调用customElements.define来创建custom elements。customElements.define接受三个参数：

- **必选** 表示所创建的元素名称的符合DOMString标准的字符串。custom element 的名称不能是单个单词，且其中必须要有短横线。
- **必选 **用于定义元素行为的类
- **可选** 一个包含 `extends` 属性的配置对象。它指定了所创建的元素继承自哪个内置元素，可以继承任何内置元素。

```js
//定义一个名字是user-info元素，它的类对象是 UserInfo, 继承自 <div> 元素.
customElements.define('user-info', UserInfo, { extends: 'div' });
```

```js
// 类对象 UserInfo
class UserInfo extends HTMLElement {
  constructor() {
    // 必须首先调用 super 方法
    super();

    // 元素的功能代码写在这里

    ...
  }
}
```

在构造函数中，我们可以设定一些生命周期的回调函数，在特定的时间，这些回调函数将会被调用。

```js
// 类对象 UserInfo
class UserInfo extends HTMLElement {
  // 用observedAttributes() get函数为 attributeChangedCallback 设置监听
  // 返回一个数组，包含了需要监听的属性名称
  static get observedAttributes() {return ['name', 'gender']; }
  
  constructor() {
    // 必须首先调用 super 方法
    super();
    //获取参数
    var name = this.getAttribute('name')
    var gender = this.getAttribute('gender')
    
    // UserInfo元素内容
    var container = document.createElement('div');
    container.classList.add('container');

    var nameElm = document.createElement('p');
    nameElm.classList.add('name');
    nameElm.innerText = name;

    var genderElm = document.createElement('p');
    genderElm.classList.add('gender');
    genderElm.innerText = gender;

    container.append(nameElm, genderElm);
    this.append(container);
    
    // 生命周期
    connectedCallback() {
      // 当 custom element首次被插入文档DOM时被调用
      ...
    }

    disconnectedCallback() {
      // 当 custom element从文档DOM中删除时被调用
      ...
    }

    adoptedCallback() {
      // 当 custom element被移动到新的文档时被调用
      ...
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // 当 custom element增加、删除、修改自身属性时被调用
      ...
    }
}
```



#### HTML模版（HTML Template）

支持template标签和slot标签。slot标签支持动态替换模板中的HTML内容（类似vue），它用name属性来作为唯一表示。template中的内容被插入到DOM之前，不会渲染，它可以放在document中的任何位置。

在上面的 UserInfo 类中可以优化一下：

```js
<template id="userInfoTemplate">
  <div class="container">
    <p class="name"></p>
    <p class="gender"></p>
  </div>
</template>

// 类对象 UserInfo
class UserInfo extends HTMLElement {
  constructor() {
    super();
    //获取参数
    var name = this.getAttribute('name')
    var gender = this.getAttribute('gender')
    
    var templateElem = document.getElementById('userInfoTemplate');
    var content = templateElem.content.cloneNode(true);
    content.querySelector('.container>.name').innerText = name
    content.querySelector('.container>.gender').innerText = gender
    this.appendChild(content);
}
```



#### 影子DOM（shadow DOM）

Web Component 允许内部代码隐藏起来，用户不能看到`<user-info>`的内部代码。Shadow DOM会保护我们的HTML不被全局CSS或外部JavaScript污染。

通过自定义元素的`this.attachShadow()`方法开启 Shadow DOM，将这部分 DOM 默认与外部 DOM 隔离开来。

```js
// 语法
var shadowroot = element.attachShadow(shadowRootInit); 

// shadowRootInit 是一个对象。目前只有一个字段 mode
// element.attachShadow({mode: 'open'}); 表示指定为开放的封装模式，表示 Shadow DOM 是开放的，允许外部访问
// element.attachShadow({mode: 'closed'}); 指定为关闭的封装模式，表示 Shadow DOM 是封闭的，不允许外部访问
```

在我们的例子中：

```js
// 类对象 UserInfo
class UserInfo extends HTMLElement {
  constructor() {
    super();
    
    var shadow = this.attachShadow( { mode: 'closed' } );
    ...
   	...
    shadow.appendChild(content);
}
```



#### 样式

可以给自定义元素指定全局样式：

```css
user-info {
...
}
```

也可以写在template中，和组件封装在一起。这样子对自行一元素生效:

```html
<template id="userInfoTemplate">
  <style>
    // :host伪类指代自定义元素本身
    :host {
      ...
    }
    .container {
      
    }
    .name {
      
    }
    .gender {
      ...
    }
  </style>
  <div class="container">
    <p class="name"></p>
    <p class="gender"></p>
  </div>
</template>
```



## 类库

腾讯 [Omi](https://github.com/Tencent/omi/blob/master/README.CN.md) 号称基于 Web Components 并支持 IE8+(omio)，小程序(omip) 和 任意前端框架的一个前端跨框架跨平台框架

[Polymer](https://github.com/Polymer/polymer) 针对 Web Component API 添加了一些语法糖

[stenciljs](https://stenciljs.com/docs/introduction) 提供自己的api来写组件，然后编译成 web component



## 实践



## 浏览器兼容性

截至目前（2019.09.11）为止，Custom Elements (V1)和Shadow DOM (V1)在chrome（Version >= 53）、edge(version: 76)、firefox(version >= 68)上完全支持了。SafariSafari在10版本中, 支持了 Shadow DOM v1规范并且完成了在Webkit内核中对 Custom Elements v1规范的实现，但是到目前还有某些css选择器不起作用（:host>.local child），和:slotted伪类的样式有错误。UC、baidu、QQ浏览器支持。

HTML templates：Edge、ff、chrome、safari等主流浏览器以及手机浏览器完全支持。[查看]([https://caniuse.com/#search=Web%20components](https://caniuse.com/#search=Web components))

现在[webcomponentsjs](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)上面也有一系列的polyfill 能让包括 IE11 在内的所有主流浏览器上都能运转 Web Component。



## 参考

[github](https://github.com/w3c/webcomponents/)

[The state of Web Components](https://hacks.mozilla.org/2015/06/the-state-of-web-components/)

[MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

[Web Components Tutorial for Beginners [2019]](https://www.robinwieruch.de/web-components-tutorial)

[can i use]([https://caniuse.com/#search=Web%20components](https://caniuse.com/#search=Web components))