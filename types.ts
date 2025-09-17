export interface User {
  id: string;
  email: string;
  status: 'Active' | 'Suspended';
  plan: 'Pro' | 'Free';
}

export type JobStatus = 'succeeded' | 'failed' | 'running' | 'pending' | 'completed';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  submittedAt: string;
  result: string;
}


export enum Stage {
  EGG = 'egg',
  LARVA = 'larva',
  PUPA = 'pupa',
  ADULT = 'adult',
  UNKNOWN = 'unknown',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export interface Photo {
  id: string;
  url: string;
  thumbUrl: string;
  createdAt: string;
  isPrimary: boolean;
}

export interface Measurement {
  id: string;
  measuredAt: string;
  weightG?: number;
  lengthMm?: number;
  jawWidthMm?: number;
  note?: string;
}

export interface Individual {
  id: string;
  individualCode: string;
  speciesCommon: string;
  speciesScientific: string;
  stage: Stage;
  sex: Sex;
  birthDate?: string;
  introducedDate: string;
  lineName?: string;
  parentCodeM?: string;
  parentCodeF?: string;
  notes?: string;
  photos: Photo[];
  measurements: Measurement[];
  publicProfileUrl?: string;
}