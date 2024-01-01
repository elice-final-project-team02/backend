import mongoose, { Schema, Document } from "mongoose";

interface ILongTermSchedule {
  careDay: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  startTime: Date;
  endTime: Date;
}

interface IShortTermSchedule {
  careDate: Date; // 요일 연동
  startTime: Date;
  endTime: Date;
}

export interface IReservation extends Document {
  postId: Schema.Types.ObjectId;
  isLongTerm: boolean;
  longTerm?: {
    startDate: Date;
    schedule: Array<ILongTermSchedule>;
  } | null;
  shortTerm?: Array<IShortTermSchedule> | null;
  hourlyRate: number;
  negotiableRate: boolean;
  status: "모집중" | "완료";
}

const reservationSchema = new Schema<IReservation>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  isLongTerm: { type: Boolean, required: true },
  longTerm: {
    startDate: { type: Date },
    schedule: [
      {
        careDay: { type: String, enum: ["월", "화", "수", "목", "금", "토", "일"] },
        startTime: { type: Date },
        endTime: { type: Date },
      },
    ],
  },
  shortTerm: [
    {
      careDate: { type: Date },
      startTime: { type: Date },
      endTime: { type: Date },
    },
  ],
  hourlyRate: { type: Number, required: true },
  negotiableRate: { type: Boolean, required: true },
  status: { type: String, required: true, enum: ["모집중", "완료"] },
});

export const ReservationModel = mongoose.model<IReservation>("Reservation", reservationSchema);
