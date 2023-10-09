import { Component } from "../class/Component";
import { Player } from "../page/player";
import { SubSetting } from "../component";
import { SubsettingsBase } from "../component/ToolBar/BottomBar/parts/Subsettings/parts/SubsettingsBase";
import { SubsettingItem } from "../component/ToolBar/BottomBar/parts/Subsettings/SubsettingItem";
export type PlayerOptions = {
  url?: string;
  container?: HTMLElement;
  video?: HTMLVideoElement;
  post?:string;
  autoPlay?: boolean;
  streamPlay?: boolean;
  leftBottomBarControllers?: (ComponentConstructor)[];
  rightBottomBarControllers?: (ComponentConstructor)[];
  leftTopBarControllers?: (ComponentConstructor )[];
  rightTopBarController?: (ComponentConstructor)[];
  leftMediumBarController?: ComponentConstructor[];
  mediumMediumBarController?: ComponentConstructor[];
  rightMediumBarController?: ComponentConstructor[];
  subtitles?: Subtitles[];
  danmaku?: DanmakuOptions;
  plugins?: Plugin[];
  biblibiliMode?:boolean;
};

export type DanmakuOptions = {
  open: boolean;
  api?: string;
  type? :"websocket" | "http"
}

export type Subtitles = {
  default?:boolean;
  tip:string;
  source:string;
  lang:"zh" | "en" | "jp";
}

export type DOMProps = {
  className?: string[];
  id?: string;
  style?: Partial<CSSStyleDeclaration>;
  [props: string]: any;
};

// ComponentItem用于描述一个组件
export interface ComponentItem {
  id: string;
  el: HTMLElement;
  container?: HTMLElement;
  props?: DOMProps;
  [props: string]: any;
}

// 描述的是Subsettings上的item的类型，也就是设置选项
export interface SubsettingsItem {
  leftIcon?: SVGSVGElement | HTMLElement;
  leftText?: string;
  rightTip?: string;
  rightIcon?: SVGSVGElement | HTMLElement;
  instance? : SubsettingItem;  //自身item对应的实例
  click?: (item: SubsettingsItem) => any
  target?: SubsettingsBase | SubsettingsBaseConstructor;
}

export interface SubsettingsBaseConstructor {
  new (subsetting:SubSetting,player:Player):SubsettingsBase;
  instance?: SubsettingsBase;
}

export interface Node {
  id: string;
  el: HTMLElement;
}

export type Plugin = {
  install: (player: Player) => any;
};

export type getFunctionParametersType<T extends (...args: any[]) => any> =
  T extends (...args: (infer T)[]) => infer U ? T : never;

export interface ComponentConstructor {
  new (
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: string | Node[]
  ): Component & ComponentItem;
}

// 存储内置组件的ID，用于在用户注册组件时区分是自定义组件还是内置组件
export type BuiltInComponentID =
  | "PlayButton"
  | "Playrate"
  | "Volume"
  | "FullScreen"
  | "DutaionShow"
  | "SubSetting"
  | "VideoShot"
  | "ScreenShot"
  | "PicInPic"
  | "FullPage"
  | "FullScreen";

//对应最顶层的ToolBar的注册选项
export type TopToolBarOptions = {
  type: "TopToolBar";
  pos: "left" | "right";
};

export type BottomToolBarOptions = {
  type: "BottomToolBar";
  pos: "left" | "right" | "medium";
};

export type AnyPositionOptions = {
  type: "AnyPosition";
}

// 注册组件时的选项
export type RegisterComponentOptions = {
  mode: TopToolBarOptions | BottomToolBarOptions | AnyPositionOptions;
  index?: number;
};

// 更新组件时的选项
export type UpdateComponentOptions = {
  replaceElType?: "replaceOuterHTMLOfComponent" | "replaceInnerHTMLOfComponent";
};
