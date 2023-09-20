import { FactoryObject } from "../types/dash/Factory";
/**
 * @description 整个dash处理流程的入口类MediaPlayer,类似与项目的中转中心，用于接收任务然后分配给不同解析器去完成
 */
declare class MediaPlayer {
    private config;
    private urlLoader;
    private eventBus;
    private dashParser;
    private video;
    private buffer;
    private mediaPlayerController;
    private streamController;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initializeEvent(): void;
    resetEvent(): void;
    onManifestLoaded(data: string): void;
    onSegmentLoaded(data: ArrayBuffer[]): void;
    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url
     */
    attachSource(url: string): void;
    attachVideo(video: HTMLVideoElement): void;
}
declare const factory: import("../types/dash/Factory").FactoryFunction<MediaPlayer>;
export default factory;
