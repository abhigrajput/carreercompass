export type TimetableSubjectBlock = {
  subject: string;
  duration: string;
  topics: string[];
  resources: string[];
};

export type TimetableDay = {
  day: string;
  subjects: TimetableSubjectBlock[];
};

export type TimetableWeek = {
  week: number;
  days: TimetableDay[];
};

export type TimetablePayload = {
  weeks: TimetableWeek[];
};
