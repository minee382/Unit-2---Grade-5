import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Flame,
  Lightbulb,
  Star,
  BookOpen,
  RefreshCw,
  Shuffle,
} from 'lucide-react';
import { VocabItem } from '../types';
import {
  playCorrectSound,
  playWrongSound,
  playClickSound,
  fireMagicConfetti,
} from '../utils/audio';

interface MissedWordRecord {
  item: VocabItem;
  userInput: string;
  expectedAnswer: string;
}

// Fisher-Yates shuffle algorithm
function shuffleList<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface TypingQuizModeProps {
  vocabList: VocabItem[];
  speechRate: number;
  onSpeak: (text: string, rate?: number) => void;
  onAddScore: (points: number) => void;
  favorites?: number[];
  onToggleFavorite?: (id: number) => void;
}

type QuizDirection = 'en-to-vi' | 'vi-to-en';

export const TypingQuizMode: React.FC<TypingQuizModeProps> = ({
  vocabList,
  speechRate,
  onSpeak,
  onAddScore,
  favorites = [],
  onToggleFavorite,
}) => {
  const [direction, setDirection] = useState<QuizDirection>('vi-to-en');
  const [questions, setQuestions] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [revealedHint, setRevealedHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [missedWords, setMissedWords] = useState<MissedWordRecord[]>([]);
  const [shuffleNotice, setShuffleNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize questions using Fisher-Yates true random shuffle
  const startNewQuiz = (newDirection = direction, customList?: VocabItem[]) => {
    const sourceList = customList && customList.length > 0 ? customList : vocabList;
    const shuffled = shuffleList(sourceList).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setStatus('idle');
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setRevealedHint(false);
    setIsFinished(false);
    setMissedWords([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Re-shuffle order on demand
  const handleShuffleQuestions = () => {
    playClickSound();
    const shuffledAll = shuffleList(questions);
    setQuestions(shuffledAll);
    setCurrentIndex(0);
    setUserInput('');
    setStatus('idle');
    setRevealedHint(false);
    setShuffleNotice('🔀 Đã xáo trộn ngẫu nhiên thứ tự từ vựng!');
    setTimeout(() => {
      setShuffleNotice(null);
      inputRef.current?.focus();
    }, 2200);
  };

  useEffect(() => {
    startNewQuiz(direction);
  }, [vocabList, direction]);

  const currentItem = questions[currentIndex];

  // Helper to normalize strings for comparison (lowercasing, trimming, removing extra punctuation)
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ');
  };

  // Check if user answer matches
  const checkAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentItem || status === 'success') return;

    const trimmed = userInput.trim();
    if (!trimmed) return;

    let isCorrect = false;
    let expected = '';

    if (direction === 'vi-to-en') {
      // User types English word (hidden)
      expected = currentItem.word;
      const target = normalize(currentItem.word);
      const input = normalize(trimmed);
      isCorrect = target === input;
    } else {
      // User types Vietnamese definition (hidden)
      expected = currentItem.meaning;
      const target = normalize(currentItem.meaning);
      const input = normalize(trimmed);
      const parts = currentItem.meaning
        .toLowerCase()
        .split(/[,/]/)
        .map((p) => normalize(p));
      isCorrect =
        target === input ||
        parts.some((p) => p === input || (input.length > 2 && p.includes(input)));
    }

    if (isCorrect) {
      setStatus('success');
      playCorrectSound();
      onSpeak(currentItem.word, speechRate);
      const bonus = streak >= 2 ? 15 : 10;
      setScore((prev) => prev + bonus);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      onAddScore(bonus);
    } else {
      setStatus('error');
      playWrongSound();
      setStreak(0);
      // Track missed word if not already added
      setMissedWords((prev) => {
        if (prev.some((m) => m.item.id === currentItem.id)) return prev;
        return [
          ...prev,
          {
            item: currentItem,
            userInput: trimmed,
            expectedAnswer: expected,
          },
        ];
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      fireMagicConfetti();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setStatus('idle');
      setRevealedHint(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleRetryCurrent = () => {
    setUserInput('');
    setStatus('idle');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleRetryMissedOnly = () => {
    const missedVocab = missedWords.map((m) => m.item);
    startNewQuiz(direction, missedVocab);
  };

  const handleSaveAllMissed = () => {
    if (!onToggleFavorite) return;
    missedWords.forEach((m) => {
      if (!favorites.includes(m.item.id)) {
        onToggleFavorite(m.item.id);
      }
    });
  };

  if (!currentItem) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header & Mode Selector */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider">
              ✨ QUIZ MODE
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Từ bị ẩn - Nhiệm vụ gõ đúng từ hoặc nghĩa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-fredoka mt-1">
            Thử Thách Gõ Từ Vựng & Nghĩa
          </h2>
        </div>

        {/* Direction Switcher & Shuffle Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={handleShuffleQuestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            title="Xáo trộn ngẫu nhiên thứ tự các câu hỏi"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span>Xáo Trộn Thứ Tự 🔀</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setDirection('vi-to-en');
                startNewQuiz('vi-to-en');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                direction === 'vi-to-en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇻🇳 Ẩn từ Tiếng Anh
            </button>
            <button
              onClick={() => {
                setDirection('en-to-vi');
                startNewQuiz('en-to-vi');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                direction === 'en-to-vi'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 Ẩn nghĩa Tiếng Việt
            </button>
          </div>
        </div>
      </div>

      {/* Shuffle Toast Alert */}
      {shuffleNotice && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-2xl text-xs font-bold text-center animate-fadeIn flex items-center justify-center gap-2 shadow-xs">
          <Shuffle className="w-4 h-4 text-amber-600 animate-spin" />
          <span>{shuffleNotice}</span>
        </div>
      )}

      {/* Main Quiz Box or Summary View */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-slate-200 shadow-xl relative overflow-hidden transition-all duration-300">
          {/* Top Progress & Score */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                Câu hỏi {currentIndex + 1} / {questions.length}
              </span>
              {streak >= 2 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs animate-bounce">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  Streak x{streak}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Đúng: {correctCount}/{questions.length}
              </span>
              <span className="text-amber-500 font-fredoka font-bold text-lg">
                ⭐ {score} điểm
              </span>
            </div>
          </div>

          {/* Prompt Area: Question Word is Hidden! */}
          <div className="text-center my-4">
            {/* Disney Buddy & Card Icon */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3">
              <span>✨ Bạn đồng hành:</span>
              <span className="text-indigo-600 font-extrabold">{currentItem.char}</span>
            </div>

            <div className="text-7xl mb-3 select-none filter drop-shadow-md">
              {currentItem.icon}
            </div>

            {/* Prompt Text according to Quiz direction */}
            {direction === 'vi-to-en' ? (
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Nghĩa Tiếng Việt cần dịch sang Tiếng Anh:
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-fredoka mt-1">
                  "{currentItem.meaning}"
                </div>
                <div className="text-sm text-slate-500 italic mt-1">
                  Loại từ: <span className="font-semibold text-slate-700">{currentItem.pos}</span>
                  {revealedHint && (
                    <span className="ml-2 text-indigo-600 font-bold">
                      • Phiên âm: {currentItem.ipa}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Từ Tiếng Anh cần nhập nghĩa Tiếng Việt:
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-700 font-fredoka mt-1 flex items-center justify-center gap-2">
                  <span>"{currentItem.word}"</span>
                  <button
                    onClick={() => onSpeak(currentItem.word, speechRate)}
                    className="p-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-slate-500 italic mt-1">
                  {currentItem.ipa} ({currentItem.pos})
                </div>
              </div>
            )}
          </div>

          {/* Target Word Hidden Placeholder */}
          <div className="my-5 flex justify-center">
            {direction === 'vi-to-en' ? (
              <div className="px-5 py-2.5 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 text-slate-500 font-mono tracking-widest text-lg font-bold">
                {status === 'success' || status === 'error'
                  ? currentItem.word
                  : currentItem.word
                      .split('')
                      .map((char) => (char === ' ' || char === '-' ? char : '_ '))
                      .join('')}
              </div>
            ) : (
              <div className="px-5 py-2.5 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 font-fredoka tracking-wider text-lg font-bold">
                {status === 'success' || status === 'error'
                  ? currentItem.meaning
                  : '❓ ❓ Ẩn nghĩa Tiếng Việt ❓ ❓'}
              </div>
            )}
          </div>

          {/* User Input Form */}
          <form onSubmit={checkAnswer} className="max-w-md mx-auto my-4 space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                disabled={status === 'success'}
                placeholder={
                  direction === 'vi-to-en'
                    ? 'Gõ từ Tiếng Anh tại đây...'
                    : 'Gõ nghĩa Tiếng Việt tại đây...'
                }
                className={`w-full px-5 py-3.5 rounded-2xl text-center text-xl font-bold font-fredoka tracking-wide border-3 transition duration-200 outline-none shadow-inner ${
                  status === 'success'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : status === 'error'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 animate-shake'
                    : 'border-indigo-300 focus:border-indigo-600 bg-white text-slate-800'
                }`}
              />

              {/* Status Icon inside input */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {status === 'success' && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-bounce" />
                )}
                {status === 'error' && <XCircle className="w-6 h-6 text-rose-500" />}
              </div>
            </div>

            {/* Hint & Helper Row */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setRevealedHint(true);
                  if (direction === 'vi-to-en') {
                    setUserInput(currentItem.word.charAt(0));
                  }
                  onSpeak(currentItem.word, 0.7);
                }}
                className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Xem gợi ý chữ cái đầu & nghe âm</span>
              </button>

              <span>Nhấn Enter để nộp bài</span>
            </div>

            {/* Action Buttons */}
            {status === 'idle' && (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base font-fredoka shadow-lg shadow-indigo-500/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Kiểm Tra Đáp Án ✨
              </button>
            )}
          </form>

          {/* SUCCESS STATE FEEDBACK BANNER */}
          {status === 'success' && (
            <div className="max-w-md mx-auto mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 text-center animate-fadeIn shadow-sm">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-lg font-fredoka">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>XUẤT SẮC! ĐÁP ÁN HOÀN TOÀN CHÍNH XÁC!</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Từ đúng: <span className="font-extrabold text-emerald-900 text-sm">{currentItem.word}</span>{' '}
                = <span className="font-bold">{currentItem.meaning}</span>
              </p>
              <div className="mt-2 text-xs italic text-slate-600">
                "{currentItem.exampleEn}"
              </div>
              <button
                onClick={handleNext}
                className="mt-3.5 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm font-fredoka shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <span>Câu Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ERROR STATE FEEDBACK BANNER */}
          {status === 'error' && (
            <div className="max-w-md mx-auto mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-300 text-center animate-fadeIn shadow-sm">
              <div className="flex items-center justify-center gap-2 text-rose-700 font-extrabold text-base font-fredoka">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>CHƯA ĐÚNG RỒI! BÉ ĐỪNG NẢN NHÉ!</span>
              </div>
              <div className="mt-2 text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-rose-200">
                <div>
                  Bạn đã gõ:{' '}
                  <span className="font-bold text-rose-700 line-through">
                    {userInput}
                  </span>
                </div>
                <div className="mt-1">
                  Đáp án chuẩn là:{' '}
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {direction === 'vi-to-en' ? currentItem.word : currentItem.meaning}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleRetryCurrent}
                  className="flex-1 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-xs transition cursor-pointer"
                >
                  Thử lại câu này
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Bỏ qua & Đi tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SUMMARY VIEW AT THE END OF THE QUIZ: SCORE & MISSED WORDS LIST FOR REVIEW */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-2xl animate-fadeIn space-y-6">
          {/* Header Trophy & Score */}
          <div className="text-center">
            <div className="text-7xl mb-2 animate-bounce">
              {missedWords.length === 0 ? '🏆' : correctCount >= 7 ? '⭐' : '💪'}
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-2">
              ✨ BẢNG TỔNG KẾT QUIZ MODE DISNEY
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-fredoka">
              {missedWords.length === 0
                ? 'Tuyệt Đỉnh! Bạn Đạt Điểm Tuyệt Đối!'
                : 'Hoàn Thành Bài Kiểm Tra!'}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Xem lại chi tiết điểm số và các từ vựng cần ôn tập củng cố
            </p>
          </div>

          {/* Score Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-black uppercase text-slate-400">
                Câu trả lời đúng
              </span>
              <div className="text-3xl font-black text-emerald-600 font-fredoka mt-1">
                {correctCount} / {questions.length}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Đạt {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <span className="text-[11px] font-black uppercase text-amber-800">
                Điểm Phép Thuật
              </span>
              <div className="text-3xl font-black text-amber-600 font-fredoka mt-1">
                +{score}
              </div>
              <span className="text-xs text-amber-700 font-semibold">
                Sao tích lũy
              </span>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
              <span className="text-[11px] font-black uppercase text-rose-800">
                Từ cần ôn lại
              </span>
              <div className="text-3xl font-black text-rose-600 font-fredoka mt-1">
                {missedWords.length}
              </div>
              <span className="text-xs text-rose-700 font-semibold">
                {missedWords.length === 0 ? 'Không có từ sai!' : 'Cần xem lại'}
              </span>
            </div>
          </div>

          {/* DETAILED MISSED WORDS LIST FOR REVIEW */}
          {missedWords.length > 0 ? (
            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-fredoka flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    <span>Danh Sách {missedWords.length} Từ Cần Ôn Tập Lại:</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bấm loa để nghe phát âm chuẩn và xem câu ví dụ Unit 2
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleFavorite && (
                    <button
                      onClick={handleSaveAllMissed}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Lưu tất cả từ sai ⭐</span>
                    </button>
                  )}
                  <button
                    onClick={handleRetryMissedOnly}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Luyện lại {missedWords.length} từ này</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {missedWords.map((missed, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border-2 border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl filter drop-shadow-xs select-none">
                        {missed.item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 font-fredoka">
                            {missed.item.word}
                          </span>
                          <span className="text-xs text-slate-500 font-mono italic">
                            {missed.item.ipa}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                            {missed.item.pos}
                          </span>
                          <span className="text-xs text-indigo-600 font-bold">
                            ✨ {missed.item.char}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-emerald-800 mt-0.5">
                          Nghĩa: {missed.item.meaning}
                        </div>

                        {/* What the user typed vs what was expected */}
                        <div className="text-xs mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="text-slate-500">Bé đã nhập:</span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold line-through">
                            {missed.userInput || '(để trống)'}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-slate-500">Đáp án chuẩn:</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold">
                            {missed.expectedAnswer}
                          </span>
                        </div>

                        {/* Example sentence */}
                        <div className="mt-2 text-xs text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200">
                          <span className="font-semibold text-slate-800 not-italic">Ví dụ: </span>
                          "{missed.item.exampleEn}" → {missed.item.exampleVi}
                        </div>
                      </div>
                    </div>

                    {/* Actions on this missed item */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onSpeak(missed.item.word, speechRate)}
                        className="p-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition cursor-pointer"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(missed.item.id)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="Lưu từ này"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              favorites.includes(missed.item.id)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-400'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center">
              <div className="text-4xl mb-2">🎉✨</div>
              <h4 className="text-xl font-bold text-emerald-900 font-fredoka">
                Không Có Từ Nào Bị Sai!
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Bé đã trả lời chính xác tất cả các câu hỏi trong vòng này. Thật là xuất sắc!
              </p>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 flex-wrap">
            <button
              onClick={() => {
                playClickSound();
                startNewQuiz(direction);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold font-fredoka text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi Lại Vòng 10 Từ Mới</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                handleShuffleQuestions();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold font-fredoka text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Xáo Trộn Thứ Tự 🔀</span>
            </button>
            <button
              onClick={() => {
                const nextDir = direction === 'vi-to-en' ? 'en-to-vi' : 'vi-to-en';
                setDirection(nextDir);
                startNewQuiz(nextDir);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold font-fredoka text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                Đổi sang{' '}
                {direction === 'vi-to-en' ? 'Ẩn nghĩa Tiếng Việt' : 'Ẩn từ Tiếng Anh'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
