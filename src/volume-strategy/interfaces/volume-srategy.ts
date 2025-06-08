import { StrategyParams } from 'src/strategies-handler/interfaces/strategies-handler-common.interface';

export interface VolumeStrategyItem extends StrategyParams {
  minVolumeRatio: number;
  // minConfidence: number;
}
