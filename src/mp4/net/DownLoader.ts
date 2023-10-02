import { Log } from "mp4box";
import HTTPRequest from "../../dash/net/HTTPRequest";
import XHRLoaderFactory from "../../dash/net/XHRLoader";
import { RequestHeader } from "../../types/dash/Net";
class DownLoader {
    isActive: boolean = false;  //下载器是否处于活动状态
    realtime: boolean = false;  // 是否实时下载
    // chunkStart指的是请求的Chunk在整个文件中的初始偏移量
    chunkStart: number = 0;
    chunkSize: number = 0;
    totalLength: number = 0;
    chunkTimeout: number = 1000;   //请求超出时间
    timeoutID: number | null = null;      //超时计时器的ID
    url: string = "";
    callback: Function = null;   // 下载完成后的回调函数
    eof: boolean = false;    // 是否以达到文件末尾
    constructor(url?: string) {
        this.url = url || '';
    }

    // 从开头去请求文件，也就是初始化文件的请求过程直到所有文件都请求完成
    start() {
        Log.info("Downloader", "Starting flie download");
        this.chunkStart = 0;
        this.resume();
        return this
    }
    // 重置下载器的状态
    reset() {
        this.chunkStart = 0;
        this.totalLength = 0;
        this.eof = false  //文件结束符？
        return this
    }
    // 停止下载器，清除计时器和标记下载器为非活动状态
    stop() {
        window.clearTimeout(this.timeoutID);
        this.timeoutID = null;
        this.isActive = false;
        return this
    }
    // 恢复下载，resume和start不同的是resume可能是在文件的请求暂停后重新设置了chunkStart之后再去重新请求新的chunk
    resume() {
        Log.info("Downloader", "Resuming file download");
        this.isActive = true;
        if (this.chunkSize === 0) {
            this.chunkSize = Infinity;
        }
        this.getFile();
        return this;
    }
    // 设置文件url
    setUrl(_url: string): this {
        this.url = _url;
        return this;
    }
    // 设置是否为实时下载
    setRealTime(_realtime: boolean): this {
        this.realtime = _realtime;
        return this;
    }
    // 设置每个chunk大小
    setChunkSize(_size: number) {
        this.chunkSize = _size;
        return this;
    }
    // 设置数据块的起始位置
    setChunkStart(_start: number) {
        this.chunkStart = _start;
        this.eof = false;
        return this;
    }
    // 设置数据块超时时间
    setInterval(_timeout: number) {
        this.chunkTimeout = _timeout;
        return this;
    }
    // 设置下载完成后的回调函数
    setCallback(_callback: Function) {
        this.callback = _callback;
        return this;
    }
    // 获取文件的总长度
    getFileLength() {
        return this.totalLength;
    }
    // 检查下载器是否已停止
    isStopped() {
        return !this.isActive;
    }

    // 初始化http请求对象
    initHTTPRequest(): HTTPRequest {
        let xhr = new XMLHttpRequest();
        let header: RequestHeader = {};
        // 设置请求的范围，用于分段下载
        (xhr as XMLHttpRequest & { [props: string]: any }).start = this.chunkStart;
        if (this.chunkStart + this.chunkSize < Infinity) {
            let endRange = 0;
            // 请求范围从 chunkStart 到 (chunkStart + chunkSize -1)
            let range = 'byter=' + this.chunkStart + '-';
            endRange = this.chunkStart + this.chunkSize - 1;
            range += endRange;
            header.Range = range;
        }

        // 创建HTTP请求对象
        let request = new HTTPRequest({
            url: this.url,
            header: header,
            method: 'get',
            xhr: xhr
        });
        return request

    }
    /** 
    * @description 发送网络请求，请求对应的媒体文件
    */

    getFile(){
        let ctx = this;
        if(this.isStopped()) return
        // 如果已经请求完整个媒体文件，则设置 eof 为 true
        if (ctx.totalLength !== 0 && ctx.chunkStart >= ctx.totalLength) {
            ctx.eof = true;
        }

        // 如果已经到达文件末尾，触发回调函数并传递 true
        if (ctx.eof === true) {
            Log.info("Downloader", "File download done.");
            ctx.callback(null, true);
            return;
        }

        // 初始化HTTP请求对象
        let request = this.initHTTPRequest();
        let loader = XHRLoaderFactory({}).getInstance();
        console.log("当前发送请求的范围为: ",request.header.Range)

        // 发送HTTP请求
        loader.load({
            request:request,
            error: error,
            success: success
        })

        function error(e) {
            ctx.callback(null,false,true)
        }

        function success(res) {
            let xhr = this;
            let rangeReceived =xhr.getResponseHeader("Content-Range");

            // 如果没有获取到文件的总长度，解析 Content-Range 头部
            if (ctx.totalLength === 0 && rangeReceived) {
                let sizeIndex;
                sizeIndex = rangeReceived.indexOf("/");
                if (sizeIndex > -1) {
                    ctx.totalLength = +rangeReceived.slice(sizeIndex + 1);
                }
            }


            // 判断是否已到达文件末尾
            ctx.eof = (xhr.response.byteLength ! == ctx.chunkSize) || (xhr.response.byteLength === ctx.totalLength);

            // 获取数据并传递给回调函数
            let buffer = xhr.response;
            buffer.fileStart = xhr.start;
            console.log("成功拿到请求:",buffer);
            
            ctx.callback(buffer,ctx.eof);

            // 如果下载器处于活动状态且文件未完全下载，设置下一次请求的超时定时器
            if(ctx.isActive === true && ctx.eof === false) {
                let timeoutDuration = ctx.chunkTimeout;
                ctx.timeoutID = window.setTimeout(ctx.getFile.bind(ctx), timeoutDuration);
            }
        }
    }
}

export {DownLoader}