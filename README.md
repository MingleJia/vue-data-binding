# vue-data-binding
- vue数据双向绑定原理分析,实现简单的mvvm
===
vue.js 是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。
===
参考链接：
https://github.com/DMQ/mvvm
https://www.cnblogs.com/libin-1/p/6893712.html
https://blog.csdn.net/sirm2z/article/details/71195059（内有ppt）
https://www.jianshu.com/p/c2fa36835d77（详细的解释了view->data和data->view的过程非常好）