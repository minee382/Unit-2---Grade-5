export type VocabCategory = 'all' | 'places' | 'adjectives' | 'addresses' | 'numbers';

export interface VocabItem {
  id: number;
  word: string;
  ipa: string;
  pos: 'n' | 'adj' | 'v' | 'adv' | 'num';
  meaning: string;
  icon: string;
  char: string;
  category: 'places' | 'adjectives' | 'addresses' | 'numbers';
  exampleEn: string;
  exampleVi: string;
  colorScheme: number; // 0 to 4
}

export interface SentencePattern {
  id: number;
  question: string;
  questionVi: string;
  answer: string;
  answerVi: string;
  speakerA: string;
  speakerB: string;
  context: string;
}

export type GameTab =
  | 'flashcards'
  | 'typingQuiz'
  | 'quiz'
  | 'match'
  | 'spelling'
  | 'listening'
  | 'sentences';
