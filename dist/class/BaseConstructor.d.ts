export interface BaseConstructor<T> {
    new (content: object, ...args: any[]): T;
    name: string;
}
