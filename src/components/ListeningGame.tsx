import React, { useState, useEffect } from 'react';
import { VocabItem } from '../types';
import {
  speakText,
  playCorrectSound,
  playWrongSound,
  playClickSound,
  fireMagicConfetti,
} from '../utils/audio';
import {
  Headphones,
  Volume2,
  Volume1,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Flame,
  LayoutGrid,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Star,
  Shuffle,
} from 'lucide-react';

interface ListeningGameProps {
  vocabList: VocabItem[];
  onAddScore?: (amount: number) => void;
  onAddStars?: (amount: number) => void;
  speechRate?: number;
  speechSpeed?: number;
  onSpeak?: (text: string, rate?: number) => void;
}

type QuestionFormat = 'images' | 'definitions' | 'mixed';

interface RoundResult {
  target: VocabItem;
  selectedId: number;
  isCorrect: boolean;
}

export const ListeningGame: React.FC<ListeningGameProps> = ({
  vocabList,
  onAddScore,
  onAddStars,
  speechRate,
  speechSpeed = 0.85,
  onSpeak,
}) => {
  const effectiveSpeed = speechRate ?? speechSpeed;
  const addPoints = (points: number) => {
    if (onAddScore) onAddScore(points);
    if (onAddStars) onAddStars(points);
  };

  const handleSpeak = (text: string, rate?: number) => {
    if (onSpeak) onSpeak(text, rate ?? effectiveSpeed);
    else speakText(text, rate ?? effectiveSpeed);
  };

  // Game Settings & State
  const [formatMode, setFormatMode] = useState<QuestionFormat>('images');
  const [gridCount, setGridCount] = useState<4 | 6>(4);
  const [questionsPool, setQuestionsPool] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<VocabItem | null>(null);
  const [options, setOptions] = useState<VocabItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Determine actual display type for current question
  const currentDisplayType: 'images' | 'definitions' =
    formatMode === 'mixed'
      ? currentIndex % 2 === 0
        ? 'images'
        : 'definitions'
      : formatMode;

  // Start or Reset a full round of 10 questions
  const startNewGame = (customList = vocabList) => {
    if (!customList || customList.length === 0) return;
    const shuffled = [...customList].sort(() => 0.5 - Math.random());
    const pool = shuffled.slice(0, 10);
    setQuestionsPool(pool);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setRoundResults([]);
    setIsGameOver(false);
    loadQuestion(0, pool);
  };

  // Load a single question by index
  const loadQuestion = (index: number, pool: VocabItem[]) => {
    if (index >= pool.length) {
      setIsGameOver(true);
      return;
    }

    const target = pool[index];
    setCurrentTarget(target);
    setSelectedId(null);
    setIsAnswered(false);
    setShowHint(false);

    // Pick distractors from full vocab list
    const distractors = vocabList.filter((v) => v.id !== target.id);
    const neededDistractors = gridCount - 1;
    const pickedDistractors = [...distractors]
      .sort(() => 0.5 - Math.random())
      .slice(0, neededDistractors);

    const fullGrid = [target, ...pickedDistractors].sort(
      () => 0.5 - Math.random()
    );
    setOptions(fullGrid);

    // Auto play audio of target word
    setIsPlayingAudio(true);
    setTimeout(() => {
      speakText(target.word, effectiveSpeed, 1.0, () => {
        setIsPlayingAudio(false);
      });
    }, 350);
  };

  useEffect(() => {
    if (vocabList.length > 0) {
      startNewGame();
    }
  }, [vocabList, gridCount]);

  const handlePlayAudio = (slow = false) => {
    if (!currentTarget) return;
    setIsPlayingAudio(true);
    speakText(currentTarget.word, slow ? 0.65 : effectiveSpeed, 1.0, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleSelectOption = (item: VocabItem) => {
    if (isAnswered || !currentTarget) return;
    playClickSound();
    setSelectedId(item.id);
    setIsAnswered(true);

    const isCorrect = item.id === currentTarget.id;

    if (isCorrect) {
      playCorrectSound();
      const bonus = streak >= 2 ? 15 : 10;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);
      addPoints(bonus);
      if ((streak + 1) % 3 === 0) {
        fireMagicConfetti();
      }
    } else {
      playWrongSound();
      setStreak(0);
    }

    setRoundResults((prev) => [
      ...prev,
      {
        target: currentTarget,
        selectedId: item.id,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    playClickSound();
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    loadQuestion(nextIdx, questionsPool);
  };

  if (!currentTarget && !isGameOver) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-14 font-nunito">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
              🎧 LISTEN & SELECT
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Lắng nghe phát âm và chọn ảnh / nghĩa đúng
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-quicksand mt-1">
            Thử Thách Nghe & Chọn Thẻ
          </h2>
        </div>

        {/* Display Format Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format mode selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                playClickSound();
                setFormatMode('images');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                formatMode === 'images'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chọn theo hình ảnh biểu tượng"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Hình Ảnh</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setFormatMode('definitions');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                formatMode === 'definitions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chọn theo định nghĩa chữ Tiếng Việt"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Định Nghĩa</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setFormatMode('mixed');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                formatMode === 'mixed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xáo trộn câu hỏi hình ảnh và định nghĩa"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Trộn Cả Hai</span>
            </button>
          </div>

          {/* Grid Count 4 vs 6 */}
          <button
            onClick={() => {
              playClickSound();
              setGridCount((prev) => (prev === 4 ? 6 : 4));
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            title="Đổi số lượng thẻ trên màn hình"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            <span>{gridCount === 4 ? '4 ô' : '6 ô'}</span>
          </button>
        </div>
      </div>

      {!isGameOver && currentTarget ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-slate-200 shadow-xl relative overflow-hidden transition-all">
          {/* Top Progress & Status */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                Câu {currentIndex + 1} / {questionsPool.length}
              </span>

              {streak >= 2 && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs animate-bounce">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  Chuỗi x{streak}!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-quicksand font-bold text-base text-amber-600 bg-amber-50 px-3.5 py-1 rounded-2xl border border-amber-300">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{score} điểm</span>
              </div>
            </div>
          </div>

          {/* Big Audio Listening Console */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 via-indigo-50/50 to-blue-50 border-2 border-sky-200 p-6 sm:p-8 text-center my-2 shadow-inner">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🎧 BƯỚC 1: LẮNG NGHE PHÁT ÂM CỦA TỪ</span>
            </div>

            <h3 className="text-slate-700 text-sm font-semibold max-w-md mx-auto">
              Chạm vào chiếc loa để nghe phát âm, sau đó chọn đáp án đúng bên dưới!
            </h3>

            {/* Glowing Soundwave Audio Button */}
            <div className="my-5 flex items-center justify-center">
              <button
                onClick={() => handlePlayAudio(false)}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex flex-col items-center justify-center shadow-xl shadow-blue-500/30 transition transform active:scale-95 cursor-pointer ${
                  isPlayingAudio
                    ? 'ring-8 ring-sky-300/80 animate-pulse scale-105'
                    : 'hover:scale-105'
                }`}
                title="Bấm để nghe lại phát âm"
              >
                <Volume2 className="w-12 h-12 mb-1" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  {isPlayingAudio ? 'Đang phát...' : 'Nghe Lại'}
                </span>
              </button>
            </div>

            {/* Speed & Hint Action Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                onClick={() => handlePlayAudio(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl border border-amber-300 transition cursor-pointer"
                title="Nghe tốc độ chậm để luyện phát âm từng âm tiết"
              >
                <Volume1 className="w-4 h-4 text-amber-700" />
                <span>Nghe Chậm (0.65x)</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setShowHint((prev) => !prev);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 bg-white hover:bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer"
                title="Xem gợi ý nếu từ khó"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{showHint ? 'Ẩn Gợi Ý' : 'Gợi Ý Nhân Vật'}</span>
              </button>
            </div>

            {/* Hint dropdown banner */}
            {showHint && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 max-w-md mx-auto animate-fadeIn flex items-center justify-center gap-2">
                <span>🏰 <strong>Bạn đồng hành:</strong> {currentTarget.char}</span>
                <span>•</span>
                <span>Từ loại: <strong>{currentTarget.pos.toUpperCase()}</strong></span>
              </div>
            )}
          </div>

          {/* Subheading Prompt */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {currentDisplayType === 'images'
                ? '🖼️ BƯỚC 2: CHỌN HÌNH ẢNH / BIỂU TƯỢNG ĐÚNG'
                : '📝 BƯỚC 2: CHỌN ĐỊNH NGHĨA TIẾNG VIỆT ĐÚNG'}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {gridCount} phương án
            </span>
          </div>

          {/* Grid Selection Cards */}
          <div
            className={`grid gap-3.5 ${
              gridCount === 6
                ? 'grid-cols-2 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {options.map((item, idx) => {
              const isSelected = selectedId === item.id;
              const isCorrect = item.id === currentTarget.id;

              let cardStyle =
                'bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-md text-slate-800';

              if (isAnswered) {
                if (isCorrect) {
                  cardStyle =
                    'bg-emerald-50 border-3 border-emerald-500 text-emerald-950 ring-4 ring-emerald-200 shadow-md';
                } else if (isSelected) {
                  cardStyle =
                    'bg-rose-50 border-3 border-rose-500 text-rose-950 ring-4 ring-rose-200';
                } else {
                  cardStyle =
                    'bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-40';
                }
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectOption(item)}
                  disabled={isAnswered}
                  className={`p-4 sm:p-5 rounded-3xl transition-all flex items-center justify-between text-left cursor-pointer group active:scale-[0.98] ${cardStyle}`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Character / Number badge */}
                    <span className="w-8 h-8 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                      {String.fromCharCode(65 + idx)}
                    </span>

                    {/* Mode: Image View */}
                    {currentDisplayType === 'images' ? (
                      <div className="flex items-center gap-3">
                        <span className="text-4xl filter drop-shadow-sm select-none">
                          {item.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-500">
                            ✨ {item.char}
                          </div>
                          {isAnswered && (
                            <div className="text-sm font-extrabold font-quicksand text-slate-900 mt-0.5 animate-fadeIn">
                              {item.word}
                              <span className="block text-xs font-normal text-slate-500 italic">
                                {item.meaning}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Mode: Definition View */
                      <div>
                        <span className="text-base sm:text-lg font-bold font-quicksand text-slate-800 block">
                          "{item.meaning}"
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {item.char} • {item.pos}
                        </span>
                        {isAnswered && (
                          <div className="text-xs font-bold text-blue-700 mt-1 font-mono">
                            → {item.word} ({item.ipa})
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator Icon */}
                  {isAnswered && (
                    <div className="shrink-0 ml-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
                      ) : isSelected ? (
                        <XCircle className="w-7 h-7 text-rose-500" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Button after answering */}
          {isAnswered && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3 text-left">
                <button
                  onClick={() => handleSpeak(currentTarget.word)}
                  className="p-3 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition cursor-pointer"
                  title="Nghe lại phát âm từ này"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 font-quicksand text-lg">
                      {currentTarget.word}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {currentTarget.ipa}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{currentTarget.exampleEn}" → {currentTarget.exampleVi}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold font-quicksand text-sm shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {currentIndex + 1 < questionsPool.length
                    ? 'Câu Tiếp Theo'
                    : 'Xem Kết Quả Vòng Này'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Round Complete Summary View */
        <div className="bg-white rounded-3xl p-8 border-3 border-slate-200 shadow-xl text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-4xl shadow-inner mb-4">
            🏆
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-quicksand">
            Hoàn Thành Vòng Nghe & Chọn!
          </h3>

          <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
            Bé vừa hoàn thành xuất sắc 10 câu hỏi thử thách kỹ năng nghe tiếng Anh cùng các nhân vật Disney!
          </p>

          {/* Score Badge */}
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900">
              <span className="text-xs font-bold text-amber-700 block uppercase">
                Điểm Vòng
              </span>
              <span className="text-2xl font-black font-quicksand text-amber-600">
                ⭐ {score} điểm
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900">
              <span className="text-xs font-bold text-emerald-700 block uppercase">
                Số Câu Đúng
              </span>
              <span className="text-2xl font-black font-quicksand text-emerald-600">
                {roundResults.filter((r) => r.isCorrect).length} /{' '}
                {roundResults.length}
              </span>
            </div>
          </div>

          {/* Review Round Items */}
          <div className="text-left my-6 bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
              📝 Danh sách các từ trong vòng này:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roundResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    result.isCorrect
                      ? 'bg-white border-emerald-200 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{result.target.icon}</span>
                    <div>
                      <span className="font-bold text-slate-900 block font-quicksand">
                        {result.target.word} ({result.target.meaning})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {result.target.ipa}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeak(result.target.word)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                startNewGame();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold font-quicksand text-sm shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi Lại Vòng 10 Từ Mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
