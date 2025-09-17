import { Stage, Sex } from '../types';

export const stageTranslations: Record<Stage, string> = {
  [Stage.EGG]: '卵',
  [Stage.LARVA]: '幼虫',
  [Stage.PUPA]: '蛹',
  [Stage.ADULT]: '成虫',
  [Stage.UNKNOWN]: '不明',
};

export const sexTranslations: Record<Sex, string> = {
  [Sex.MALE]: 'オス',
  [Sex.FEMALE]: 'メス',
  [Sex.UNKNOWN]: '不明',
};
