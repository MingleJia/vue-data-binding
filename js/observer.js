function Observer(data) {
    this.data = data;
    this.run(data);
}
Observer.prototype = {
    defineReactive: function(data, key, value) {
        var obj = observer(value); //通过递归方法遍历所有子属性
        var dep = new Dep(); // new 消息订阅器Dep实例

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {
                if(Dep.target) { // 判断是否需要添加订阅者
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
        Object.keys(data).forEach(function (key) { // 遍历data中的所有属性
            _this.convert(key, data[key]); // 为每个属性添加数据劫持方法
        });
    },
}
function observer(data, vm) { // 遍历所有子属性
    if (!data || typeof data !== 'object') {
        return;
    }
    return new Observer(data);
}
var uid = 0;
function Dep() { // 属性订阅器
    this.id = uid++;
    this.arrs = []; // 存储属性
}
Dep.prototype = {
    addArr: function(arr) { // 负责向订阅器Dep中添加属性
        this.arrs.push(arr);
    },
    depend: function() { 
        Dep.target.addDep(this); // 添加订阅器
    },
    notify: function() { // 如果数据有变化 通知所有订阅者
        this.arrs.forEach(function(arr){
            arr.update(); //更新属性
        })
    }
}
Dep.target = null; // 定义全局变量暂存watcher

