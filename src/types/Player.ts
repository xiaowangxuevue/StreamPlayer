import { Player } from "../page/player"
export type PlayerOptions = {
    url: string;
    container: HTMLElement;
    autoplay?:boolean;
    width?:string;
    height?:string;  
}


export type DOMProps = {
    className?:string[] 
    id?:string;
    style?:Partial<CSSStyleDeclaration>;
    [props:string]:any;
}

// ComponentItem用于描述一个组件
export interface ComponentItem {
    id: string;
    el: HTMLElement;
    props: DOMProps;
    [props:string]:any;
}

export interface Node {
    id:string;
    el:HTMLElement;
}

export type  Plugin = {
    install:(player:Player) => any;
}

export type registerOptions = {
    replaceElementType?:"replaceOuterHTMLOfComponent" | "replaceInnerHTMLOfComponent"
}
//提取出函数参数类型

// infer 关键字用于捕获参数列表中的每个参数的类型。
export type getFunctionParametersType<T extends (...arg:any[]) => any> = T extends (...args:(infer T)[]) => infer U ? T : never;