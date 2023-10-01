import { Options } from "./Options";
import { Player } from "../../../page/player";
import { storeControlComponent } from "../../../utils/store";
import { DOMProps, Node } from "../../../types/Player";
import { $, addClass } from "../../../utils/domUtils";
/**
 * @description 播放速率的类
 */
export class Playrate extends Options {
    readonly id = "Playrate";
    readonly playrateArray = ["0.5","0.75","1.0","1.25","1.5","2.0"]
    constructor(player: Player,container: HTMLElement, desc?: string, props?: DOMProps,children?: Node[]) {
        super(player,container,0,0,desc);
        this.init();
    }

    init() {
        this.initTemplate()
        this.initEvent()
        storeControlComponent(this)
    }

    initTemplate() {
        this.el["aria-label"] = "播放倍速"
        addClass(this.el,["video-playrate","video-controller"])

        this.el.removeChild(this.iconBox);
        this.iconBox = $("span",null,"倍速");
        this.el.appendChild(this.iconBox);

        this.el.removeChild(this.hideBox);
        // this.hideBox = $("ul",{style:{"display":"none"},"aria-label":"播放速度调节"});
        addClass(this.hideBox,["video-playrate-set"]);
        this.el.appendChild(this.hideBox);

        for(let i = this.playrateArray.length-1;i>=0;i--) {
            let li = $("li");
            li.innerText = `${this.playrateArray[i]}x`;
            if(this.playrateArray[i] === "1.0"){
                li.style.color = "#007aff"
            }
            this.hideBox.appendChild(li);
        }
    }   

}