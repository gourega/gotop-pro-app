import React from 'react';

export interface QuizQuestion {
  question_text: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface TrainingModule {
  id: string;
  topic: string;
  title: string;
  mini_course: string;
  lesson_content: string;
  video_url: string;
  infographic_url: string;
  quiz_questions: QuizQuestion[];
  exercises: string;
  tips: string[];
  next_steps: string;
}

export interface User {
  uid: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  establishmentName?: string;
  sector?: string;
  teamSize?: number;
  experience?: number;
  photoURL?: string;
  purchasedModules?: TrainingModule[];
  progress?: { [moduleId: string]: { score: number; completed: boolean } };
  badges?: BadgeKey[];
  geminiCredits?: number;
}

export interface PendingPurchase {
  id?: string;
  phone: string;
  modules: TrainingModule[];
  totalPrice: number;
  timestamp: any; // Firestore Timestamp
}

export type BadgeKey = 'PROFILE_COMPLETE' | 'FIRST_MODULE' | 'HIGH_SCORE' | 'FIVE_MODULES';

export interface Badge {
  key: BadgeKey;
  name: string;
  description: string;
  // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}
