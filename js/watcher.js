// 可以收到属性的变化通知并执行相应的函数，从而更新视图。
function Watcher(vm, expFn, cb) {
    this.vm = vm;
    this.expFn = expFn;
    this.cb = cb;
    this.depIds = {};

    if (typeof expFn === 'function') {
        this.getter = this.expFn;
    } else {
        this.getter = this.parseGetter(expFn); // 从getter中解析出function
    }

    this.value = this.get();
}

Watcher.prototype = {
    watchRun: function(){
        var originalValue = this.value; // 更新前属性的值
        var value = this.get(); // 更新后属性的值

        if (originalValue !== value) {
            this.value = value;
            this.cb.call(this.vm, value, originalValue); // 属性发生变化时，更新属性
        }
    },
    update: function() {
        this.watchRun();
    },
    addDep: function(dep) { // 添加订阅器的方法
        if(!this.depIds.hasOwnProperty(dep.id)) {
            dep.addArr(this);
            this.depIds[dep.id] = dep;
        }
    },
    get: function() {
        Dep.target = this; // 将当前订阅者指向自己
        var value = this.getter.call(this.vm, this.vm); // 将自己添加到属性订阅器中 
        Dep.target = null; // 添加完毕后，释放闭包中的变量
        return value; // 返回从订阅器中获取的属性最新值
    },
    parseGetter: function(exp) {
        if (/[^\w.$]/.test(exp)) return;
        exp = exp.split('.');

        return function (obj) {
            for(var i = 0; i < exp.length; i++) {
                if(!obj) return;
                obj = obj[exp[i]];
            }
            return obj;
        }
    }
}