import { Node, ComponentItem, DOMProps, Player } from "../../index";
import { Component } from "../../class/Component";
import "./toolbar.less";
export declare class ToolBar extends Component implements ComponentItem {
    readonly id: string;
    props: DOMProps;
    player: Player;
    private timer;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
    private hideToolBar;
    private showToolBar;
    onShowToolBar(e: MouseEvent): void;
    onHideToolBar(e: MouseEvent): void;
}
