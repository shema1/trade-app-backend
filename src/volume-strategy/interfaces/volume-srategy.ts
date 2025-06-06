import { FuturesPairStrategyParams } from 'src/futures-pair-scanner/interfaces/analysis-result';

export interface VolumeStrategyItem extends FuturesPairStrategyParams {
  minVolumeRatio: number;
  minConfidence: number;
}
