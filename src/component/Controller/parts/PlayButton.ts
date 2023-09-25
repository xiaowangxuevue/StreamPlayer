import { Component } from "../../../class/Component"
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps,Node } from "../../../types/Player";
import { createSvg } from "../../../utils/domUtils";
import { pausePath,playPath } from "../path/defaultPath";
export class PlayButton extends Component implements ComponentItem {
    readonly id = "PlayButton";
    props: DOMProps;
    player: Player;
    private pauseIcon:SVGSVGElement | string;
    private playIcon:SVGSVGElement | string;
    private button : SVGSVGElement;

    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container,desc,props,children);
        this.player = player;
        this.init()
    }

    init() {
       this.initTemplate()
       this.initEvent()
    }

    initTemplate(){
        // 创建一个playicon
        this.playIcon  = createSvg(playPath)
        this.pauseIcon = createSvg(pausePath)
        this.button = this.playIcon as SVGSVGElement;
        this.el.appendChild(this.button)
    }


    initEvent(){
        this.player.on("play",(e:Event) => {
            this.el.removeChild(this.button);
            this.button =  this.pauseIcon as SVGSVGElement;
            this.el.appendChild(this.button);
        })
        this.player.on("pause",(e:Event) => {
            this.el.removeChild(this.button);
            this.button =  this.playIcon as SVGSVGElement;
            this.el.appendChild(this.button);
        })

        this.el.onclick = (e) => {
            console.log(this.el,'el');
            
            if(this.player.video.paused) {
                console.log('test1');
                
                this.player.video.play();
            } else {

                console.log('test2');
                
                this.player.video.pause();
            }
        }
    }
}