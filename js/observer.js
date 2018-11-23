// 监听器：劫持并监听所有属性，如果有变动的，就通知订阅者Watcher，看是否需要更新
function Observer(data) {
    this.data = data;
    this.run(data);
}
Observer.prototype = {
    defineReactive: function(data, key, value) {
        var obj = observer(value); //如果data中的属性是一个对象通过递归方法，监听子属性
        var dep = new Dep(); // new 消息订阅器Dep实例，负责维护一个数组，用来收集订阅者，数据变动触发notify，再调用订阅者的update方法，

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {
                // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
                // JS的浏览器单线程特性，保证这个全局变量在同一时间内，只会有同一个监听器使用
                if(Dep.target) { // 代码中有一个Dep.target值，这个值时用来区分是普通的get还是收集依赖时的get 判断是否需要添加订阅者
                    dep.depend(); // 在这里添加一个订阅者
                }
                return value;
            },
            set: function(newVal) {
                if (value === newVal) {
                    return;
                }
                value = newVal;
                obj = observer(value); // 新的值是object的话，进行监听
                dep.notify(); // 如果数据变化，通知所有订阅者
            }
        })
    },
    convert: function(key, value) {
        this.defineReactive(this.data, key, value);
    },
    run: function (data) {
        var _this = this;
        // Object.keys():返回一个数组,成员是参数对象自身的(不含继承的)所有可遍历(enumerable)属性的键名
        Object.keys(data).forEach(function (key) { // 遍历data中的所有属性
            _this.convert(key, data[key]); // 为每个属性添加数据劫持方法 即defineReactive
        });
    },
}
function observer(data, vm) { // 遍历所有子属性
    if (!data || typeof data !== 'object') {
        return;
    }
    return new Observer(data); // run函数
}

var uid = 0;
// 消息订阅器Dep：专门收集属性相关的订阅者，然后在监听器Observer和订阅者Watcher之间进行统一管理
function Dep() { // 属性订阅器
    this.id = uid++;
    this.subs = []; // 数组 存储属性 用来收集订阅者，数据变动触发notify，再调用订阅者的update方法
}
Dep.prototype = {
    addSub: function(sub) { // 负责向订阅器Dep中添加属性
        this.subs.push(sub);
    },
    depend: function() { 
        Dep.target.addDep(this); // 添加订阅器
    },
    notify: function() { // 如果数据有变化 通知所有订阅者
        this.subs.forEach(function(sub){
            sub.update(); //更新属性
        })
    }
}
Dep.target = null; // 定义全局变量暂存watcher

