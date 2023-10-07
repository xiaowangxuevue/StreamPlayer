import { MoveEvent, SingleTapEvent } from "ntouch.js";
import { Component } from "../../class/Component";
import { EVENT } from "../../events";
import {
  Node,
  ComponentItem,
  DOMProps,
  Controller,
  Progress
} from "../../index";
import { addClass, includeClass, removeClass } from "../../utils/domUtils";
import { storeControlComponent } from "../../utils/store";
import "./toolbar.less";
import { Player } from "../../page/player";
export class ToolBar extends Component implements ComponentItem {
  readonly id: string = "Toolbar";
  props: DOMProps;
  player: Player;
  progress: Progress;
  controller: Controller;
  status: "show" | "hidden" = "hidden";
  private timer: number = 0;
  // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
  constructor(player:Player, container:HTMLElement, desc?: string, props?:DOMProps, children?:Node[]) {
    super(container,desc,props,children);
    this.player = player;
    this.props = props || {};
    this.init();
  }

  init() {
    this.initTemplate();
    this.initComponent();
    this.initEvent();
    storeControlComponent(this);
  }

  /**
   * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
   */
  initTemplate() {
    addClass(this.el,["video-controls","video-controls-hidden"]);
  }

  initComponent() {
    this.progress = new Progress(this.player,this.el,"div.video-progress");
    this.controller = new Controller(this.player,this.el,"div.video-play");
  }

  initEvent() {
    this.player.on(EVENT.SHOW_TOOLBAR, (e: SingleTapEvent | Event | MoveEvent)=>{
      this.onShowToolBar(e);
    })

    this.player.on(EVENT.HIDE_TOOLBAR, ()=>{
      this.onHideToolBar();
    })
  }

  private hideToolBar() {
    if(!includeClass(this.el,"video-controls-hidden")) {
      addClass(this.el,["video-controls-hidden"]);
      this.status = "hidden";
    }
  }

  private showToolBar(e: Event | SingleTapEvent | MoveEvent) {
    if(includeClass(this.el,"video-controls-hidden")) {
      removeClass(this.el,["video-controls-hidden"]);
      this.status = "show";
    }
    let target;
    if(e instanceof Event) target = e.target;
    else target = (e as (SingleTapEvent | MoveEvent)).e.target;

    if(target === this.player.video && this.player.env === "PC") {
      this.timer = window.setTimeout(()=>{
        this.hideToolBar();
      },3000)
    }
  }

  onShowToolBar(e: Event | SingleTapEvent | MoveEvent) {
    if(this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.showToolBar(e);
  }

  onHideToolBar() {
    this.hideToolBar();
  }
}
