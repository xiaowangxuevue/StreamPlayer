import MP4Box ,{ MP4File, Log, MP4ArrayBuffer, MP4Info, MP4SourceBuffer, MP4MediaSource } from "mp4box"
import { FactoryObject } from "../types/dash/Factory";
import { MoovBoxInfo, MediaTrack } from "../types/mp4";
import { DownLoader } from "./net/DownLoader";
class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxfile: MP4File;
    mediaSource: MediaSource;
    mediaInfo: MoovBoxInfo;
    downloader: DownLoader;
    lastSeekTime: number = 0;
    constructor(url:string, video:HTMLVideoElement) {
        this.url = url;
        this.video = video;
        this.init()
    }

    init() {
        this.mp4boxfile = MP4Box.createFile();  // 解析MP4文件
        this.downloader = new DownLoader(this.url);  // 用于下载媒体文件
        this.mediaSource = new MediaSource();  // 管理媒体数据的缓冲和播放
        this.video.src = window.URL.createObjectURL(this.mediaSource);
        this.initEvent();
        this.loadFile();
    }

    initEvent() {
        console.log('start--',this.mp4boxfile);
        let ctx = this;
        this.mp4boxfile.onMoovStart = function () {
            Log.info("Application", "Starting to parse movie information");
        }
        this.mp4boxfile.onReady = function (info: MoovBoxInfo) {
            Log.info("Application", "Movie information received");
            ctx.mediaInfo = info;
            console.log(info,'infoo');
            // 是否存在分段数据,
            if (info.isFragmented) {
                // 持续时间 / 时间刻度
                ctx.mediaSource.duration = info.fragment_duration / info.timescale;
            } else {
                ctx.mediaSource.duration = info.duration / info.timescale;
            }
            // 当请求到了MP4 Box的 moov box之后解析其中包含的视频的元信息，暂停发送进一步的http请求
            ctx.stop();
            // 初始化所有SourceBuffer
            ctx.initializeAllSourceBuffers();
        }

        this.mp4boxfile.onSegment = function(id,user,buffer,sampleNum,is_last) { 
            //sb = sourcebuffer
            var sb = user;
		    // saveBuffer(buffer, 'track-'+id+'-segment-'+sb.segmentIndex+'.m4s');
            sb.segmentIndex++;
            sb.pendingAppends.
                push({ id: id, buffer: buffer, sampleNum: sampleNum, is_last: is_last });
            ctx.onUpdateEnd.call(sb, true, false, ctx);
        }

        this.mp4boxfile.onItem = function(item) {
            debugger
        }
        // 用户跳转
        this.video.onseeking = (e) => {
            var i, start, end;
            var seek_info;
            // 检查上一次跳跃操作的时间（this.lastSeekTime）是否与当前时间不同。如果不同，表示发生了跳跃操作
            if (this.lastSeekTime !== this.video.currentTime) {
                for (i = 0; i < this.video.buffered.length; i++) {
                    start = this.video.buffered.start(i);
                    end = this.video.buffered.end(i);
                    if (this.video.currentTime >= start && this.video.currentTime <= end) {
                        return;
                    }
                }
                this.downloader.stop();
                // 根据当前播放时间进行跳跃，获取跳跃后的信息。
                seek_info = this.mp4boxfile.seek(this.video.currentTime, true);
                this.downloader.setChunkStart(seek_info.offset);
                this.downloader.resume();
                this.lastSeekTime = this.video.currentTime;
            }
        }
    }

    start() {
        this.downloader.setChunkStart(this.mp4boxfile.seek(0, true).offset);
        // 启动MP4Box解析媒体文件
        this.mp4boxfile.start();
        // 恢复下载器，开始下载媒体数据。
        this.downloader.resume();
    }

    reset() {

    }
    //停止当前还在发送中的http请求
    stop() {
        if (!this.downloader.isStopped()) {
            this.downloader.stop();
        }
    }
    /**
     * @description 根据传入的媒体轨道的类型构建对应的SourceBuffer
     * @param mp4track 
     */
    addBuffer(mp4track: MediaTrack) {
        var track_id = mp4track.id;
        var codec = mp4track.codec;
        var mime = 'video/mp4; codecs=\"'+ codec +'\"';
        // var kind = mp4track.kind;
        var sb: MP4SourceBuffer;
        if (MediaSource.isTypeSupported(mime)) {
            try {
                console.log("MSE - SourceBuffer #"+track_id,"Creation with type '"+mime+"'")
                Log.info("MSE - SourceBuffer #"+track_id,"Creation with type '"+mime+"'");
                // 根据moov box中解析出来的track去一一创建对应的sourcebuffer
                sb = this.mediaSource.addSourceBuffer(mime);
                sb.addEventListener("error", function(e) {
                    Log.error("MSE SourceBuffer #"+track_id , e);
                });
                sb.ms = this.mediaSource;
                sb.id = track_id;
                this.mp4boxfile.setSegmentOptions(track_id, sb, { nbSamples: 1000 });
                sb.pendingAppends = [];
            } catch (e) {
                Log.error("MSE - SourceBuffer #" + track_id,"Cannot create buffer with type '" + mime + "'" + e);
            }
        } else {
            throw new Error(`你的浏览器不支持${mime}媒体类型`)
        }
    }

    // 开始加载视频媒体文件
    loadFile() {
        let ctx = this;
        if(this.mediaSource.readyState !== "open") {
            this.mediaSource.onsourceopen = this.loadFile.bind(ctx);
            return;
        }
        // 先写死，之后在修改
        this.downloader.setInterval(500);
	    this.downloader.setChunkSize(1000000);
	    this.downloader.setUrl(this.url);
        this.downloader.setCallback(
            // end表示这一次的请求是否已经将整个视频文件加载过来
            function(response: MP4ArrayBuffer, end: boolean, error: FactoryObject) {
                var nextStart = 0;
                if (response) {
                    // 设置文件加载的进度条
                    nextStart = ctx.mp4boxfile.appendBuffer(response, end);
                }
                if (end) {
                    // 如果存在end的话则意味着所有的chunk已经加载完毕
                    ctx.mp4boxfile.flush();
                } else {
                    ctx.downloader.setChunkStart(nextStart); 			
                }
                if (error) {
                    ctx.reset();
                }
            }
        )
        // 开始下载媒体文件
        this.downloader.start();
        // 开始播放视频
        this.video.play();
    }
    // 初始化 SourceBuffer
    initializeAllSourceBuffers() {
        if (this.mediaInfo) {
            var info = this.mediaInfo;
            // 遍历所有的媒体轨道
            for (var i = 0; i < info.tracks.length; i++) {
                var track = info.tracks[i];
                // 为每个轨道调用 addBuffer 方法，以创建对应的 SourceBuffer。
                this.addBuffer(track);
            }
            this.initializeSourceBuffers();
        }
    }

    initializeSourceBuffers() {
        // 获取初始化段（initSegs）的信息。
        var initSegs = this.mp4boxfile.initializeSegmentation();
        for (var i = 0; i < initSegs.length; i++) {
            var sb = initSegs[i].user;
            if (i === 0) {
                sb.ms.pendingInits = 0;
            }
            this.onInitAppended = this.onInitAppended.bind(this);
            sb.addEventListener("updateend", this.onInitAppended);
            Log.info("MSE - SourceBuffer #" + sb.id, "Appending initialization data");
            sb.appendBuffer(initSegs[i].buffer);
            sb.segmentIndex = 0;
            sb.ms.pendingInits++;
        }
    }
    // 处理初始化数据追加的事件回调
    onInitAppended(e:Event) {
        console.log(this,'this');
        let ctx = this;
        var sb = e.target as MP4SourceBuffer;
        // MediaSource 处于打开状态
	    if (sb.ms.readyState === "open") {
            sb.sampleNum = 0;
            // 防止重复触发
            sb.removeEventListener('updateend', this.onInitAppended);
            sb.addEventListener('updateend', this.onUpdateEnd.bind(sb, true, true, ctx));
            /* In case there are already pending buffers we call onUpdateEnd to start appending them*/
            this.onUpdateEnd.call(sb, false, true, ctx);
            sb.ms.pendingInits--;
            if (sb.ms.pendingInits === 0) {
                this.start();
            }
        }
    }

    onUpdateEnd(isNotInit: boolean, isEndOfAppend: boolean, ctx: MediaPlayer) {
        if (isEndOfAppend === true) {
            if (isNotInit === true) {
                // updateBufferedString(this, "Update ended");
            }
            if ((this as unknown as MP4SourceBuffer).sampleNum) {
                ctx.mp4boxfile.releaseUsedSamples((this as unknown as MP4SourceBuffer).id, (this as unknown as MP4SourceBuffer).sampleNum);
                delete (this as unknown as MP4SourceBuffer).sampleNum;
            }
            // 如果媒体文件的结尾标志 (is_last) 被设置，表示媒体流已结束，触发 endOfStream
            if ((this as unknown as MP4SourceBuffer).is_last) {
                (this as unknown as MP4SourceBuffer).ms.endOfStream();
            }
        }
        if ((this as unknown as MP4SourceBuffer).ms.readyState === "open" && (this as unknown as MP4SourceBuffer).updating === false && (this as unknown as MP4SourceBuffer).pendingAppends.length > 0) {
            var obj = (this as unknown as MP4SourceBuffer).pendingAppends.shift();
            (this as unknown as MP4SourceBuffer).sampleNum = obj.sampleNum;
            (this as unknown as MP4SourceBuffer).is_last = obj.is_last;
            (this as unknown as MP4SourceBuffer).appendBuffer(obj.buffer);
        }
    }
}
export default MediaPlayer;