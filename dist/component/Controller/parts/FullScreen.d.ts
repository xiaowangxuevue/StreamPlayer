import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { Options } from "./Options";
export declare class FullScreen extends Options {
    readonly id = "FullScreen";
    player: Player;
    props: DOMProps;
    icon: SVGSVGElement;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
    onClick(e: MouseEvent): void;
}
