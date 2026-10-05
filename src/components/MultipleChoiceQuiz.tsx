import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Star,
} from 'lucide-react';
import { VocabItem } from '../types';
import {
  playCorrectSound,
  playWrongSound,
  fireMagicConfetti,
} from '../utils/audio';

interface MultipleChoiceQuizProps {
  vocabList: VocabItem[];
  speechRate: number;
  onSpeak: (text: string, rate?: number) => void;
  onAddScore: (points: number) => void;
  favorites?: number[];
  onToggleFavorite?: (id: number) => void;
}

interface Question {
  item: VocabItem;
  prompt: string;
  type: 'word-to-meaning' | 'meaning-to-word' | 'audio';
  options: { text: string; isCorrect: boolean }[];
}

interface MissedQuestionRecord {
  item: VocabItem;
  prompt: string;
  userChosenText: string;
  correctAnswerText: string;
}

export const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  vocabList,
  speechRate,
  onSpeak,
  onAddScore,
  favorites = [],
  onToggleFavorite,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [missedRecords, setMissedRecords] = useState<MissedQuestionRecord[]>([]);

  const initQuiz = (customList?: VocabItem[]) => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCorrectCount(0);
    setIsFinished(false);
    setMissedRecords([]);

    const source = customList && customList.length > 0 ? customList : vocabList;
    const chosen = [...source].sort(() => 0.5 - Math.random()).slice(0, 10);
    const generated: Question[] = chosen.map((item, idx) => {
      const type: Question['type'] =
        idx % 3 === 0
          ? 'meaning-to-word'
          : idx % 3 === 1
          ? 'audio'
          : 'word-to-meaning';

      const wrong = vocabList
        .filter((v) => v.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      let prompt = '';
      let opts: { text: string; isCorrect: boolean }[] = [];

      if (type === 'word-to-meaning') {
        prompt = `Từ "${item.word}" có nghĩa là gì?`;
        opts = [
          { text: item.meaning, isCorrect: true },
          ...wrong.map((w) => ({ text: w.meaning, isCorrect: false })),
        ];
      } else if (type === 'meaning-to-word') {
        prompt = `Nghĩa "${item.meaning}" trong Tiếng Anh là gì?`;
        opts = [
          { text: item.word, isCorrect: true },
          ...wrong.map((w) => ({ text: w.word, isCorrect: false })),
        ];
      } else {
        prompt = `Nghe phát âm và chọn từ Tiếng Anh tương ứng:`;
        opts = [
          { text: item.word, isCorrect: true },
          ...wrong.map((w) => ({ text: w.word, isCorrect: false })),
        ];
      }

      return {
        item,
        prompt,
        type,
        options: opts.sort(() => 0.5 - Math.random()),
      };
    });

    setQuestions(generated);
  };

  useEffect(() => {
    initQuiz();
  }, [vocabList]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(idx);

    const isCorrect = currentQ.options[idx].isCorrect;
    const correctOpt = currentQ.options.find((o) => o.isCorrect);

    if (isCorrect) {
      playCorrectSound();
      setScore((prev) => prev + 10);
      setCorrectCount((prev) => prev + 1);
      onAddScore(10);
    } else {
      playWrongSound();
      setMissedRecords((prev) => [
        ...prev,
        {
          item: currentQ.item,
          prompt: currentQ.prompt,
          userChosenText: currentQ.options[idx].text,
          correctAnswerText: correctOpt?.text || currentQ.item.meaning,
        },
      ]);
    }

    onSpeak(currentQ.item.word, speechRate);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      fireMagicConfetti();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRetryMissedOnly = () => {
    const missedVocab = missedRecords.map((m) => m.item);
    initQuiz(missedVocab);
  };

  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
            🏆 TRẮC NGHIỆM ĐỈNH CAO
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-fredoka mt-1">
            Thử Thách Phép Thuật Disney
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs sm:text-sm">
            Câu {currentIndex + 1}/{questions.length}
          </span>
          <span className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-fredoka font-bold text-sm">
            ⭐ {score} điểm
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-slate-200 shadow-xl relative">
          {/* Question Prompt Area */}
          <div className="text-center my-4">
            <div className="text-7xl mb-2 filter drop-shadow-md select-none">
              {currentQ.item.icon}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
              <span>✨ Nhân vật:</span>
              <span className="text-indigo-600 font-black">{currentQ.item.char}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-fredoka">
              {currentQ.prompt}
            </h3>

            {/* Audio Button for Audio Type */}
            {currentQ.type === 'audio' && (
              <div className="mt-3">
                <button
                  onClick={() => onSpeak(currentQ.item.word, speechRate)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>Nghe lại phát âm 🔊</span>
                </button>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3 my-6">
            {currentQ.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              let btnStyle =
                'bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-400 text-slate-800';

              if (selectedOption !== null) {
                if (opt.isCorrect) {
                  btnStyle =
                    'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300';
                } else if (isChosen) {
                  btnStyle =
                    'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-300 animate-shake';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 rounded-2xl border-3 text-left font-fredoka font-bold text-lg transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-200/80 text-slate-700 text-xs font-black flex items-center justify-center">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt.text}</span>
                  </div>

                  {selectedOption !== null && opt.isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {selectedOption !== null && isChosen && !opt.isCorrect && (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {selectedOption !== null && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">
                  {currentQ.item.word} {currentQ.item.ipa} ({currentQ.item.pos})
                </span>
                : {currentQ.item.meaning}
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm font-fredoka shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <span>Câu Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SUMMARY VIEW AT THE END OF THE QUIZ WITH MISSED WORDS REVIEW */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="text-7xl mb-2 animate-bounce">
              {missedRecords.length === 0 ? '🏆' : '⭐'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka">
              {missedRecords.length === 0
                ? 'BẠN ĐẠT ĐIỂM 100/100 TUYỆT ĐỐI!'
                : 'HOÀN THÀNH BÀI TRẮC NGHIỆM!'}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Bảng tổng kết kết quả và danh sách từ cần ôn tập
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-black uppercase text-slate-400">
                Trả lời đúng
              </span>
              <div className="text-3xl font-black text-emerald-600 font-fredoka mt-1">
                {correctCount} / {questions.length}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Độ chính xác {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <span className="text-[11px] font-black uppercase text-amber-800">
                Tổng điểm
              </span>
              <div className="text-3xl font-black text-amber-600 font-fredoka mt-1">
                {score}
              </div>
              <span className="text-xs text-amber-700 font-semibold">
                Sao Disney
              </span>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
              <span className="text-[11px] font-black uppercase text-rose-800">
                Từ cần ôn
              </span>
              <div className="text-3xl font-black text-rose-600 font-fredoka mt-1">
                {missedRecords.length}
              </div>
              <span className="text-xs text-rose-700 font-semibold">
                Câu chưa đúng
              </span>
            </div>
          </div>

          {/* Missed Words List for Review */}
          {missedRecords.length > 0 ? (
            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-extrabold text-slate-800 font-fredoka flex items-center gap-1.5">
                  <span>📖</span>
                  <span>Các Từ Cần Ôn Lại ({missedRecords.length}):</span>
                </h3>

                <button
                  onClick={handleRetryMissedOnly}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Luyện lại câu sai</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {missedRecords.map((record, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{record.item.icon}</span>
                      <div>
                        <div className="font-extrabold text-slate-900 font-fredoka text-base">
                          {record.item.word}{' '}
                          <span className="text-xs text-slate-500 font-normal italic">
                            {record.item.ipa} ({record.item.pos})
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">
                          Nghĩa đúng:{' '}
                          <span className="font-bold text-emerald-700">
                            {record.correctAnswerText}
                          </span>{' '}
                          • Bạn đã chọn:{' '}
                          <span className="line-through text-rose-600 font-semibold">
                            {record.userChosenText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSpeak(record.item.word, speechRate)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 shadow-xs cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center">
              <span className="text-xs font-bold text-emerald-800">
                🌟 Bé trả lời đúng 100% câu hỏi! Tuyệt đối không sai câu nào!
              </span>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => initQuiz()}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold font-fredoka text-base shadow-lg transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Làm Bài Trắc Nghiệm Mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
