import { FactoryObject } from "../../types/dash/Factory";
import { Representation, SegmentTemplate, Mpd, Period, AdaptationSet } from "../../types/dash/MpdFile";
declare class SegmentTemplateParser {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    parse(Mpd: Mpd | Period | AdaptationSet): void;
    parseNodeSegmentTemplate(Mpd: FactoryObject): void;
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<SegmentTemplateParser>;
export default factory;
export { SegmentTemplateParser };
