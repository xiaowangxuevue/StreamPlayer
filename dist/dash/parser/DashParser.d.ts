import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { Representation, SegmentTemplate } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    private templateReg;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"];
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
    mergeNode(node: FactoryObject, compare: FactoryObject): void;
    mergeNodeSegementTemplate(Mpd: FactoryObject): void;
    parseNodeSegmentTemplate(Mpd: FactoryObject): void;
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default factory;
export { DashParser };