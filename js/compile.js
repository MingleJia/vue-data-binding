// 解析器：扫描和解析每个节点的相关指令，并根据初始化模板数据以及初始化相应的订阅器。
// 指令解析器Compile：对每个节点元素进行扫描和解析，将相关指令对应初始化成一个订阅者Watcher，
// 并替换模板数据或者绑定相应的函数，此时当订阅者Watcher接收到相应属性的变化，就会执行对应的更新函数，
// 从而更新视图。
function Compile(el, vm) {
    // 因为遍历解析的过程有多次操作dom节点，为提高性能和效率，
    // 会先将跟节点el转换成文档碎片fragment进行解析编译操作，
    // 解析完成，再将fragment添加回原来的真实dom节点中
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el); // 判断是否为元素节点

    if(this.$el) {
        this.$fragment = this.copyOriginalFragment(this.$el); // 复制原生节点
        this.init(); // 初始化
        this.$el.appendChild(this.$fragment); // 将节点添加到各节点中
    }
}

Compile.prototype = {
    copyOriginalFragment: function (el) {
        var fragment = document.createDocumentFragment(); // 创建元素
        var childElement;

        while(childElement = el.firstChild) { // 将原生节点拷贝到fragment 将el中的元素全部复制到fragment集中
            fragment.appendChild(childElement);
        }

        return fragment;
    },
    init: function () {
        this.compileElement(this.$fragment); // 解析fragment集的元素
    },
    // compileElement 遍历所有节点及其子节点，进行扫描解析编译，
    // 调用对应的指令渲染函数进行数据渲染，并调用对应的指令更新函数进行绑定
    compileElement: function (el) { // 遍历所有节点及其子节点，进行扫描解析编译，调用对应的指令渲染函数进行数据渲染，并调用对应的指令更新函数进行绑定
        var _this = this;
        var child = el.childNodes;

        [].slice.call(child).forEach(function (item) {
            var text = item.textContent; // 获得元素的文本属性
            var reg = /\{\{(.*)\}\}/; // 表达式文本

            if(_this.isElementNode(item)) { // 判断是否为元素节点
                _this.compile(item);
            } else if (_this.isTextNode(item) && reg.test(text)){ // 判断是否为文本内容
                _this.compileText(item, RegExp.$1); // 与正则表达式匹配的第一个子匹配的字符串
            }

            if(item.childNodes && item.childNodes.length) { // 遍历子元素
                _this.compileElement(item);
            }
        });
    },
    // 解析指令
    compile: function (node) {
        var _this = this;
        var nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach(function (item) {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            var attrName = item.name; // 本例中为 v-text
            if(_this.isDirective(attrName)) { // 判断是否为指令 v-xxx
                var value = item.value; // 本例中为 content
                var dir = attrName.substring(2); // 提取属性的v-后面的关键字 本例中为 text

                if(_this.isEventDirective(dir)) { // 事件指令 如 v-on:click
                    compileUtil.eventHandler(node, _this.$vm, value, dir)
                } else {
                    // 普通指令
                    compileUtil[dir] && compileUtil[dir](node, _this.$vm, value); // 这里只处理了v-model
                }
                node.removeAttribute(attrName); // 移除已读取处理过的dom节点上设置的属性
            }
        })
    },
    compileText: function (node, exp) { // 解析文本
        compileUtil.text(node, this.$vm, exp);
    },
    isDirective: function (attrName) { // 判断是否为指令
        return attrName.indexOf('v-') === 0;
    },
    isEventDirective: function (tmp) { // 判断是否为事件指令
        return tmp.indexOf('on') === 0;
    },
    isElementNode: function (node) { // 判断是否为元素节点
        return node.nodeType === 1;
    },
    isTextNode: function (node) { // 判断是否为文本内容
        return node.nodeType === 3;
    }
};

// 指令处理方法
var compileUtil = {
    text: function (node, vm, exp) { // 文本解析
        this.bind(node, vm, exp, 'text')
    },
    model: function (node, vm, value) { // model指令解析
        this.bind(node, vm, value, 'model');
        var _this = this;
        var val = this.nfuva // 读取属性的值

        node.addEventListener('input', function (e) { // 为input输入框添加监听事件，value值发生变化时触发
            var newValue = e.target.value; //

            if(val === newValue) {
                return ;
            }
            _this._setVMVal(vm, value, newValue);
            val = newValue;

        })
    },
    // 监听数据、绑定更新函数的处理是在compileUtil.bind()这个方法中，
    // 通过new Watcher()添加回调来接收数据变化的通知
    bind: function (node, vm, exp, tmp) {
        var updaterFn = updater[tmp + 'Updater'];
        // 第一次初始化视图
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, function (value, originalValue) {
            // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, originalValue);
        })
    },
    eventHandler: function (node, vm, exp, tmp) { // 事件指令处理方法
        var eventType = tmp.split(':')[1]; // 事件指令绑定的方法名 v-on:click中的click
        var fun = vm.$options.methods && vm.$options.methods[exp]; // 绑定的方法

        if(eventType && fun) {
            node.addEventListener(eventType, fun.bind(vm), false); // 给元素添加监听事件，即绑定的事件
        }
    },
    _getVMVal: function (vm, exp) { // 读取属性的值
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function (item) {
            val = val[item];
        });
        return val;
    },
    _setVMVal: function (vm, exp, value) { // 设置属性的值
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function (item, index) { // 遍历子属性
            if(index < exp.length-1) {
                val = val[item];
            } else {
                val[item] = value;
            }

        });

    }
};
// 更新函数
var updater = {
    textUpdater: function (node, value) { // 文本内容更新
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater: function (node, value, originValue) { // model指令绑定的属性值更新
        node.value = typeof value == 'undefined' ? '' : value;
    }

};
