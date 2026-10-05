import React, { useState } from 'react';
import { SENTENCE_PATTERNS, UNSCRAMBLE_ITEMS, UnscrambleItem } from '../data/sentencesData';
import {
  speakText,
  playCorrectSound,
  playWrongSound,
  playClickSound,
  fireMagicConfetti,
} from '../utils/audio';
import {
  MessageSquareText,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface SentencePracticeProps {
  onAddScore?: (amount: number) => void;
  onAddStars?: (amount: number) => void;
  speechRate?: number;
  speechSpeed?: number;
  onSpeak?: (text: string, rate?: number) => void;
}

export const SentencePractice: React.FC<SentencePracticeProps> = ({
  onAddScore,
  onAddStars,
  speechRate,
  speechSpeed = 0.85,
  onSpeak,
}) => {
  const currentSpeed = speechRate ?? speechSpeed;
  const triggerAddScore = (pts: number) => {
    if (onAddScore) onAddScore(pts);
    if (onAddStars) onAddStars(pts);
  };
  const triggerSpeak = (text: string) => {
    if (onSpeak) onSpeak(text, currentSpeed);
    else speakText(text, currentSpeed);
  };
  const [activeTab, setActiveTab] = useState<'dialogue' | 'unscramble'>('dialogue');

  // Unscramble state
  const [unscrambleIdx, setUnscrambleIdx] = useState(0);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [unscrambleFeedback, setUnscrambleFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);

  const currentUnscramble: UnscrambleItem = UNSCRAMBLE_ITEMS[unscrambleIdx];

  // Play full conversation sequence
  const playFullDialogue = (question: string, answer: string) => {
    playClickSound();
    triggerSpeak(question);
    setTimeout(() => {
      triggerSpeak(answer);
    }, 1800);
  };

  // Handle clicking word chip in unscramble game
  const handleWordChipClick = (index: number) => {
    if (unscrambleFeedback?.isCorrect) return;
    playClickSound();
    if (selectedWordIndices.includes(index)) {
      setSelectedWordIndices((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedWordIndices((prev) => [...prev, index]);
    }
  };

  // Check unscramble result
  const handleCheckUnscramble = () => {
    if (!currentUnscramble || unscrambleFeedback?.isCorrect) return;

    const assembled = selectedWordIndices
      .map((i) => currentUnscramble.words[i])
      .join(' ')
      .trim();

    const target = currentUnscramble.original.trim();

    if (assembled.toLowerCase() === target.toLowerCase()) {
      playCorrectSound();
      triggerSpeak(target);
      triggerAddScore(30);
      setUnscrambleFeedback({
        text: '🎉 Xuất sắc! Bạn đã sắp xếp câu hoàn toàn chính xác!',
        isCorrect: true,
      });
      fireMagicConfetti();
    } else {
      playWrongSound();
      setUnscrambleFeedback({
        text: '❌ Thứ tự chưa đúng, bạn hãy thử đổi lại nhé!',
        isCorrect: false,
      });
    }
  };

  const handleNextUnscramble = () => {
    playClickSound();
    setSelectedWordIndices([]);
    setUnscrambleFeedback(null);
    setUnscrambleIdx((prev) => (prev + 1) % UNSCRAMBLE_ITEMS.length);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      {/* Sub Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('dialogue');
          }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
            activeTab === 'dialogue'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          💬 Các Mẫu Câu Trọng Tâm
        </button>
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('unscramble');
          }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${
            activeTab === 'unscramble'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          🧩 Trò Chơi Xếp Từ Thành Câu
        </button>
      </div>

      {activeTab === 'dialogue' ? (
        /* Dialogue Cards List */
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 font-fredoka">
              MẪU CÂU GIAO TIẾP TIẾNG ANH 5 • UNIT 2
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Chạm vào từng lời thoại để nghe Mickey, Donald và bạn bè phát âm, hoặc bấm nghe toàn bộ hội thoại!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SENTENCE_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Header Context */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wide bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {pattern.context}
                  </span>

                  <button
                    onClick={() => playFullDialogue(pattern.question, pattern.answer)}
                    className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300 transition-colors"
                    title="Nghe toàn bộ đối thoại này"
                  >
                    <Play className="w-3 h-3 fill-amber-600 text-amber-600" />
                    <span>Nghe cả 2 câu</span>
                  </button>
                </div>

                {/* Speaker A: Question */}
                <div
                  onClick={() => triggerSpeak(pattern.question)}
                  className="group p-3 rounded-2xl bg-sky-50 border border-sky-200 hover:bg-sky-100 cursor-pointer transition-colors mb-2.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-sky-800 flex items-center gap-1">
                      🏰 {pattern.speakerA} hỏi:
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 font-nunito">
                    "{pattern.question}"
                  </p>
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    → {pattern.questionVi}
                  </p>
                </div>

                {/* Speaker B: Answer */}
                <div
                  onClick={() => triggerSpeak(pattern.answer)}
                  className="group p-3 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      ✨ {pattern.speakerB} trả lời:
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 font-nunito">
                    "{pattern.answer}"
                  </p>
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    → {pattern.answerVi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Sentence Unscramble Game */
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-slate-200 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
              Câu {unscrambleIdx + 1} / {UNSCRAMBLE_ITEMS.length}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Chạm vào từ để ghép thành câu hoàn chỉnh
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 my-4 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Ý nghĩa cần ghép:</span>
            <h3 className="text-xl font-extrabold text-slate-800 font-nunito mt-1">
              "{currentUnscramble.vietnamese}"
            </h3>
          </div>

          {/* User Assembled Words Area */}
          <div className="min-h-[70px] bg-sky-50/60 border-2 border-dashed border-sky-300 rounded-2xl p-3 flex items-center justify-center flex-wrap gap-2 my-4">
            {selectedWordIndices.length === 0 ? (
              <span className="text-sm text-slate-400 italic">
                Chạm vào các từ bên dưới theo đúng thứ tự...
              </span>
            ) : (
              selectedWordIndices.map((idx) => (
                <button
                  key={idx}
                  onClick={() => handleWordChipClick(idx)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs flex items-center gap-1 active:scale-95 hover:bg-blue-700"
                  title="Chạm để gỡ từ này"
                >
                  <span>{currentUnscramble.words[idx]}</span>
                  <span className="text-xs opacity-70">✕</span>
                </button>
              ))
            )}
          </div>

          {/* Word Bank Chips */}
          <div className="my-6">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Kho từ vựng:</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {currentUnscramble.words.map((word, idx) => {
                const isUsed = selectedWordIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={isUsed}
                    onClick={() => handleWordChipClick(idx)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all select-none ${
                      isUsed
                        ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 cursor-default'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                setSelectedWordIndices([]);
                setUnscrambleFeedback(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Đặt lại
            </button>

            <button
              onClick={handleCheckUnscramble}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Kiểm Tra Câu</span>
            </button>

            <button
              onClick={handleNextUnscramble}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Câu khác ➜
            </button>
          </div>

          {/* Feedback */}
          {unscrambleFeedback && (
            <div
              className={`mt-4 p-3 rounded-2xl font-bold text-sm animate-in fade-in flex items-center justify-center gap-2 ${
                unscrambleFeedback.isCorrect
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {unscrambleFeedback.isCorrect && (
                <Sparkles className="w-4 h-4 text-emerald-600" />
              )}
              <span>{unscrambleFeedback.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
