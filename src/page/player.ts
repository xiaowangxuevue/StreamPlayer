import {
  ComponentItem,
  DOMProps,
  PlayerOptions,
  RegisterComponentOptions,
  ToolBar,
  UpdateComponentOptions,
} from "../index";
import "./player.less";
import { Component } from "../class/Component";
import { $, patchComponent, addClass, removeClass } from "../utils/domUtils";
import { Plugin } from "../index";
import { ONCE_COMPONENT_STORE, COMPONENT_STORE, HIDEEN_COMPONENT_STORE } from "../utils/store";
import { getFileExtension } from "../utils/play";
import MpdMediaPlayerFactory from "../dash/MediaPlayer";
import Mp4MediaPlayer from "../mp4/MediaPlayer";
import { DanmakuController } from "../danmaku";
import { Loading } from "../component/Loading/Loading";
import { TimeLoading } from "../component/Loading/parts/TimeLoading";
import { ErrorLoading } from "../component/Loading/parts/ErrorLoading";
import { TopBar } from "../component/TopBar/TopBar";
import { subSettingPath } from "../component/Controller/path/defaultPath";
class Player extends Component implements ComponentItem {
  readonly id = "Player";
  // 播放器的默认配置
  readonly playerOptions: PlayerOptions = {
    url: "",
    container: document.body,
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  video: HTMLVideoElement;
  toolBar: ToolBar;
  topbar: TopBar;
  container: HTMLElement;
  props: DOMProps;
  loading: TimeLoading;
  error: ErrorLoading;
  enableSeek = true;
  constructor(options: PlayerOptions) {
    super(options.container, "div.video-wrapper");
    this.playerOptions = Object.assign(this.playerOptions, options);
    options.container.className = "video-container";
    options.container.style.width = this.playerOptions.width;
    options.container.style.height = this.playerOptions.height;
    this.container = options.container;
    this.init();
  }
  init() {
    this.video = $("video");
    this.el.appendChild(this.video);
    this.attachSource(this.playerOptions.url);
    this.initEvent();
    this.initPlugin();
    this.initComponent()
    this.initResizeObserver()

  }

  initComponent(): void {
    //  new DanmakuController(this);
    this.loading = new TimeLoading(this, "视频加载中，请稍等....", this.el);
    this.error = new ErrorLoading(this, "视频加载发送错误", this.el);
    this.toolBar = new ToolBar(this, this.el, "div");
    this.topbar = new TopBar(this, this.el, "div")
  }

  initResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      console.log('监听到了尺寸变化了...');
      // 触发尺寸变化事件
      this.emit("resize", entries);
      let width = entries[0].contentRect.width;
      let SubSetting;
      if (width <= 400) {
        // 默认在小屏幕的情况下只将SubSetting移动到上端，其余在底部注册的控件需要隐藏
        console.log(width, 'width!!!!')
        COMPONENT_STORE.forEach((value, key) => {
          if (["SubSetting"].includes(key)) {
            SubSetting = ONCE_COMPONENT_STORE.get(key)
            this.unmountComponent(key)
          } else if (["Playrate", "SubSetting", "VideoShot", "ScreenShot", "PicInPic"].includes(key)){
            if (!HIDEEN_COMPONENT_STORE.get(key)) {
              this.hideComponent(key);
            }
          }
        })
        this.mountComponent(SubSetting.id,SubSetting,{
          mode:{
            type:"TopToolBar",
            pos:"right"
          }
        })

        addClass(SubSetting.el,["video-subsettings","video-topbar-controller"]);
      } else {
        // 展示之前隐藏的组件
        HIDEEN_COMPONENT_STORE.forEach((value,key) => {
          this.showComponent(key)
        })
        if(COMPONENT_STORE.has("SubSetting")) {
          let key = "SubSetting";
          let component = ONCE_COMPONENT_STORE.get(key)
          // 如果subsetting已经挂载到视图上，需要先卸载
          this.unmountComponent(key);
          this.mountComponent(key,component,{
            mode:{
              type:"BottomToolBar",
              pos:"right"
            },
            index:1
          })
          addClass(component.el,["video-subsetting","video-controller"])
        }
      }
    });

    resizeObserver.observe(this.el);
  }

  initEvent() {
    this.video.onclick = (e) => {
      if (this.video.paused) {
        this.video.play();
      } else if (this.video.played) {
        this.video.pause();
      }
    }
    this.el.onmousemove = (e) => {
      this.emit("showtoolbar", e);
    }
    this.el.onmouseenter = (e) => {
      this.emit("showtoolbar", e);
    }
    this.el.onmouseleave = (e) => {
      this.emit("hidetoolbar", e);
    }
    this.video.onloadedmetadata = (e) => {
      this.emit("loadedmetadata", e);
    }
    this.video.addEventListener("timeupdate", (e) => {
      this.emit("timeupdate", e)
    })
    this.video.onplay = (e) => {
      this.emit("play", e);
    }
    this.video.addEventListener('ratechange', (e) => {
      this.emit("ratechange")
    })
    this.video.onpause = (e) => {
      this.emit("pause", e);
    }
    this.on("progress-click", (e, ctx) => {
      let scale = e.offsetX / ctx.el.offsetWidth;
      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }
      this.video.currentTime = Math.floor(scale * this.video.duration);
      this.video.paused && this.video.play();
    })
    this.on("inputFocus", () => {
      this.el.onmouseleave = null;
    })

    this.on("inputBlur", () => {
      this.el.onmouseleave = (e) => {
        this.emit("hidetoolbar", e);
      }
    })

    this.video.addEventListener("seeking", (e) => {
      if (this.enableSeek) {
        this.emit("seeking", e)
      }
    })
    this.video.addEventListener("waiting", (e) => {
      this.emit("waiting", e);
    })

    this.video.addEventListener("canplay", (e) => {
      this.emit("canplay", e);
    })

    this.video.addEventListener("error", (e) => {
      this.emit("videoError");
    })

    this.video.addEventListener("abort", (e) => {
      this.emit("videoError")
    })
    this.on("dotdown", () => {
      console.log("dotdown");
      this.enableSeek = false;
    })
    this.on("dotup", () => {
      console.log("dotup");
      this.enableSeek = true
    })
  }
  initPlugin() {
    if (this.playerOptions.plugins) {
      this.playerOptions.plugins.forEach(plugin => {
        this.use(plugin);
      })
    }
  }
  initMp4Player(url: string) {
    new Mp4MediaPlayer(this.playerOptions.url, this);
  }
  initMpdPlayer(url: string) {
    let player = MpdMediaPlayerFactory().create();
    player.attachVideo(this.video);
    player.attachSource(url);
  }
  attachSource(url: string) {
    switch (getFileExtension(url)) {
      case "mp4":
      case "mp3":
        this.initMp4Player(url);
        break;
      case "mpd":
        this.initMpdPlayer(url);
        break;
      case "m3u8":
      // ToDo
    }
  }

  // 注册最右侧的控制栏上的组件
  // registerControls(id:string, component:Partial<ComponentItem> & registerOptions,pos: "left" | "right" | "medium") {
  //   let store = CONTROL_COMPONENT_STORE;
  //   if(store.has(id)) {
  //     if(component.replaceElementType) {
  //       patchComponent(store.get(id),component,{replaceElementType:component.replaceElementType})
  //     } else {
  //       patchComponent(store.get(id),component);
  //     }
  //   } else {
  //     // 如果该组件实例是用户自创的话
  //     if(!component.el) throw new Error(`传入的原创组件${id}没有对应的DOM元素`)
  //     if(pos === "left") {
  //       this.toolBar.controller.leftArea.appendChild(component.el);
  //     } else if(pos === "right") {
  //       let settings = this.toolBar.controller.rightArea
  //       settings.insertBefore(component.el,settings.firstChild);
  //     } else if(pos === "medium") {
  //       this.toolBar.controller.mediumArea.appendChild(component.el);
  //     }
  //   }
  // }


  // 注册/挂载自己的组件，其中的id为组件实例的名称，分为内置和用户自定义这两种情况；注意，id是唯一的，不能存在两个具有相同id的组件实例
  mountComponent(
    id: string,
    component: ComponentItem,
    options?: RegisterComponentOptions
  ) {
    if (COMPONENT_STORE.has(id)) {
      throw new Error(
        "无法挂载一个已经存在于视图上的组件，请先将其卸载或者删除"
      );
    }
    COMPONENT_STORE.set(id, component);
    if (!ONCE_COMPONENT_STORE.has(id)) {
      ONCE_COMPONENT_STORE.set(id, component);
    }
    if (!options) {
      if (!component.container)
        throw new Error(
          "必须传入Options选项或者传入的组件实例中需要有container选项"
        );
      component.container.appendChild(component.el);
    } else {
      let mode = options.mode;
      if (mode.type === "BottomToolBar") {
        let area: HTMLElement;
        if (mode.pos === "left") {
          area = this.toolBar.controller.leftArea;
        } else if (mode.pos === "right") {
          area = this.toolBar.controller.rightArea;
        } else if (mode.pos === "medium") {
          area = this.toolBar.controller.mediumArea;
        }
        let children = [...area.children];
        if (!options.index) area.appendChild(component.el);
        else {
          if (options.index < 0) throw new Error("index不能传入负值");
          area.insertBefore(component.el, children[options.index] || null)
        }
      } else if (mode.type === "TopToolBar") {
        let area: HTMLElement;
        if (mode.pos === "left") {
          area = this.topbar.leftArea;
        } else {
          area = this.topbar.rightArea;
        }
        let children = [...area.children];
        if (!options.index) area.appendChild(component.el);
        else {
          if (options.index < 0) throw new Error("index不能传入负值");
          area.insertBefore(component.el, children[options.index] || null)
        }
      }
      component.container = component.el.parentElement;
    }
  }


  // 更新一个已经挂载到视图层上的组件
  updateComponent(id: string, component: Partial<ComponentItem>, options: UpdateComponentOptions) {
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("该组件不存在或者已经被卸载")
    }

    patchComponent(COMPONENT_STORE.get(id), component, options);
  }

  // 卸载某一个component组件，卸载表示仅仅将dom元素从视图上移除，但是不会删除其实例对象，还可以继续挂载
  unmountComponent(id: string) {
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("该组件不存在或者已经被卸载")
    }

    let instance = COMPONENT_STORE.get(id)
    instance.el.parentElement.removeChild(instance.el);
    removeClass(instance.el, [...instance.el.classList])
    COMPONENT_STORE.delete(id)
  }
  // 隐藏某一个已经挂载到视图上的组件
  hideComponent(id: string) {
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("无法隐藏一个未挂载在视图上的组件")
    }
    if (HIDEEN_COMPONENT_STORE.get(id)) {
      throw new Error("该组件已经隐藏")
    }
    let instance = COMPONENT_STORE.get(id);
    instance.el.style.display = 'none';
    HIDEEN_COMPONENT_STORE.set(id, instance)
  }
  // 展示一个已经隐藏的组件
  showComponent(id: string) {
    if (!HIDEEN_COMPONENT_STORE.get(id)) {
      throw new Error("该元素已经隐藏");
    }
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("该元素不存在或者被卸载");
    }

    let instance = COMPONENT_STORE.get(id);
    instance.el.style.display = "";
    HIDEEN_COMPONENT_STORE.delete(id);
  }

  // 彻底删除一个组件，也就是直接销毁组件实例，卸载组件仅仅是将其el元素从视图上移除，担仍然保留组件的实例对象
  deleteComponent(id: string) {
    if (COMPONENT_STORE.has(id)) {
      this.unmountComponent(id);
    }

    ONCE_COMPONENT_STORE.delete(id)
  }

  /**m
   * @description 注册对应的组件
   * @param plugin 
   */
  use(plugin: Plugin) {
    plugin.install(this);
  }
}
export { Player };