import { Node,ComponentItem,DOMProps,Player,Progress,Controller,} from "../../index";
import { Component } from "../../class/Component";
import { storeControlComponent } from "../../utils/store";
import { addClass, includeClass, removeClass } from "../../utils/domUtils";
import "./toolbar.less";
// ComponentItem用于描述一个组件
// export interface ComponentItem {
//   id: string;
//   el: HTMLElement;
//   props?: DOMProps;
//   [props:string]:any;
// }
// 视频播放器的工具栏组件   toolbar class 符合componentitem 接口规范,
export class ToolBar extends Component implements ComponentItem {
    readonly id:string = 'Toolbar';
    props:DOMProps;
    player:Player;
    progress:Progress;
    controller:Controller;
    status: "show" | "hidden" = "hidden"
    private timer:number = 0;
    // 先初始化播放器的默认样式，暂时不考虑用户自定义样式
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]){
      super(container,desc,props,children);
      this.player = player;
      this.props = props || {};
      this.initEvent()
      this.init()
    }
    init(){
      this.initTemplate();
      this.initEvent();
      this.initComponent()
      storeControlComponent(this)
    }

    initComponent(){
      this.progress = new Progress(this.player,this.el,"div.video-progress");
      this.controller = new Controller(this.player,this.el,"div.video-play")
    }

    initTemplate(){
      addClass(this.el,["video-controls","video-controls-hidden"]);
    }

    initEvent(){
      this.player.on("showtoolbar",(e)=>{
        this.onShowToolBar(e)
      })
      this.player.on("hidetoolbar",(e)=>{
        this.onHideToolBar(e)
      })
    }


    private hideToolBar() {
      if(!includeClass(this.el,"video-controls-hidden")) {
        addClass(this.el,["video-controls-hidden"]);
        this.status = "hidden"
      }
    }
  
    private showToolBar(e:MouseEvent) {
      if(includeClass(this.el,"video-controls-hidden")) {
        removeClass(this.el,["video-controls-hidden"]);
        this.status = "show"
      }
  
      if(e.target === this.player.video) {
        this.timer = window.setTimeout(()=>{
          this.hideToolBar();
        },3000)
      }
    }
  
    onShowToolBar(e:MouseEvent) {
      if(this.timer) {
        window.clearTimeout(this.timer);
        this.timer = null;
      }
      this.showToolBar(e);
    }
  
    onHideToolBar(e:MouseEvent) {
      this.hideToolBar();
    }
  }