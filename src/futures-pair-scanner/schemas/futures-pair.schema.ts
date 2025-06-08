import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  Strategy,
  StrategyAnalysisResult,
} from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

export enum FuturesPairStatus {
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
}

@Schema({ timestamps: true })
export class FuturesPair extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [Object] })
  results: StrategyAnalysisResult[];

  // @Prop({ type: Object, required: true })
  // params: FuturesPairParams;

  @Prop({ type: Array, required: false })
  strategies: Strategy[];

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
