import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest } from "../../types/dash/Net";
declare class StreamController {
    private config;
    private baseURLParser;
    private baseURLPath;
    private URLUtils;
    private eventBus;
    private urlLoader;
    private videoResolvePower;
    private audioResolvePower;
    private segmentRequestStruct;
    constructor(ctx: FactoryObject, ...args: any[]);
    initialEvent(): void;
    setup(): void;
    onManifestParseCompleted(manifest: Mpd): void;
    startStream(Mpd: Mpd): void;
    loadInitialSegment(streamId: any): Promise<[any, any]>;
    loadMediaSegment(streamId: any, mediaId: any): Promise<[any, any]>;
    loadSegment(videoURL: any, audioURL: any): Promise<[any, any]>;
    generateBaseURLPath(Mpd: Mpd): void;
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest;
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<StreamController>;
export default factory;
export { StreamController };
