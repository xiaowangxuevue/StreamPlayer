export function getDOMPoint(dom:HTMLElement):{x:number,y:number}{
    let l = 0;
    let t = 0;
    // 判断是否有父容器，如果存在则累加其边距
    while(dom !== document.body){
        t +=dom.offsetTop // 累加父容器上边距
        l +=dom.offsetLeft //left
        dom = dom.parentNode as HTMLElement;
    }
    console.log(l,t,'xy');
    
    return {x:l,y:t}
}