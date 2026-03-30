export type VisionHorizon = "6m" | "1y" | "2-3y";

export type VisionArea = {
  area: string;
  statement: string;
  isCustom: boolean;
  horizon: VisionHorizon;
  sourceScore: number;
};

export type CriticalHabit = {
  area: string;
  habit: string;
  frequency: string;
  reason: string;
  priority: 1 | 2 | 3;
};

