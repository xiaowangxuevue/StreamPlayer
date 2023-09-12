import { BaseEvent } from "../../index";
import "./toolbar.less";
export declare class ToolBar extends BaseEvent {
    private template_;
    private progress;
    private controller;
    private container;
    private video;
    private timer;
    constructor(container: HTMLElement);
    get template(): HTMLElement;
    init(): void;
    showToolBar(e: MouseEvent): void;
    hideToolBar(): void;
    initComponent(): void;
    initTemplate(): void;
    initEvent(): void;
}
