import { DanmakuData, Track } from "../types/danmaku";
import { nextTick } from "../utils/nextTick";

/**
 * 
 * @description 弹幕类,只专注于实现弹幕的基本逻辑
 */
export class Danmaku {
    private queue: DanmakuData[] = [];
    // 正在移动中的弹幕数据的队列
    private moovingQueue: DanmakuData[] = [];
    private container: HTMLElement;
    // 弹幕渲染的定时器
    private timer: number | null = null;
    // 弹幕渲染的时间间隔
    private renderInterval: number = 100;
    // 每一条弹幕轨道的高度默认为20px
    private trackHeight: number = 20;
    private isStopped = true;
    private tracks: Array<{
        track: Track;
        datas: DanmakuData[]
    }> = new Array(15);
    // 
    private defaultDanma: DanmakuData = {
        message: 'default message',
        fontColor: "#fff",
        fontSize: this.trackHeight,
        fontFamily: "",
        fontWeight: 500
    }

    constructor(queue: DanmakuData[], container: HTMLElement) {
        this.queue = queue;


        this.container = container;
        this.init()
    }
    init() {
        // 为每个轨道分配一个优先级和id
        for (let i = 0; i < this.tracks.length; i++) {
            if (!this.tracks[i]) {
                this.tracks[i] = {
                    track: {
                        id: 0,
                        priority: 0
                    },
                    datas: []
                }
            }
            this.tracks[i].track = {
                id: i,
                priority: 15 - i
            }
        }
    }

    // 暂停所有弹幕
    pause() {
        this.isStopped = true
        window.clearTimeout(this.timer);
        this.moovingQueue.forEach(data => {
            this.pauseOneData(data)
            let currentRollDistance = (Date.now() - data.startTime) * data.rollSpeed / 1000;
            data.rollDistance = currentRollDistance + (data.rollDistance ? data.rollDistance : 0);
            data.dom.style.transition = "";
            data.dom.style.transform = `translateX(${-data.rollDistance}px)`;
        })
    }


    // 恢复弹幕的运动，此处逻辑有问题
    resume() {
        this.timer = window.setTimeout(() => {
            this.render();
        }, this.renderInterval);
        this.moovingQueue.forEach(data => {
            data.dom.style.transform = `translateX(${-data.totalDistance}px)`;
            data.startTime = Date.now();
            data.rollTime = (data.totalDistance - data.rollDistance) / data.rollSpeed;
            data.dom.style.transition = `transform ${data.rollTime}s linear`;
        })
    }

    resumeOneData(data: DanmakuData) {
        data.dom.style.transform = `translateX(${-data.totalDistance}px)`;
        data.startTime = Date.now();
        data.rollTime = (data.totalDistance - data.rollDistance / data.rollSpeed);
        data.dom.style.transition = `transform ${data.rollTime}s linear`;

    }

    pauseOneData(data: DanmakuData) {
        let currentRollDistance = (Date.now() - data.startTime) * data.rollSpeed / 1000;
        data.rollDistance = currentRollDistance + (data.rollDistance ? data.rollDistance : 0);
        data.dom.style.transition = "";
        data.dom.style.transform = `translateX(${-data.rollDistance}px)`;
    }

    startDanmaku() {
        this.render();
    }
    // 定义一个返回Promise的延迟函数
    delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time)
        })
    }


    // 向缓冲区内添加正确格式的弹幕
    addData(data: any) {
        this.queue.push(this.parseData(data));
        // 没有渲染定时器在运行     
        if (this.timer === null) {
            // 在下一个事件循环中开始渲染弹幕。
            // nextTick(() => {
            //     this.render();
            // })

            this.delay(0) // 使用Promise延迟到下一个微任务
                .then(() => this.render())
        }
    }


    parseData(data: any): DanmakuData {
        if (typeof data === "string") {
            return {
                message: data,
                fontColor: "#fff",
                fontSize: this.trackHeight,
                fontWeight: 500
            }
        }

        if (typeof data === "object") {
            if (!data.message || data.message === "") {
                throw new Error(`传入的弹幕数据${data}不合法`);
            }
            return Object.assign({ ...this.defaultDanma }, data);
        }
        throw new Error(`传入的弹幕数据${data}不合法`)
    }
    render() {
        try {
            this.renderToDOM();
        } finally {
            this.renderEnd();
        }
    }



    // 处理渲染结束后的逻辑，控制渲染定时器的启停
    renderEnd() {
        if (this.queue.length === 0) {
            window.clearTimeout(this.timer);
            this.timer = null;
        } else {
            this.timer = window.setTimeout(() => {
                this.render()
            }, this.renderInterval)
        }
    }




    // 向指定的DOM元素上渲染一条弹幕

    renderToDOM() {
        if (this.queue.length === 0) return;
        let data = this.queue[0];
        // 创建dom即相关属性
        if (!data.dom) {
            let dom = document.createElement("div");
            dom.innerText = data.message;
            dom.className = "danmaku-box"
            if (data.fontFamily !== "") {
                dom.style.fontFamily = data.fontFamily;
            }
            dom.style.color = data.fontColor;
            dom.style.fontSize = data.fontSize + "px";
            dom.style.fontWeight = data.fontWeight + "";
            dom.style.position = "absolute";
            dom.style.left = "100%";
            dom.style.whiteSpace = 'nowrap';
            dom.style.willChange = 'transform';
            dom.style.cursor = 'pointer';
            data.dom = dom;
            this.container.appendChild(dom);
        }
        // 总滚动距离
        data.totalDistance = this.container.clientWidth + data.dom.clientWidth;
        data.width = data.dom.clientWidth;
        // 弹幕滚动出现时间和速度
        // 这个滚动时间的计算策略可以让弹幕在不同的场景中呈现出一定的随机性，使得弹幕的显示更加生动和多样化。
        data.rollTime = data.rollTime ||
            Math.floor(data.totalDistance * 0.0058 * (Math.random() * 0.3 + 0.7));
        data.rollSpeed = parseFloat((data.totalDistance / data.rollTime).toFixed(2));

        // useTracks描述的是该弹幕占用了多少个轨道
        data.useTracks = Math.ceil(data.dom.clientHeight / this.trackHeight);
        // 记录弹幕所占据的轨道的位置
        data.y = [];
        data.dom.ontransitionstart = (e) => {
            data.startTime = Date.now();
        }
        data.dom.onmouseenter = () => {
            if (this.isStopped) return;
            this.pauseOneData(data);
        }
        data.dom.onmouseleave = () => {
            if (this.isStopped) return;
            this.resumeOneData(data);
        }

        this.addDataToTrack(data);
        if (data.y.length === 0) {
            if ([...this.container.childNodes].includes(data.dom)) {
                this.container.removeChild(data.dom);
            }
            this.queue.splice(0, 1).push(data);
        } else {
            data.dom.style.top = data.y[0] * this.trackHeight + 3 + "px";
            this.startAnimate(data);
            this.queue.shift();
        }
    }




    //将指定的data添加到弹幕轨道上
    addDataToTrack(data: DanmakuData) {
        let y = [];
        for (let i = 0; i < this.tracks.length; i++) {
            // 一共15个轨道
            let track = this.tracks[i];
            let datas = track.datas;
            if (datas.length === 0) {
                // 这个轨道可用
                y.push(i);
            } else {
                // 获取当前轨道最后一个弹幕项
                let lastItem = datas[datas.length - 1];
                // diatance代表的就是在该轨道上弹幕lastItem已经行走的距离
                let distance = lastItem.rollSpeed * (Date.now() - lastItem.startTime) / 1000;
                if (
                    (distance > lastItem.width) && ((data.rollSpeed <= lastItem.rollSpeed) || ((distance - lastItem.width) / (data.rollSpeed - lastItem.rollSpeed) >
                        (this.container.clientWidth + lastItem.width - distance) / lastItem.rollSpeed)
                    )
                ) {
                    y.push(i);
                } else {
                    y = [];
                }
            }
            if (y.length >= data.useTracks) {
                data.y = y;
                data.y.forEach(id => {
                    this.tracks[id].datas.push(data);
                })
                break;
            }
        }
        data.y = y;
        data.y.forEach(id => {
            this.tracks[id].datas.push(data);

        })
    }

    removeDataFromTrack(data: DanmakuData) {
        data.y.forEach(id => {
            let datas = this.tracks[id].datas;
            let index = datas.indexOf(data);
            if (index === -1) {
                return;
            }
            datas.splice(index, 1);
        })
    }

    startAnimate(data: DanmakuData) {
        this.moovingQueue.push(data)
        data.dom.style.transition = `transform ${data.rollTime}s linear`;
        data.dom.style.transform = `translateX(-${data.totalDistance}px)`;
        data.dom.ontransitionend = (e) => {
            this.container.removeChild(data.dom);
            this.removeDataFromTrack(data);
            this.moovingQueue.splice(this.moovingQueue.indexOf(data), 1);
        }
    }




    //清空所有的弹幕，包括正在运动中的或者还在缓冲区未被释放的

    flush() {
        this.moovingQueue.forEach(data => {
            this.container.removeChild(data.dom);
            data.dom.ontransitionend = null;
            data.dom.ontransitionstart = null;
        })
        this.queue.forEach(data => {
            if ([...this.container.children].includes(data.dom)) {
                this.container.removeChild(data.dom);
                data.dom.ontransitionend = null;
                data.dom.ontransitionstart = null;
            }
        })
        // 清空轨道上的所有数据
        this.tracks.forEach(obj => {
            obj.datas = [];
        })
        this.moovingQueue = [];
        this.queue = [];
    }

    // 丢弃一部分没用或者过时的弹幕
    disCard(start: number, end: number) {
        this.queue.splice(start, end - start + 1);
    }
    clearOutdatedDanmaku(currentTime: number, interval: number) {
        this.queue = this.queue.filter(item => {
            if (currentTime - item.timestamp > interval) {
                return false;
            }
            return true;
        })
    }
}









