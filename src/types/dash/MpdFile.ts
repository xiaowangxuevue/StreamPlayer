//  媒体播放清单（Media Presentation Description，MPD）

/**
 * @description MIME类型
 */
export type MediaType =
  | "video/mp4"
  | "audio/mp4"
  | "text/html"
  | "text/xml"
  | "text/plain"
  | "image/png"
  | "image/jpeg";

export type PeriodRequest = {
  "videoRequest":MediaVideoResolve;
  "audioRequest":MeidaAudioResolve;
}


/**
 * @description video类型媒体分辨率
 */

export type MediaVideoResolve = {
  "320*180"?: Array<SegmentRequest | RangeRequest>;
  "512*288"?: Array<SegmentRequest | RangeRequest>;
  "640*360"?: Array<SegmentRequest | RangeRequest>;
  "768*432"?: Array<SegmentRequest | RangeRequest>;
  "1024*576"?: Array<SegmentRequest | RangeRequest>;
  "1280*720"?: Array<SegmentRequest | RangeRequest>;
  "1920*1080"?: Array<SegmentRequest | RangeRequest>;
};


export type MeidaAudioResolve = {
  [props:string]:Array<SegmentRequest | RangeRequest>

}

export type RangeRequest = {
  type:"range";
  url: string;
  range?: string;
}
/**
 * @description 请求整个媒体段
 */
export type SegmentRequest = {
  type:"segement";
  url:string;
}

export type Document = {
  tag:'Document';
  root:Mpd
}
/**
 * @description mediaPresentationDuration表示媒体文件的总时长
 */
export type Mpd = {
  tag: "MPD";
  type?: "static" | "dynamic";
  children: Array<Period>;
  maxSegmentDuration: string | null;
  availabilityStartTime: string | null;  // 可用性开始时间
  mediaPresentationDuration: string | null;
  minBufferTime: string | null;
  minimumUpdatePeriod: string | null;
};

export type Period = {
  tag: "Period";
  id: string | null;
  duration: string | null;
  start: string | null;
  children: Array<AdaptationSet | BaseURL>; // 适应集合
};

export type BaseURL = {
  tag: "BaseURL";
  url: string;
};
/**
 * @description startWithSAP:每个Segment的第startWithSAP帧都是关键帧
 */
export type AdaptationSet = {
  tag: "AdaptationSet";
  children: Array<SegmentTemplate | Representation>;
  segmentAlignment: boolean | null;
  mimeType: MediaType | null;
  startWithSAP: number | null;   //开始关键帧
};
/**
 * @description 用于描述对应的Representation下需要加载的initialSegment和mediaSegment的地址，具体的格式为:
 * @description initialization="$RepresentationID$-Header.m4s" media="$RepresentationID$-270146-i-$Number$.m4s"
 */
export type SegmentTemplate = {
  tag: "SegmentTemplate";
  initialization: string | null;
  media: string | null;
};
/**
 * @description width * height --> 视频的分辨率
 */
export type Representation = {
  tag: "Representation";
  bandWidth: number | null;
  codecs: string | null;
  audioSamplingRate: string | null;
  id: string | null;
  width: number | null;
  height: number | null;
  mimeType: MediaType | null;
  children?: Array<BaseURL | SegmentBase | SegmentList>;

};

export type SegmentBase = {
  tag: "SegmentBase";
  indexRange: string;
  child: Initialization;
};

export type Initialization = {
  tag: "Initialization";
  range?: string | null;
  sourceURL?: string | null;
};

export type SegmentList = {
  tag: "SegmentList";
  duration: number | null;
  children: Array<Initialization | SegmentURL>;
}

export type SegmentURL = {
  tag: "SegmentURL";
  media: string;
  mediaRange?: string;
}

