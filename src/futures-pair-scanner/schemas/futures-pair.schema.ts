import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AnalysisResult,
  FuturesPairStrategy,
} from '../interfaces/analysis-result';

export enum FuturesPairStatus {
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
}

@Schema({ timestamps: true })
export class FuturesPair extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [Object] })
  results: AnalysisResult[];

  // @Prop({ type: Object, required: true })
  // params: FuturesPairParams;

  @Prop({ type: Array, required: false })
  strategies: FuturesPairStrategy[];

  @Prop({
    type: String,
    enum: Object.values(FuturesPairStatus),
    default: FuturesPairStatus.ACTIVE,
  })
  status: FuturesPairStatus;

  @Prop({ default: 0 })
  cycleCount: number;

  @Prop()
  lastScanTime?: Date;
}

export const FuturesPairSchema = SchemaFactory.createForClass(FuturesPair);
