import { Component } from "../../../class/Component";
import { EVENT } from "../../../events";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node} from "../../../types/Player";
import { storeControlComponent } from "../../../utils/store";
import { Progress } from "../progress";
export class CompletedProgress extends Component implements ComponentItem {
    readonly id = "CompletedProgress";
    props: DOMProps;
    player: Player;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container, desc, props, children);
        this.props = props || {};
        this.player = player;
        this.init();
    }

    init() {
        this.initEvent();

        storeControlComponent(this);
    }

    initEvent() {
        this.player.on(EVENT.VIDEO_PROGRESS_CLICK, (e:MouseEvent, ctx:Progress)=>{
            this.onChangeSize(e,ctx);
        })

        this.player.on(EVENT.TIME_UPDATE, (e: Event) => {
            if(this.player.enableSeek) {
                this.updatePos(e);
            }
        })
       
        this.player.on(EVENT.DOT_DRAG, (scale: number) => {
            this.el.style.width = scale * 100 + "%";
        })
    }

    onChangeSize(e: MouseEvent,ctx: Component) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }

    updatePos(e: Event) {
        let video = e.target as HTMLVideoElement;
        let scale = video.currentTime / video.duration;
        if(scale < 0) {
            scale = 0;
        } else if(scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}