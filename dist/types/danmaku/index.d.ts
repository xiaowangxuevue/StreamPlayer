export type DanmakuData = {
    message: string;
    fontColor?: string;
    fontSize?: number;
    fontFamily?: string;
    dom?: HTMLElement;
    useTracks?: number;
    width?: number;
    totalDistance?: number;
    rollTime?: number;
    rollSpeed?: number;
    startTime?: number;
    timestamp?: number;
    y?: number[];
};
export type Track = {
    id: number;
    priority: number;
};
