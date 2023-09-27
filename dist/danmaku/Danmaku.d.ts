import { DanmakuData } from "../types/danmaku";
/**
 *
 * @description 弹幕类
 */
export declare class Danmaku {
    private queue;
    private moovingQueue;
    private container;
    private timer;
    private rennderInterval;
    private trackHeight;
    private tracks;
    private defaultDanma;
    constructor(queue: DanmakuData[], container: HTMLElement);
    init(): void;
    addData(data: any): void;
    parseData(data: any): DanmakuData;
    render(): void;
    renderEnd(): void;
    renderToDOM(): void;
    addDataToTrack(data: DanmakuData): void;
    removeDataFromTrack(data: DanmakuData): void;
    startAnimate(data: DanmakuData): void;
    flush(): void;
    disCard(start: number, end: number): void;
}
