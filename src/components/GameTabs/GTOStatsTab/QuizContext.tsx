import { createContext, useContext } from 'react';

export interface QuizAnswers {
  handStrength: string;
  potOdds: string;
  breakEvenEquity: string;
  // PotGeometry answers
  potSize: string;
  effectiveStack: string;
  spr: string;
  betSizePercent: string;
  // PotOddsBreakeven answers
  bluffBreakeven: string;
}

export interface QuizContextType {
  quizMode: boolean;
  showResults: boolean;
  quizAnswers: QuizAnswers;
  setQuizAnswers: React.Dispatch<React.SetStateAction<QuizAnswers>>;
  handleAnswerChange: (field: keyof QuizAnswers, value: string) => void;
  isAnswerCorrect: (userAnswer: string, correctAnswer: number, tolerance?: number) => boolean;
}

export const QuizContext = createContext<QuizContextType | null>(null);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
};