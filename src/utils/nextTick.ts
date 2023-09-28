// 检查是不是原生的函数
function isNative(Ctor:any) {
    return typeof Ctor === 'function' && /navite code/.test(Ctor.toString())
}

export function nextTick(cb:(...args)=>any) {
    if(typeof Promise !== 'undefined' && isNative(Promise)) {
        Promise.resolve().then(cb())
    }else if (typeof MutationObserver !== "undefined"
    && isNative(MutationObserver)
    && MutationObserver.toString() === '[object MutationObserverConstructor]' 
    ){
        let observer = new MutationObserver(cb);
        let count = 1;
        let node = document.createTextNode(String(count));
        //是否监听文本节点内容的变化
        observer.observe(node,{
            characterData:true
        })
        count++;
        node.data = String(count);
    }else if(typeof setImmediate !== "undefined" && isNative(setImmediate)){
        setImmediate(()=>cb());
    }else {
        setTimeout(()=>cb())
    }
}