export interface QuestionOption {
  id: string;
  text: string;
  score: number;
}

export interface Question {
  id: string;
  type: "single_select" | "multi_select" | "text" | "scale" | "number";
  title: string;
  options?: QuestionOption[];
  required: boolean;
  minScore?: number;
  maxScore?: number;
}

export interface FeedbackRange {
  id: string;
  minScore: number;
  maxScore: number;
  message: string;
  type: "text" | "image" | "link";
  imageUrl?: string;
  linkUrl?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  feedbackRanges: FeedbackRange[];
  active: boolean;
  frequency: "weekly" | "biweekly" | "monthly";
  responses: number;
  createdAt: string;
  maxPossibleScore: number;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  patientName: string;
  patientEmail?: string;
  submittedAt: string;
  answers: Record<string, string | string[]>;
  totalScore: number;
  feedbackReceived: string;
}