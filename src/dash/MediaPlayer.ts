import { FactoryObject } from "../types/dash/Factory";
import EventBusFactory, { EventBus } from "./event/EventBus";
import { EventConstants } from "./event/EventConstants";
import FactoryMaker from "./FactoryMaker";
import URLLoaderFactory, { URLLoader } from "./net/URLLoader";
import DashParserFactory,{ DashParser } from "./parser/DashParser";
import MediaPlayerControllerFactory, { MediaPlayerController } from "./vo/MediaPlayerController";
import StreamControllerFactory, {
    StreamController
} from "./stream/StreamController"
/**
 * @description 整个dash处理流程的入口类MediaPlayer,类似与项目的中转中心，用于接收任务然后分配给不同解析器去完成
 */
class MediaPlayer {
    private config: FactoryObject = {};
    private urlLoader: URLLoader;  //类型为URLLoader
    private eventBus: EventBus;
    private dashParser:DashParser;
    private mediaPlayerController:MediaPlayerController;
    private streamController:StreamController;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
        this.initializeEvent();
        
    }

    //初始化类
    setup() {
        this.urlLoader = URLLoaderFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        // ignoreRoot -> 忽略Document节点，从MPD开始作为根节点
        this.dashParser = DashParserFactory({ignoreRoot:true}).getInstance();
        this.streamController = StreamControllerFactory().create()
    }


    initializeEvent() {
        this.eventBus.on(EventConstants.MANIFEST_LOADED,this.onManifestLoaded,this);
        this.eventBus.on(EventConstants.SEGEMTN_LOADED,this.onSegmentLoaded,this);
    }

    resetEvent() {
        this.eventBus.off(EventConstants.MANIFEST_LOADED,this.onManifestLoaded,this);
        this.eventBus.off(EventConstants.SEGEMTN_LOADED,this.onSegmentLoaded,this);
    }

    onManifestLoaded(data:string) { 

        let manifest = this.dashParser.parse(data);  //解析后的manifest

        console.log('解析后',manifest)

        this.eventBus.trigger(EventConstants.MANIFEST_PARSE_COMPLETED,manifest)
    }

    onSegmentLoaded(data:ArrayBuffer[]) {
        console.log("加载segment成功",data);
        let videoBuffer = data[0];
        let audioBuffer = data[1];
        
    }

    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url 
     */
    public attachSource(url:string) {
        this.eventBus.trigger(EventConstants.SOURCE_ATTACHED,url);
        this.urlLoader.load({url,responseType:"text"},'Manifest');
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayer);


export default factory;