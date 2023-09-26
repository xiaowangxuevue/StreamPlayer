import { ComponentItem, DOMProps, Node, registerOptions,getFunctionParametersType } from "../types/Player";
export function getDOMPoint(dom:HTMLElement):{x:number,y:number} {
    var t = 0; 
    var l = 0; 
    //判断是否有父容器，如果存在则累加其边距
    while (dom !== document.body) {
        t += dom.offsetTop; //叠加父容器的上边距
        l += dom.offsetLeft; //叠加父容器的左边距
        //if(dom.style.borderLeftWidth) l += Number(dom.style.borderLeftWidth);
        //if(dom.style.borderTopWidth) t += Number(dom.style.borderTopWidth);
        dom = dom.parentNode as HTMLElement;
    }
    return {x:l,y:t};
}

/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent 
 * @param topChild 
 * @param pageX 
 * @param pageY 
 * @returns {boolean}
 */
export function checkIsMouseInRange(parent:HTMLElement,topChild:HTMLElement,pageX:number,pageY:number) {
    let {x,y} = getDOMPoint(parent);
    let allTop = y - parseInt(topChild.style.bottom) - topChild.clientHeight;
    let allBottom = y + parent.clientHeight;
    let allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2);
    let allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2);
    let parentLeft = x;
    let parentRight = x + parent.clientWidth;
    if(pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop) return true;
    if(pageX >= parentLeft - 5 && pageX <= parentRight + 5  && pageY >= y && pageY <= allBottom) return true;
    return false;
}

const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;

/**
 * @description 根据desc的标签描述和props的属性描述来创建一个DOM对象，并且在实例上挂载各种属性
 * @param {string} desc 
 * @param {DOMProps} props 
 * @param {Node[]} children 
 * @returns 
 */


export function $<T extends HTMLElement>(
    desc?: string,
    props?: DOMProps,
    children?: string | Array<Node>
):T {
    let match = [];
    let regArray = SELECTOR_REG.exec(desc)
    match[0] = regArray[1] || undefined;
    match[1] = regArray[2] || undefined;
    match[2] = regArray[3] || undefined;
    let el: HTMLElement = match[0] ? document.createElement(match[0]) : document.createElement("div");
    if(match[1]) {
        el.id = match[1];
    }
    match[2] && addClass(el,[match[2]]);
    for(let key in props) {
        if(typeof props[key] === "object") {
            if(key === "style") {
                let str = ""
                let styles = props[key];
                for(let k in styles) {
                    str += `${k}: ${styles[k]};`
                }
                el.setAttribute("style",str);
            } else {}
        } else {
            el.setAttribute(key,String(props[key]));
        }
    }
    if(typeof children === "string") {
        el.innerHTML += children;
    } else if(children){
        for(let child of children) {
            el.appendChild(child.el);
        }
    }
    return el as T;
}
/**
 * @description 根据传入的字符串获取对应的DOM元素
 * @param dom 
 * @returns {HTMLElement | null}
 */
export function getEl(dom: HTMLElement | string ): HTMLElement | null  {
    if(dom instanceof HTMLElement) return dom;
    if(typeof dom === "string") {
        return document.querySelector(dom);
    }
}

export function addClass(dom:HTMLElement,classNames:Array<string>) {
    let classList = dom.classList;
    for(let name of classNames) {
        if(!includeClass(dom,name)) {
            classList.add(name);
        }
    }
}

export function removeClass(dom:HTMLElement,classNames:Array<string>) {
    let classList = dom.classList;
    classList.remove(...classNames);
} 

export function changeClass(dom:HTMLElement,className) {
    dom.className = className;
}

export function includeClass(dom:HTMLElement,className:string): boolean {
    let classList = dom.classList;
    for(let key in classList) {
        if(classList[key] === className) return true;
    }
    return false;
}

export function getElementSize(
    dom: HTMLElement,
): { width: number; height: number } {
    const clone = dom.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.opacity = '0';
    clone.removeAttribute('hidden');

    const parent = dom.parentNode || document.body;

    parent.appendChild(clone);

    const rect = clone.getBoundingClientRect();

    parent.removeChild(clone);

    return rect;
}

const svgNS = 'http://www.w3.org/2000/svg';

export function createSvg(d?: string, viewBox = '0 0 1024 1024'): SVGSVGElement {
  const svg = document.createElementNS(svgNS, 'svg'); //创建带有命名空间的元素节点
  svg.setAttribute('viewBox', viewBox);
  if (d) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttributeNS(null, 'd', d);
    svg.appendChild(path);
  }
  return svg;
}

export function setSvgPath(svg:SVGSVGElement,d:string) {
    const path = svg.getElementsByTagNameNS(svgNS, "path")[0];
    path.setAttributeNS(null, "d", d);
}

export function createSvgs(d:string[],viewBox = '0 0 1024 1024'):SVGSVGElement {
    const svg = document.createElementNS(svgNS,'svg')
    svg.setAttribute('viewBox',viewBox);
    for(let key of d){
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', key);
        svg.appendChild(path);
    }

    return svg;
}

/**
 * 
 * @description 合并两个组件的实例对象
 * @param target
 * @param another
 */

export function patchComponent(
    target:ComponentItem,
    another:Partial<ComponentItem>,
    options:registerOptions = {replaceElementType:"replaceOuterHTMLOfComponent"}
) {
    if(target.id !== another.id) throw new Error("需要合并的两个组件id不相同");
    for(let key in target) {
        if(another.hasOwnProperty(key)) {
            if(key === 'props') {
                patchDOMProps(target[key],another[key],target.el);
            } else if(key === 'el') {
                if(options.replaceElementType === "replaceOuterHTMLOfComponent") {
                    target.el = another.el;
                } else {
                    for(let child of target.el.childNodes) {
                        target.el.removeChild(child);
                    }
                    target.el.appendChild(another.el);
                }
            } else {
                if(target[key] instanceof Function) {
                    if(!(another[key] instanceof Function)) {
                        throw new Error(`属性${key}对应的值应该为函数类型`);
                    }
                    patchFn(target[key],another[key],target);
                } else if(target[key] instanceof HTMLElement) {
                    if(!(another[key] instanceof HTMLElement) && typeof another[key] !== 'string') {
                        throw new Error(`属性${key}对应的值应该为DOM元素或者字符串类型`);
                    }
                    if(typeof another[key] === 'string') {
                        
                        
                    } else {
                        (target[key] as HTMLElement).parentNode?.insertBefore(another[key],target[key]);
                        (target[key] as HTMLElement).parentNode?.removeChild(target[key]);
                        target[key] = another[key];
                    }
                    
                }
            }
        } 
        
    }
}

export function patchDOMProps(targetProps: DOMProps,anotherProps:DOMProps,el:HTMLElement) {
    for(let key in anotherProps) {
        if(targetProps.hasOwnProperty(key)) {
            if(key === 'id') {
                targetProps.id = anotherProps.id;
                el.id = targetProps.id;
            } else if(key === "className") {
                targetProps.className.concat(anotherProps.className);
                addClass(el,anotherProps.className);
            } else if(key === "style") {
                patchStyle(targetProps.style,anotherProps.style,el);
            }
        } else {
            targetProps[key] = anotherProps[key];
            if(key !== "style") { 
                el[key] = anotherProps[key];
            } else if(key === "style") {
                for(let prop in anotherProps['style']) {
                    el.style[prop] = anotherProps['style'][prop];
                }
            }
        }
    }
}

export function patchStyle(
    targetStyle: Partial<CSSStyleDeclaration>,
    anotherStyle: Partial<CSSStyleDeclaration>,
    el: HTMLElement
) {
    for(let key in anotherStyle) {
        targetStyle[key] = anotherStyle[key];
    } 
    for(let key in targetStyle) {
        el.style[key] = targetStyle[key];
    }
}

export function patchFn<T extends (...args:any[]) => any>(targetFn: T,another : T, context: ComponentItem) {
    let args = targetFn.arguments;
    function fn(...args: getFunctionParametersType<T>[]) {
        targetFn.call(context,...args);
        another.call(context,...args);
    }

    targetFn = fn as T;
}