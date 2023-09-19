import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    private eventBus;
    private mpdURL;
    private URLUtils;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initialEvent(): void;
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"];
    onSourceAttached(url: string): void;
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
    mergeNode(node: FactoryObject, compare: FactoryObject): void;
    mergeNodeSegementTemplate(Mpd: Mpd): void;
    setResolvePowerForRepresentation(Mpd: Mpd): void;
    setBaseURLForMpd(Mpd: Mpd): void;
    setDurationForRepresentation(Mpd: Mpd): void;
    getTotalDuration(Mpd: Mpd): number | never;
    setSegmentDurationForRepresentation(Mpd: Mpd): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default factory;
export { DashParser };
