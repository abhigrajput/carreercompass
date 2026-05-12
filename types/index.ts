export type LocaleCode = "en" | "kn" | "hi";

export type StudentClass = "10" | "11" | "12";

export type CitySlug = "bengaluru" | "mysuru" | "hubballi";

export type StreamSlug = "science" | "commerce" | "arts";

export interface StudentProfile {
  id?: string;
  name: string;
  class: StudentClass;
  city: CitySlug;
  language: LocaleCode;
  knownGoal?: string | null;
  stream?: StreamSlug | null;
  email?: string | null;
  updatedAt?: string;
}

export interface CareerItem {
  id: string;
  name: string;
  nameKn: string;
  nameHi: string;
  domain: string;
  icon: string;
  avgSalary: string;
  stream: string; // 'science' | 'commerce' | 'arts' | 'any'
  description: string;
  descriptionKn: string;
  entranceExams: string[];
  topCollegesKarnataka: string[];
}

export interface CollegeItem {
  id: string;
  name: string;
  city: string;
  type: "government" | "private" | "aided";
  streams: StreamSlug[];
  careers: string[];
  cetCutoffGeneral?: number;
  cetCutoffSc?: number;
  cetCutoffSt?: number;
  website: string;
  ranking?: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface RoadmapPhase {
  title: string;
  weeks: string;
  bullets: string[];
}

export interface RoadmapPayload {
  headline: string;
  phases: RoadmapPhase[];
  closingNote: string;
}

export interface GameQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  rationale?: string;
}

export interface GameDomainPack {
  domain: string;
  title: string;
  questions: GameQuestion[];
}
