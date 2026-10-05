import { SentencePattern } from '../types';

export const SENTENCE_PATTERNS: SentencePattern[] = [
  {
    id: 1,
    question: "What's your address?",
    questionVi: "Địa chỉ của bạn là gì?",
    answer: "It's 105, Hoa Binh Lane.",
    answerVi: "Là số 105, ngõ Hoà Bình.",
    speakerA: "Mickey",
    speakerB: "Donald",
    context: "Hỏi và đáp về địa chỉ nhà"
  },
  {
    id: 2,
    question: "Where do you live?",
    questionVi: "Bạn sống ở đâu?",
    answer: "I live in Flat 18 on the second floor of Hanoi Tower.",
    answerVi: "Mình sống ở Căn hộ 18 trên tầng 2 của toà tháp Hà Nội.",
    speakerA: "Minnie",
    speakerB: "Daisy",
    context: "Hỏi và đáp về nơi ở cụ thể trong toà nhà"
  },
  {
    id: 3,
    question: "What's the village like?",
    questionVi: "Ngôi làng đó như thế nào?",
    answer: "It's small and quiet.",
    answerVi: "Nó nhỏ và yên tĩnh.",
    speakerA: "Simba",
    speakerB: "Moana",
    context: "Hỏi và miêu tả đặc điểm làng quê"
  },
  {
    id: 4,
    question: "What's the city like?",
    questionVi: "Thành phố đó như thế nào?",
    answer: "It's big and crowded.",
    answerVi: "Nó to lớn và đông đúc.",
    speakerA: "Woody",
    speakerB: "Buzz",
    context: "Hỏi và miêu tả đặc điểm thành phố"
  },
  {
    id: 5,
    question: "Who do you live with?",
    questionVi: "Bạn sống cùng với ai?",
    answer: "I live with my parents and younger sister.",
    answerVi: "Mình sống cùng với bố mẹ và em gái.",
    speakerA: "Aladdin",
    speakerB: "Jasmine",
    context: "Hỏi về người thân cùng chung sống"
  },
  {
    id: 6,
    question: "Do you like living in your hometown?",
    questionVi: "Bạn có thích sống ở quê hương của bạn không?",
    answer: "Yes, I do. Because it's very peaceful and pretty.",
    answerVi: "Có, mình rất thích. Bởi vì nơi đó rất thanh bình và xinh đẹp.",
    speakerA: "Elsa",
    speakerB: "Anna",
    context: "Hỏi cảm nhận về quê hương"
  }
];

export interface UnscrambleItem {
  id: number;
  original: string;
  vietnamese: string;
  words: string[];
}

export const UNSCRAMBLE_ITEMS: UnscrambleItem[] = [
  {
    id: 1,
    original: "What is your address?",
    vietnamese: "Địa chỉ của bạn là gì?",
    words: ["What", "is", "your", "address?"]
  },
  {
    id: 2,
    original: "It is eighty-one Tran Hung Dao Street.",
    vietnamese: "Đó là số 81 đường Trần Hưng Đạo.",
    words: ["It", "is", "eighty-one", "Tran", "Hung", "Dao", "Street."]
  },
  {
    id: 3,
    original: "I live in a small quiet village.",
    vietnamese: "Mình sống ở một ngôi làng nhỏ yên tĩnh.",
    words: ["I", "live", "in", "a", "small", "quiet", "village."]
  },
  {
    id: 4,
    original: "The city is large and crowded.",
    vietnamese: "Thành phố rất rộng lớn và đông đúc.",
    words: ["The", "city", "is", "large", "and", "crowded."]
  },
  {
    id: 5,
    original: "She lives on the fifth floor of the tower.",
    vietnamese: "Cô ấy sống ở tầng năm của toà tháp.",
    words: ["She", "lives", "on", "the", "fifth", "floor", "of", "the", "tower."]
  }
];
