class Schedule {
  careDay: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  startTime: Date;
  endTime: Date;

  constructor(careDay: "월" | "화" | "수" | "목" | "금" | "토" | "일", startTime: Date, endTime: Date) {
    this.careDay = careDay;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

export class CreatePostDTO {
  title: string;
  content: string;
  region: string;
  subRegion: string;
  careTarget: "아동" | "노인" | "장애인";
  isLongTerm: boolean;
  longTerm?: {
    startDate: Date;
    schedule: Schedule[];
  } | null;
  shortTerm?:
    | {
        careDate: Date;
        startTime: Date;
        endTime: Date;
      }[]
    | null;
  hourlyRate: number;
  negotiableRate: boolean;
  preferredmateAge: Array<"20대" | "30대" | "40대" | "50대" | "60대 이상" | "나이 무관">;
  preferredmateGender: "여성" | "남성" | "성별 무관";
  targetFeatures: string;
  cautionNotes: string;

  constructor(
    title: string,
    content: string,
    region: string,
    subRegion: string,
    careTarget: "아동" | "노인" | "장애인",
    hourlyRate: number,
    negotiableRate: boolean,
    preferredmateAge: Array<"20대" | "30대" | "40대" | "50대" | "60대 이상" | "나이 무관">,
    preferredmateGender: "여성" | "남성" | "성별 무관",
    targetFeatures: string,
    cautionNotes: string,
    isLongTerm: boolean,
    longTerm?: { startDate: Date; schedule: Schedule[] },
    shortTerm?: { careDate: Date; startTime: Date; endTime: Date }[],
  ) {
    this.title = title;
    this.content = content;
    this.region = region;
    this.subRegion = subRegion;
    this.careTarget = careTarget;
    this.isLongTerm = isLongTerm;
    this.longTerm = longTerm;
    this.shortTerm = shortTerm;
    this.hourlyRate = hourlyRate;
    this.negotiableRate = negotiableRate;
    this.preferredmateAge = preferredmateAge;
    this.preferredmateGender = preferredmateGender;
    this.targetFeatures = targetFeatures;
    this.cautionNotes = cautionNotes;
  }
}
