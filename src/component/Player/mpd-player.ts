// import { parseMpd } from "../../dash/parseMpd";
// import { Axios } from "../../axios/Axios";
// import { Player } from "./player";
// import { AxiosReturnType } from "../../types/AxiosRequest";
// import { PeriodRequest, RangeRequest, SegmentRequest } from "../../types/dash/MpdFile";
// export class MpdPlayer {
//   private player: Player;
//   private mpd: Document;
//   private requestInfo: any;
//   private mpdUrl: string;
//   private axios: Axios;
//   constructor(player: Player) {
//     this.player = player;
//     this.axios = new Axios();
//     this.mpdUrl = this.player.playerOptions.url;
//     this.init();
//   }

//   async init() {
//     this.player.video.controls = true
//     await this.getMpdFile(this.mpdUrl);
//     // 遍历每一个Period
//     this.requestInfo.mpdRequest.forEach(async (child) => {
//       // let videoResolve = child.videoRequest["1920*1080"];
//       // let audioResolve = child.audioRequest["48000"];
//       // let val = await Promise.all([
//       //   this.getInitializationSegment(videoResolve[0].url),
//       //   this.getInitializationSegment(audioResolve[0].url),
//       // ]);
//       // console.log(val)
//       await this.handlePeriod(child)
//     });
//   }

//   initEvent() {
//     this.player.toolbar.emit("mounted");
//     this.player.emit("mounted", this);
//   }
//   /**
//    * @description 获取并且解析MPD文件
//    */
//   async getMpdFile(url: string) {
//     let val = await this.axios.get(url, {}, "text");
//     let parser = new DOMParser();
//     let document = parser.parseFromString(val.data as string , "text/xml");
//     let result = parseMpd(
//       document,
//       "https://dash.akamaized.net/envivio/EnvivioDash3/"
//     );
//     this.mpd = document;
//     this.requestInfo = result;
//   }

//   async handlePeriod(child: PeriodRequest) {
//     let videoResolve = child.videoRequest["1920*1080"];
//     let audioResolve = child.audioRequest["48000"];
//     await this.handleInitializationSegment(
//       videoResolve[0].url,
//       audioResolve[0].url
//     );
//     await this.handleMediaSegment(videoResolve.slice(1),audioResolve.slice(1));
//   }

//   async handleInitializationSegment(videoUrl: string, audioUrl: string) {
//     let val = await Promise.all([
//       this.getSegment(videoUrl),
//       this.getSegment(audioUrl),
//     ]);
//   }

//   async handleMediaSegment(videoRequest: (SegmentRequest | RangeRequest)[], audioRequest: (SegmentRequest | RangeRequest)[]) {
//     for (
//       let i = 0;
//       i < Math.min(videoRequest.length, audioRequest.length);
//       i++
//     ) {
//       let val = await Promise.all([
//         this.getSegment(videoRequest[i].url),
//         this.getSegment(audioRequest[i].url),
//       ]);
//       console.log(i + 1, val);
//     }
//   }
//   /**
//    * @description 根据解析到的MPD文件获取初始段（Initialization Segment）
//    */
//   getSegment(url: string):Promise<AxiosReturnType> {
//     return this.axios.get(url, {}, "arraybuffer")
//   }
// }

import MediaPlayer from "../../dash/MediaPlayer";
import { Player } from "./player";
export class MpdPlayer {
  constructor(player:Player) {
    let mediaPlayer = MediaPlayer().create(); 
    mediaPlayer.attachSource(player.playerOptions.url);
  }
}