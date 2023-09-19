import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig, XHRConfig, RequestType } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import HTTPRequest from "./HTTPRequest";
import { EventConstants } from "../event/EventConstants";
import EventBusFactory, { EventBus } from "../event/EventBus";
import XHRLoaderFactory, { XHRLoader } from "./XHRLoader";

class URLLoader {
    private config: FactoryObject = {};
    private xhrLoader: XHRLoader;
    private eventBus: EventBus
    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.context;
        this.setup();

    }
    private _loadManifest(config: XHRConfig) {
        this.xhrLoader.load(config);
    }

    setup() {
        this.xhrLoader = XHRLoaderFactory({}).getInstance();

        this.eventBus = EventBusFactory({}).getInstance()
    }
    // 每调用一次load函数就发送一次请求
    load(config: URLConfig, type: RequestType) {  // type , url
        //一个HTTPRequest对象才对应一个请求
        let request = new HTTPRequest(config);
        let ctx = this
        if (type === "Manifest") {
            this._loadManifest({
                request: request,
                success: function (data) {
                    request.getResponseTime = new Date().getTime();
                    ctx.eventBus.trigger(EventConstants.MANIFEST_LOADED, data);
                },
                error: function (error) {
                    console.log(this, error)
                }
            })
        } else if (type === "Segment") {

        }


    }
}

const factory = FactoryMaker.getSingleFactory(URLLoader);
export default factory;
export { URLLoader };