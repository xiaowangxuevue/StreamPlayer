export type FactoryFunction<T> = (content?: object) => {
    create?: (...args: any[]) => T;
    getInstance?: (...args: any[]) => T;
};
export type FactoryObject = {
    [props: string]: any;
};
