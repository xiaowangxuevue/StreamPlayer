//  定义了一个构造函数的模板，可以用于创建不同类型的对象。
export interface BaseConstructor<T> {
    new(content:object,...args:any[]):T;
    name:string
}