import 'loading-mask.less';

class BaseEvent {
    constructor() {
        this.$events = {};
    }
    //事件触发
    emit(event, ...args) {
        if (this.$events[event]) {
            this.$events[event].forEach((cb) => {
                cb.call(this, ...args);
            });
        }
    }
    //事件监听
    on(event, cb) {
        this.$events[event] = this.$events[event] || [];
        this.$events[event].push(cb);
    }
}

class Player extends BaseEvent {
    constructor(options) {
        super();
        this.playerOptions = {
            url: "",
            autoplay: false,
            width: "100%",
            height: "100%",
        };
        this.playerOptions = Object.assign(this.playerOptions, options);
        this.init();
        this.initComponent();
        this.initContainer();
        // 初始化播放器的事件
        this.initEvent();
    }
    init() {
        let container = this.playerOptions.container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container;
    }
    initComponent() {
        this.toolbar = new ToolBar(this.container);
        this.loadingMask = new LoadingMask(this.container);
        this.errorMask = new ErrorMask(this.container);
    }
    initContainer() {
        this.container.style.width = this.playerOptions.width;
        this.container.style.height = this.playerOptions.height;
        this.container.className = styles["video-container"];
        this.container.innerHTML = `
      <div class="${styles["video-wrapper"]}">
        <video>
          <source src="${this.playerOptions.url}" type="video/mp4">
            你的浏览器暂不支持HTML5标签,非常抱歉
          </source>
        </video>
      </div>
    `;
        this.container.appendChild(this.toolbar.template);
        this.video = this.container.querySelector("video");
    }
    initEvent() {
        // this.on("mounted", (ctx: this) => {
        //   // ctx.playerOptions.autoplay && ctx.video.play();
        // })
        this.toolbar.emit("mounted");
        this.emit("mounted", this);
        this.container.onclick = (e) => {
            if (e.target == this.video) {
                if (this.video.paused) {
                    this.video.play();
                }
                else if (this.video.played) {
                    this.video.pause();
                }
            }
        };
        // 鼠标控制toolbar show
        this.container.addEventListener("mouseenter", (e) => {
            this.toolbar.emit("showtoolbar", e);
        });
        this.container.addEventListener("mousemove", (e) => {
            this.toolbar.emit("showtoolbar", e);
        });
        this.container.addEventListener("mouseleave", (e) => {
            this.toolbar.emit("hidetoolbar", e);
        });
        // 视频源数据加载完毕
        this.video.addEventListener("loadedmetadata", (e) => {
            console.log("视频源数据加载完毕", this.video.duration);
            this.playerOptions.autoplay && this.video.play();
            this.toolbar.emit("loadedmetadata", this.video.duration);
        });
        // 更改时间
        this.video.addEventListener("timeupdate", (e) => {
            console.log("时间更新了", this.video.currentTime);
            this.toolbar.emit("timeupdate", this.video.currentTime);
        });
        // 当视频可以接着播放，正常播放的时候可以移除error和loading的mask，通常是为了应对再播放器的过程中出现需要缓冲或者播放错误，展示对应mask
        this.video.addEventListener("play", (e) => {
            // console.log(this, 'this.load');
            // this.loadingMask.removeLoadingMask();
            // this.errorMask.removeErrorMask();
            this.toolbar.emit("play");
        });
        this.video.addEventListener("pause", (e) => {
            this.toolbar.emit("pause");
        });
        this.video.addEventListener("waiting", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.loadingMask.addLoadingMask();
        });
        // 当视频请求错误
        this.video.addEventListener("stalled", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
        this.video.addEventListener("error", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
        this.video.addEventListener("abort", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
    }
    isTagValidate(ele) {
        if (window.getComputedStyle(ele).display === "block")
            return true;
        if (window.getComputedStyle(ele).display === "inline")
            return false;
        if (window.getComputedStyle(ele).display === "inline-block") {
            if (ele instanceof HTMLImageElement ||
                ele instanceof HTMLAudioElement ||
                ele instanceof HTMLVideoElement ||
                ele instanceof HTMLInputElement ||
                ele instanceof HTMLCanvasElement ||
                ele instanceof HTMLButtonElement) {
                return false;
            }
            return true;
        }
        return true;
    }
}

// 视频播放器的工具栏组件
class ToolBar extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initComponent();
        this.initTemplate();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    init() {
    }
    showToolBar(e) {
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]}`;
        if (e.target !== this.video) ;
        else {
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000);
        }
    }
    hideToolBar() {
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    }
    initComponent() {
        this.progress = new Progress(this.container);
        this.controller = new Controller(this.container);
    }
    initTemplate() {
        let div = document.createElement("div");
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += this.progress.template;
        div.innerHTML += this.controller.template;
        this.template_ = div;
        console.log(div, 'divvvvvvvvvv');
    }
    initEvent() {
        this.on("showtoolbar", (e) => {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.showToolBar(e);
        });
        this.on("hidetoolbar", () => {
            this.hideToolBar();
        });
        this.on("play", () => {
            this.controller.emit("play");
        });
        this.on("pause", () => {
            this.controller.emit("pause");
        });
        this.on("loadedmetadata", (summary) => {
            console.log('____load1', summary);
            this.controller.emit("loadedmetadata", summary);
            this.progress.emit("loadedmetadata", summary);
        });
        this.on("timeupdate", (current) => {
            this.controller.emit("timeupdate", current);
            this.progress.emit("timeupdate", current);
        });
        this.on("mounted", () => {
            this.video = this.container.querySelector("video");
            this.controller.emit("mounted");
            this.progress.emit("mounted");
        });
    }
}

class Progress extends BaseEvent {
    constructor(container) {
        super();
        this.mouseDown = false;
        this.container = container;
        this.init();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    initProgressEvent() {
        // 鼠标进入，小点
        this.progress.onmouseenter = () => {
            console.log(111);
            this.dot.className = `${styles["video-dot"]}`;
        };
        // 鼠标离开，隐藏点
        this.progress.onmouseleave = () => {
            if (!this.mouseDown) {
                this.dot.className = `${styles["video-dot"]} ${styles["video-dot-hidden"]}`;
            }
        };
        //progress time
        this.progress.onmousemove = (e) => {
            let scale = e.offsetX / this.progress.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            let preTime = formatTime(scale * this.video.duration);
            this.pretime.style.display = "block";
            this.pretime.innerHTML = preTime;
            this.pretime.style.left = e.offsetX - 17 + "px";
            e.preventDefault();
        };
        this.progress.onmouseleave = (e) => {
            this.pretime.style.display = "none";
        };
        // 鼠标点击
        this.progress.onclick = (e) => {
            let scale = e.offsetX / this.progress.offsetWidth; //0-1
            console.log(scale, 'scale');
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
            this.bufferedProgress.style.width = scale * 100 + "%";
            this.completedProgress.style.width = scale * 100 + "%";
            this.video.currentTime = Math.floor(scale * this.video.duration);
            if (this.video.paused)
                this.video.play();
        };
        // 
        this.dot.addEventListener("mousedown", (e) => {
            let left = this.completedProgress.offsetWidth;
            let mouseX = e.pageX;
            this.mouseDown = true;
            document.onmousemove = (e) => {
                let scale = (e.pageX - mouseX + left) / this.progress.offsetWidth;
                if (scale < 0) {
                    scale = 0;
                }
                else if (scale > 1) {
                    scale = 1;
                }
                this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
                this.bufferedProgress.style.width = scale * 100 + "%";
                this.completedProgress.style.width = scale * 100 + "%";
                this.video.currentTime = Math.floor(scale * this.video.duration);
                if (this.video.paused)
                    this.video.play();
                e.preventDefault();
            };
            document.onmouseup = (e) => {
                document.onmousemove = document.onmouseup = null;
                this.mouseDown = false;
                e.preventDefault();
            };
            e.preventDefault();
        });
    }
    init() {
        this.template_ = `
        <div class="${styles["video-progress"]}">
            <div class="${styles["video-pretime"]}">00:00</div>
            <div class="${styles["video-buffered"]}"></div>
            <div class="${styles["video-completed"]} "></div>
            <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}"></div>
        </div>
        `;
    }
    initEvent() {
        this.on("mounted", () => {
            this.progress = this.container.querySelector(`.${styles["video-controls"]} .${styles["video-progress"]}`);
            this.pretime = this.progress.children[0];
            this.bufferedProgress = this.progress.children[1];
            this.completedProgress = this.progress.children[2];
            this.dot = this.progress.children[3];
            this.video = this.container.querySelector("video");
            this.initProgressEvent();
        });
        this.on("timeupdate", (current) => {
            let scaleCurr = (this.video.currentTime / this.video.duration) * 100;
            let scaleBuffer = ((this.video.buffered.end(0) + this.video.currentTime) /
                this.video.duration) *
                100;
            this.completedProgress.style.width = scaleCurr + "%";
            this.dot.style.left =
                this.progress.offsetWidth * (scaleCurr / 100) - 5 + "px";
            this.bufferedProgress.style.width = scaleBuffer + "%";
        });
        this.on("loadedmetadata", (summary) => { });
    }
}

class Controller extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = `
        <div class="${styles["video-play"]}">
            <div class="${styles["video-subplay"]}">
                <div class="${styles["video-start-pause"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
                </div>
                <div class="${styles["video-duration"]}">
                    <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
                </div>
            </div>
            <div class="${styles["video-settings"]}">
                <div class="${styles["video-subsettings"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-shezhi"]}"></i>
                </div>
                <div class="${styles["video-volume"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-yinliang"]}"></i>
                    <div class="${styles["video-volume-progress"]}">
                    <div class="${styles["video-volume-completed"]}"></div>
                    <div class="${styles["video-volume-dot"]}"></div>
                    </div>
                </div>
                <div class="${styles["video-fullscreen"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-quanping"]}"></i>
                </div>
            </div>
        </div>
    `;
    }
    initControllerEvent() {
        this.videoPlayBtn.onclick = (e) => {
            if (this.video.paused) {
                this.video.play();
            }
            else if (this.video.played) {
                this.video.pause();
            }
        };
        this.fullScreen.onclick = () => {
            if (this.container.requestFullscreen && !document.fullscreenElement) {
                this.container.requestFullscreen(); //该函数请求全屏
            }
            else if (document.fullscreenElement) {
                document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            }
        };
    }
    initEvent() {
        this.on("play", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
        });
        this.on("pause", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
        });
        this.on("loadedmetadata", (summary) => {
            this.summaryTime.innerHTML = formatTime(summary);
        });
        this.on("timeupdate", (current) => {
            this.currentTime.innerHTML = formatTime(current);
        });
        this.on("mounted", () => {
            this.videoPlayBtn = this.container.querySelector(`.${styles["video-start-pause"]} i`);
            this.currentTime = this.container.querySelector(`.${styles["video-duration-completed"]}`);
            this.summaryTime = this.container.querySelector(`.${styles["video-duration-all"]}`);
            this.video = this.container.querySelector("video");
            this.fullScreen = this.container.querySelector(`.${styles["video-fullscreen"]} i`);
            this.initControllerEvent();
        });
    }
}

class LoadingMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = this.generateLoadingMask();
    }
    generateLoadingMask() {
        let mask = document.createElement("div");
        mask.className = styles["loading-mask"];
        let loadingContainer = document.createElement("div");
        loadingContainer.className = styles["loading-container"];
        let loaadingItem = document.createElement("div");
        loaadingItem.className = styles["loading-item"];
        let loadingTitle = document.createElement("div");
        loadingTitle.className = styles["loading-title"];
        loadingTitle.innerText = "视频正在努力加载中...";
        loadingContainer.appendChild(loaadingItem);
        loadingContainer.appendChild(loadingTitle);
        mask.appendChild(loadingContainer);
        return mask;
    }
    addLoadingMask() {
        if (![...this.container.children].includes(this.template)) {
            this.container.appendChild(this.template);
        }
    }
    removeLoadingMask() {
        if ([...this.container.children].includes(this.template)) {
            this.container.removeChild(this.template);
        }
    }
}

class ErrorMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = this.generateErrorMask();
    }
    generateErrorMask() {
        let mask = document.createElement("div");
        mask.className = styles["error-mask"];
        let errorContainer = document.createElement("div");
        errorContainer.className = styles["error-container"];
        let errorItem = document.createElement("div");
        errorItem.className = styles["error-item"];
        let i = document.createElement("i");
        i.className = `${icon["iconfont"]} ${icon["icon-cuowutishi"]}`;
        errorItem.appendChild(i);
        let errorTitle = document.createElement("div");
        errorTitle.className = styles["error-title"];
        errorTitle.innerText = "视频加载发生错误";
        errorContainer.appendChild(errorItem);
        errorContainer.appendChild(errorTitle);
        mask.appendChild(errorContainer);
        return mask;
    }
    addErrorMask() {
        if (![...this.container.children].includes(this.template)) {
            // ToDo
            this.container.appendChild(this.template);
        }
    }
    removeErrorMask() {
        if ([...this.container.children].includes(this.template)) {
            // ToDo
            this.container.removeChild(this.template);
        }
    }
}

function $warn(msg) {
    throw new Error(msg);
}

function addZero(num) {
    return num > 9 ? num + "" : "0" + num;
}
function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minute = Math.floor(seconds / 60);
    let second = seconds % 60;
    return addZero(minute) + ":" + addZero(second);
}
// 解析MPD文件的时间字符串
function parseDuration(pt) {
    // Parse time from format "PT#H#M##.##S"
    var ptTemp = pt.split("T")[1];
    ptTemp = ptTemp.split("H");
    var hours = ptTemp[0];
    var minutes = ptTemp[1].split("M")[0];
    var seconds = ptTemp[1].split("M")[1].split("S")[0];
    var hundredths = seconds.split(".");
    //  Display the length of video (taken from .mpd file, since video duration is infinate)
    return { hours, minutes, seconds: hundredths[0] };
}

let LOADING_MASK_MAP = new Array();
let ERROR_MASK_MAP = new Array();

function string2boolean(s) {
    if (s === 'true') {
        return true;
    }
    else if (s === 'false') {
        return false;
    }
    else {
        return null;
    }
}
function string2number(s) {
    let n = Number(s);
    if (isNaN(n))
        return n;
    else
        return null;
}

const styles = {
    "video-container": "player_video-container__ndwL-",
    "video-wrapper": "player_video-wrapper__zkaDS",
    "video-controls": "toolbar_video-controls__z6g6I",
    "video-controls-hidden": "toolbar_video-controls-hidden__Fyvfe",
    "video-progress": "pregress_video-progress__QjWkP",
    "video-pretime": "pregress_video-pretime__JInJt",
    "video-buffered": "pregress_video-buffered__N25SV",
    "video-completed": "pregress_video-completed__CnWX-",
    "video-dot": "pregress_video-dot__giuCI",
    "video-dot-hidden": "pregress_video-dot-hidden__SceSE",
    "video-play": "controller_video-play__fP3BY",
    "video-subplay": "controller_video-subplay__WTnV2",
    "video-start-pause": "controller_video-start-pause__MAW2N",
    "video-duration": "controller_video-duration__4mxGN",
    "video-duration-completed": "controller_video-duration-completed__aKEo3",
    "video-settings": "controller_video-settings__vL60f",
    "video-subsettings": "controller_video-subsettings__lRckv",
    "video-volume": "controller_video-volume__6xzJB",
    "video-volume-progress": "controller_video-volume-progress__f4U3J",
    "video-volume-completed": "controller_video-volume-completed__R0FaX",
    "video-volume-dot": "pregress_video-dot__giuCI",
    "video-fullscreen": "controller_video-fullscreen__1-aJA",
    "video-duration-all": "controller_video-duration-all__MOXNR",
    "loading-mask": "",
    "loading-container": "",
    "loading-item": "",
    "loading-title": "",
    "error-mask": "",
    "error-container": "",
    "error-item": "",
    "error-title": ""
};

const icon = {
    iconfont: "main_iconfont__23ooR",
    "icon-bofang": "main_icon-bofang__SU-ss",
    "icon-shezhi": "main_icon-shezhi__y-8S0",
    "icon-yinliang": "main_icon-yinliang__ZFc2R",
    "icon-quanping": "main_icon-quanping__eGMiv",
    "icon-cuowutishi": "main_icon-cuowutishi__fy-Bm",
    "icon-zanting": "main_icon-zanting__BtGq5",
};

export { $warn, BaseEvent, Controller, ERROR_MASK_MAP, ErrorMask, LOADING_MASK_MAP, LoadingMask, Player, Progress, ToolBar, addZero, formatTime, icon, parseDuration, string2boolean, string2number, styles };
