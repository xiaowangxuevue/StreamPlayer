import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentConstructor, ComponentItem, DOMProps,Node, PlayerOptions } from "../../types/Player";
import { $, } from "../../utils/domUtils";
import { storeControlComponent,controllersMapping } from "../../utils/store";
import "./controller.less";
import { DutaionShow } from "./parts/DurationShow";
import { VideoShot } from "./parts/VideoShot";
import {FullPage} from "./parts/FullPage"
import { PlayButton } from "./parts/PlayButton";
import { Volume } from "./parts/Volume";
import { FullScreen } from "./parts/FullScreen";
import { ScreenShot } from "./parts/ScreenShot";
import { PicInPic } from "./parts/PicInPic";
import { SubSetting } from "./parts/SubSetting";
import { Playrate } from "./parts/Playrate";
export class Controller extends Component implements ComponentItem {
  readonly id = "Controller";
  leftArea: HTMLElement;
  mediumArea: HTMLElement;
  rightArea: HTMLElement;
  props: DOMProps={};
  player: Player;
  // 控件
  // playButton: PlayButton;
  // volume:Volume;
  // FullScreen:FullScreen;
  // playrate: Playrate;
  leftControllers: ComponentConstructor[] = [PlayButton,Volume,DutaionShow];
  rightController: ComponentConstructor[] = [Playrate,SubSetting,VideoShot,ScreenShot,PicInPic,FullPage,FullScreen]
  constructor(player:Player,container:HTMLElement, desc?:string,props?:DOMProps,children?:Node[]) {
    super(container,desc,props,children);
    this.player = player;
    this.init();
  }

  init() {
    this.initControllers()
    this.initTemplate();
    this.initComponent();
    storeControlComponent(this)
  }
  initControllers(){
    console.log(this.player.playerOptions,'oop');
    

    let leftControllers = (this.player.playerOptions as PlayerOptions).leftControllers
    let rightControllers = (this.player.playerOptions as PlayerOptions).rightControllers
    console.log(rightControllers,'rightControllers');
    
    if(leftControllers) {
      this.leftControllers = leftControllers.map(item=>{
        if(typeof item === 'string') {
          if(!controllersMapping[item]) {
            throw new Error(`传入的组件名${item}错误`);
          }
          return controllersMapping[item];
        } else {
          return item;
        }
      })
    } 
    if(rightControllers) {
      this.rightController = rightControllers.map(item=>{
        if(typeof item === 'string') {
          if(!controllersMapping[item]) {
            throw new Error(`传入的组件名${item}错误`);
          }
          console.log(item,'item');
          
          return controllersMapping[item];
        } else {
          return item;
        }
      })
      console.log(this.rightController)
    }
  } 
  initTemplate() {
    this.leftArea = $("div.video-subplay");
    this.mediumArea = $("div.video-medium")
    this.rightArea = $("div.video-settings");
    this.el.appendChild(this.leftArea);
    this.el.appendChild(this.mediumArea);
    this.el.appendChild(this.rightArea);
  }

  initComponent() {
    // this.playButton = new PlayButton(this.player,this.subPlay,"div");
    // this.playrate = new Playrate(this.player,this.settings,"div")
    // this.volume = new Volume(this.player,this.settings,"div");
    // // 给元素添加类名
    // this.FullScreen = new FullScreen(this.player,this.settings,"div")

    this.leftControllers.forEach(ControlConstructor => {
      let instance = new ControlConstructor(this.player,this.leftArea,"div")
      this[instance.id] = instance;
    })


    this.rightController.forEach(ControlConstructor => {
      let instance = new ControlConstructor(this.player,this.rightArea,"div");
      this[instance.id] = instance;
    })
    
  }
  initEvent() {
    this.player.on("danmaku-plugin-add",()=>{

    })
  }
  // private template_: HTMLElement | string;
  // private container: HTMLElement;
  // private video: HTMLVideoElement;
  // private videoPlayBtn: HTMLElement;
  // private currentTime: HTMLElement;
  // private summaryTime: HTMLElement;
  // // 相关的功能元素
  // private fullScreen: HTMLElement;
  // private volumeBtn: HTMLElement;
  // private volumeSet: HTMLElement;
  // private volumeDot: HTMLElement;
  // private volumeProgress: HTMLElement;
  // private volumeCompleted: HTMLElement;
  // private playRate: HTMLElement;
  // private playRateSet: HTMLElement;
  // private resolvePower: HTMLElement;
  // private resolvePowerSet: HTMLElement;
  // private settings: HTMLElement;
  // constructor(container: HTMLElement) {
  //   super();
  //   this.container = container;
  //   this.init();
  //   this.initEvent();
  // }

  // get template(): HTMLElement | string {
  //   return this.template_;
  // }

  // init() {
  //   this.template_ = `
  //       <div class="${styles["video-play"]}">
  //           <div class="${styles["video-subplay"]}">
  //               <div class="${styles["video-start-pause"]}">
  //                   <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
  //               </div>
  //               <div class="${styles["video-duration"]}">
  //                   <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
  //               </div>
  //           </div>
  //           <div class="${styles["video-settings"]}">
  //               <div class="${styles["video-resolvepower"]} ${styles["video-controller"]}" aria-label="分辨率">
  //                   分辨率
  //                   <ul class="${styles["video-resolvepower-set"]}" style="display:none;bottom:41px">
  //                     <li><span>1080p超清</span></li>
  //                     <li><span>720p高清</span></li>
  //                     <li><span>480p标清</span></li>
  //                     <li><span>360p流畅</span></li>
  //                     <li><span>自动</span></li>
  //                   </ul>
  //               </div>
  //               <div class="${styles["video-playrate"]} ${styles["video-controller"]}" aria-label="倍速">
  //                   倍速
  //                   <ul class="${styles["video-playrate-set"]}" aria-label="调节播放速度" style="display:none; bottom:41px">
  //                     <li>2.0x</li>
  //                     <li>1.5x</li>
  //                     <li>1.25x</li>
  //                     <li>1.0x</li>
  //                     <li>0.75x</li>
  //                     <li>0.5x</li>
  //                   </ul>
  //               </div>
  //               <div class="${styles["video-volume"]} ${styles["video-controller"]}" aria-label="音量">
  //                   <div class="${styles["video-volume-set"]}" aria-label="调节音量" style="display:none; bottom:41px" >
  //                     <div class="${styles["video-volume-show"]}">48</div>
  //                     <div class="${styles["video-volume-progress"]}" style="height: 70px">
  //                       <div class="${styles["video-volume-completed"]}" style="height: 0"></div>
  //                       <div class="${styles["video-volume-dot"]}" style="bottom: 100%"></div>
  //                     </div>
  //                   </div>
  //                   <div class="${styles["video-icon"]}">${volumeSVG}</div>
  //               </div>
  //               <div class="${styles["video-subsettings"]} ${styles["video-controller"]}" aria-label="设置">
  //                 <div class="${styles["video-icon"]}">${settingSVG}</div>
  //               </div>
  //               <div class="${styles["video-fullscreen"]} ${styles["video-controller"]}" aria-label="全屏">
  //                 <div class="${styles["video-icon"]}">${fullScreenSVG}</div>  
  //               </div>
  //           </div>
  //       </div>
  //   `;
  // }

  // initControllerEvent() {
  //   this.volumeCompleted.style.height = this.video.volume * 100 + "%";
  //   this.volumeDot.style.bottom = 
  //     parseInt(this.volumeProgress.style.height) * this.video.volume - 6 + "px";

  //   /**
  //    * @description 监听鼠标的点击事件来决定是否暂停还是播放视频
  //    */
  //   this.videoPlayBtn.onclick = (e: MouseEvent) => {
  //     if (this.video.paused) {
  //       this.video.play();
  //     } else if (this.video.played) {
  //       this.video.pause();
  //     }
  //   };

  //   /**
  //    * @description 点击进入全屏模式
  //    */
  //   this.fullScreen.onclick = () => {
  //     if (this.container.requestFullscreen && !document.fullscreenElement) {
  //       this.container.requestFullscreen(); //该函数请求全屏
  //     } else if (document.fullscreenElement) {
  //       document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
  //     }
  //   };
  //   /**
  //    * @desciption 显示音量的设置
  //    * TODO:这部分控制选项的显示和隐藏的逻辑可以复用
  //    */
  //   this.volumeBtn.onmouseenter = (e) => {
  //     this.volumeSet.style.display = "block";
  //     let ctx = this;
  //     document.body.onmousemove = (e:MouseEvent) => {
  //       ctx.handleMouseMove(e,"volume");
  //     }
  //   }

  //   this.playRate.onmouseenter = (e) => {
  //     this.playRateSet.style.display = "block";
  //     let ctx = this;
  //     document.body.onmousemove = (e:MouseEvent) => {
  //       ctx.handleMouseMove(e,"playrate");
  //     }
  //   }

  //   this.resolvePower.onmouseenter = (e) => {
  //     this.resolvePowerSet.style.display = "block";
  //     let ctx = this;
  //     document.body.onmousemove = (e:MouseEvent) => {
  //       ctx.handleMouseMove(e,"resolvepower");
  //     }
  //   }
  //   // this.volumeProgress.onclick = (e:MouseEvent) => {
  //   //   console.log(e.offsetY,this.volumeProgress.clientHeight)
  //   //   let offsetY = this.volumeProgress.clientHeight - e.offsetY;
  //   //   let scale = offsetY / this.volumeProgress.clientHeight;
  //   //   if (scale < 0) {
  //   //     scale = 0;
  //   //   } else if (scale > 1) {
  //   //     scale = 1;
  //   //   }
  //   //   this.volumeCompleted.style.height = scale * 100 + "%"
  //   //   this.volumeDot.style.bottom = this.volumeProgress.clientHeight * scale - 6 + "px";
  //   // }

  //   this.volumeDot.onmousedown = (e:MouseEvent) => {
  //     let mouseY = e.pageY;
  //     let comHeight = this.volumeCompleted.clientHeight;
  //     document.onmousemove = (e:MouseEvent) => {
  //       let pageY = e.pageY;
  //       let scale = (mouseY - pageY + comHeight) / this.volumeProgress.clientHeight;
  //       if(scale > 1) scale = 1;
  //       else if(scale < 0) scale = 0;
  //       this.volumeCompleted.style.height = scale * 100 + "%";
  //       this.volumeDot.style.bottom = this.volumeProgress.clientHeight * scale - 6 + "px";
  //       this.video.volume = scale;
  //     }
  //     document.onmouseup = () => {
  //       document.onmousemove = null;
  //     }
  //     e.preventDefault();
  //   }
  // }

  // initEvent() {
  //   this.on("play", () => {
  //     this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
  //   });

  //   this.on("pause", () => {
  //     this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
  //   });

  //   this.on("loadedmetadata", (summary: number) => {
  //     this.summaryTime.innerHTML = formatTime(summary);
  //   });

  //   this.on("timeupdate", (current: number) => {
  //     this.currentTime.innerHTML = formatTime(current);
  //   });

  //   /**
  //    * @description 模板字符已经渲染到页面上，可以获取DOM元素了
  //    */
  //   this.on("mounted", () => {
  //     this.videoPlayBtn = this.container.querySelector(
  //       `.${styles["video-start-pause"]} i`
  //     );
  //     this.currentTime = this.container.querySelector(
  //       `.${styles["video-duration-completed"]}`
  //     );
  //     this.summaryTime = this.container.querySelector(
  //       `.${styles["video-duration-all"]}`
  //     );

  //     this.video = this.container.querySelector("video")!;
  //     this.fullScreen = this.container.querySelector(
  //       `.${styles["video-fullscreen"]}`
  //     );
  //     this.volumeBtn = this.container.querySelector(`.${styles["video-volume"]}`);
  //     this.volumeSet = this.container.querySelector(`.${styles["video-volume-set"]}`);
  //     this.volumeCompleted = this.container.querySelector(`.${styles["video-volume-completed"]}`);
  //     this.volumeProgress = this.container.querySelector(`.${styles["video-volume-progress"]}`);
  //     this.volumeDot = this.container.querySelector(`.${styles["video-volume-dot"]}`);

  //     this.playRate = this.container.querySelector(`.${styles["video-playrate"]}`);
  //     this.playRateSet = this.container.querySelector(`.${styles["video-playrate-set"]}`);

  //     this.resolvePower = this.container.querySelector(`.${styles["video-resolvepower"]}`);
  //     this.resolvePowerSet = this.container.querySelector(`.${styles["video-resolvepower-set"]}`);
  //     this.initControllerEvent();
  //   });
  // }

  // handleMouseMove(e:MouseEvent,type:"volume" | "playrate" | "resolvepower") {
  //   let pX = e.pageX,pY = e.pageY;
  //   let ctx = this;
  //   if(type === "volume") {
  //     if(!checkIsMouseInRange(ctx.volumeBtn,ctx.volumeSet,pX,pY)) {
  //       ctx.volumeSet.style.display = "none"
  //       document.body.onmousemove = null;
  //     }
  //   } else if(type === "playrate") {
  //     if(!checkIsMouseInRange(ctx.playRate,ctx.playRateSet,pX,pY)) {
  //       ctx.playRateSet.style.display = "none";
  //       document.body.onmousemove = null;
  //     }
  //   } else if(type === "resolvepower") {
  //     if(!checkIsMouseInRange(ctx.resolvePower,ctx.resolvePowerSet,pX,pY)) {
  //       ctx.resolvePowerSet.style.display = "none";
  //       document.body.onmousemove = null;
  //       document.onmousemove = null;
  //     }
  //   }
  // }
}