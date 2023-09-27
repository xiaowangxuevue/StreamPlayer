import { Options } from "./Options";
import { Player } from "../../../page/player";
import { VolumeCompletedProgress } from "./VolumeCompletedProgress";
import { DOMProps, Node } from "../../../types/Player";
export declare class Volume extends Options {
    readonly id = "Volume";
    volumeProgress: HTMLElement;
    volumeShow: HTMLElement;
    volumeCompleted: VolumeCompletedProgress;
    icon: SVGSVGElement;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
}
