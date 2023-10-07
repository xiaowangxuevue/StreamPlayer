import { wrap } from "ntouch.js";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import {
    $,
    addClass,
    createSvg,
    createSvgs,
    includeClass,
    removeClass,
} from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { Toast } from "../../Toast/Toast";
import { confirmPath, screenShot$1, screenShot$2 } from "../path/defaultPath";
import { Options } from "./Options";
export class ScreenShot extends Options {
    readonly id = "ScreenShot";
    confirmIcon: SVGSVGElement;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]) {
        super(player, container, 0, 0, desc, props, children);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }

    initTemplate() {
        this.confirmIcon = createSvg(confirmPath, "0 0 1024 1024");
        addClass(this.el, ["video-screenshot", "video-controller"])
        this.icon = createSvgs([screenShot$1, screenShot$2], "0 0 1024 1024");
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);

        this.hideBox.innerText = "截图"
        this.hideBox.style.fontSize = "13px"
    }

    initEvent() {
        this.onClick = this.onClick.bind(this);
        if (this.player.env === "PC") {
            this.el.addEventListener("click", this.onClick)
        } else {
            wrap(this.el).addEventListener("singleTap", this.onClick)
        }
    }

    onClick(e: Event) {
        // 条件满足时为 this.icon 元素添加 CSS 类，触发一个 CSS 过渡动画，并在动画结束后将 CSS 类移除，以实现一次性的动画效果
        if (!includeClass(this.icon, "video-screenshot-animate")) {
            addClass(this.icon, ["video-screenshot-animate"]);
            (this.icon as SVGSVGElement).ontransitionend = (e) => {
                removeClass(this.icon, ["video-screenshot-animate"]);
                (this.icon as SVGSVGElement).ontransitionend = null;
            };
        }
        this.screenShot();
    }
    /**
     * @description 进行截屏
     */
    screenShot() {
        const canvas = document.createElement('canvas')
        let video = this.player.video
        video.setAttribute('crossOrigin', 'anonymous')
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

        const fileName = `${Math.random().toString(36).slice(-8)}_${video.currentTime}.png`
        try {
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                a.style.display = 'none'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }, 'image/png')
        } catch {
            // ToDo
        }

        let dom = $("div.video-screenshot-toast");
        let span = $("span");
        span.innerText = "截图成功!"
        let icon = this.confirmIcon.cloneNode(true)
        dom.appendChild(icon);
        dom.appendChild(span);
        let toast = new Toast(this.player, dom);

        setTimeout(() => {
            toast.dispose();
            toast = null;
        }, 2000)
    }

}