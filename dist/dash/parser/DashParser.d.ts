import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd, Period } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"];
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
    mergeNode(node: FactoryObject, compare: FactoryObject): void;
    mergeNodeSegementTemplate(Mpd: Mpd): void;
    static setDurationForRepresentation(Mpd: Mpd | Period | AdaptationSet): void;
    static getTotalDuration(Mpd: Mpd): number | never;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default factory;
export { DashParser };
