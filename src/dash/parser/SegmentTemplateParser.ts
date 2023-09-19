import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
import { Representation, SegmentTemplate, Mpd, Period, AdaptationSet } from "../../types/dash/MpdFile";
/* 
 @description 该类仅仅用于处理MPD文件中具有SegmentTemplate此种情况
*/

class SegmentTemplateParser {
  private config: FactoryObject;
  constructor(ctx: FactoryObject, ...args: any[]) {
    this.config = ctx.context;
    this.setup();
  }

  setup() {

  }

  parse(Mpd: Mpd | Period | AdaptationSet) {
    this.parseNodeSegmentTemplate(Mpd as Mpd);

  }


  parseNodeSegmentTemplate(Mpd: FactoryObject) {
    Mpd["Period_asArray"].forEach(Period => {
      Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
        AdaptationSet["Representation_asArray"].forEach(Representation => {
          let SegmentTemplate = Representation["SegmentTemplate"];
          if (SegmentTemplate) {
            this.generateInitializationURL(SegmentTemplate, Representation)
            this.generateMediaURL(SegmentTemplate, Representation)
          }


        })
      })
    })

  }
  // 格式  $RepresentationID$-Header.m4s
  generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation) {
    let templateReg: RegExp = /\$(.+?)\$/ig;
    let initialization = SegmentTemplate.initialization;
    let r;
    let formatArray = new Array<string>();
    let replaceArray = new Array<string>();
    if (templateReg.test(initialization)) {
      templateReg.lastIndex = 0;
      while (r = templateReg.exec(initialization)) {
        formatArray.push(r[0]);
        if (r[1] === "Number") {
          r[1] = "1";
        } else if (r[1] === "RepresentationID") {
          r[1] = parent.id!;
        }
        replaceArray.push(r[1]);
      }
      let index = 0;
      while (index < replaceArray.length) {
        initialization = initialization.replace(formatArray[index], replaceArray[index]);
        index++;
      }
    }
    parent.initializationURL = initialization;
  }

  generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation) {
    let templateReg: RegExp = /\$(.+?)\$/ig;
    let media = SegmentTemplate.media;
    let r;
    let formatArray = new Array<string>();
    let replaceArray = new Array<string>();
    parent.mediaURL = new Array<string>();
    if (templateReg.test(media)) {
      templateReg.lastIndex = 0
      while (r = templateReg.exec(media)) {
        formatArray.push(r[0]);
        if (r[1] === "Number") {
          r[1] = "@Number@";
        } else if (r[1] === "RepresentationID") {
          r[1] = parent.id;
        }
        replaceArray.push(r[1]);
      }
    }

    let index = 0;
    while (index < replaceArray.length) {
      media = media.replace(formatArray[index], replaceArray[index]);
      index++;
    }
    for (let i = 1; i <= Math.ceil(parent.duration / parent.segmentDuration); i++) {
      let s = media;
      while (s.includes("@Number@")) {
        s = s.replace("@Number@", `${i}`);
      }
      parent.mediaURL[i] = s;
    }
  }

}

const factory = FactoryMaker.getSingleFactory(SegmentTemplateParser);
export default factory;
export { SegmentTemplateParser };