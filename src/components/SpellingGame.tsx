import React, { useState, useEffect } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { VocabItem } from '../types';
import {
  speakText,
  playCorrectSound,
  playWrongSound,
  playClickSound,
  fireMagicConfetti,
} from '../utils/audio';

interface SpellingGameProps {
  vocabList: VocabItem[];
  speechSpeed?: number;
  speechRate?: number;
  onAddStars?: (amount: number) => void;
  onAddScore?: (amount: number) => void;
  onSpeak?: (text: string, rate?: number) => void;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({
  vocabList,
  speechSpeed = 0.85,
  speechRate,
  onAddStars,
  onAddScore,
  onSpeak,
}) => {
  const currentSpeed = speechRate ?? speechSpeed;
  const addPoints = (pts: number) => {
    if (onAddStars) onAddStars(pts);
    if (onAddScore) onAddScore(pts);
  };
  const handleSpeak = (text: string) => {
    if (onSpeak) onSpeak(text, currentSpeed);
    else speakText(text, currentSpeed);
  };
  const [currentItem, setCurrentItem] = useState<VocabItem | null>(null);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<
    { char: string; id: number; used: boolean }[]
  >([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const loadRandomWord = () => {
    const random = vocabList[Math.floor(Math.random() * vocabList.length)];
    setCurrentItem(random);
    setTypedLetters([]);
    setStatus('idle');

    // Scramble letters (ignore spaces or hyphens for tiles, or treat letters only)
    const cleanChars = random.word.toLowerCase().split('');
    const lettersWithId = cleanChars
      .map((char, index) => ({ char, id: index, used: false }))
      .sort(() => 0.5 - Math.random());

    setScrambledLetters(lettersWithId);
  };

  useEffect(() => {
    loadRandomWord();
  }, [vocabList]);

  // Click on letter tile
  const handleTileClick = (tileId: number) => {
    if (status === 'correct') return;
    playClickSound();

    const tile = scrambledLetters.find((t) => t.id === tileId);
    if (!tile || tile.used) return;

    setTypedLetters((prev) => [...prev, tile.char]);
    setScrambledLetters((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, used: true } : t))
    );
    setStatus('idle');
  };

  // Remove letter from answer
  const handleRemoveLetter = (index: number) => {
    if (status === 'correct') return;
    playClickSound();

    const charToRemove = typedLetters[index];
    const newTyped = [...typedLetters];
    newTyped.splice(index, 1);
    setTypedLetters(newTyped);

    // Free the corresponding scrambled tile
    const usedTile = scrambledLetters.find(
      (t) => t.used && t.char === charToRemove
    );
    if (usedTile) {
      setScrambledLetters((prev) =>
        prev.map((t) => (t.id === usedTile.id ? { ...t, used: false } : t))
      );
    }
    setStatus('idle');
  };

  // Check spelling
  const checkSpelling = () => {
    if (!currentItem) return;
    const currentWord = typedLetters.join('');
    const targetWord = currentItem.word.toLowerCase().replace(/[\s-]/g, '');

    if (currentWord === targetWord) {
      setStatus('correct');
      playCorrectSound();
      handleSpeak(currentItem.word);
      setScore((prev) => prev + 15);
      setStreak((prev) => prev + 1);
      addPoints(15);
      if ((streak + 1) % 5 === 0) {
        fireMagicConfetti();
      }
    } else {
      setStatus('wrong');
      playWrongSound();
      setStreak(0);
    }
  };

  if (!currentItem) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-black uppercase tracking-wider">
            🔤 GAME 3: CHÍNH TẢ DISNEY
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-fredoka mt-1">
            Ghép Chữ Cái Đúng Từ
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-fredoka font-bold text-sm">
            ⭐ {score} điểm
          </span>
          {streak > 0 && (
            <span className="px-3 py-1.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
              🔥 Chuỗi: {streak}
            </span>
          )}
        </div>
      </div>

      {/* Main Spelling Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-slate-200 shadow-xl text-center">
        {/* Character and Icon */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
          <span>✨ Bạn đồng hành:</span>
          <span className="text-teal-600 font-black">{currentItem.char}</span>
        </div>

        <div className="text-7xl mb-2 filter drop-shadow-md select-none">
          {currentItem.icon}
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-fredoka">
          "{currentItem.meaning}"
        </h3>

        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono">
            {currentItem.ipa} ({currentItem.pos})
          </span>

          <button
            onClick={() => speakText(currentItem.word, speechSpeed)}
            className="p-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition cursor-pointer"
            title="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Answer Slots */}
        <div className="my-6">
          <div className="flex flex-wrap justify-center gap-2 min-h-[56px] p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
            {typedLetters.length === 0 ? (
              <span className="text-sm font-semibold text-slate-400 self-center">
                Nhấn các chữ cái bên dưới để ghép từ
              </span>
            ) : (
              typedLetters.map((char, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveLetter(idx)}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-rose-500 text-white font-extrabold font-fredoka text-xl shadow-md transition transform active:scale-90 flex items-center justify-center cursor-pointer"
                  title="Nhấn để gỡ chữ này"
                >
                  {char.toUpperCase()}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Scrambled Letter Tiles */}
        <div className="my-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Chữ cái gợi ý:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {scrambledLetters.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                disabled={tile.used || status === 'correct'}
                className={`w-11 h-11 rounded-2xl font-extrabold font-fredoka text-xl transition-all duration-150 shadow-md flex items-center justify-center cursor-pointer ${
                  tile.used
                    ? 'bg-slate-200 text-slate-400 opacity-40 scale-90 pointer-events-none'
                    : 'bg-white hover:bg-teal-50 border-2 border-teal-300 hover:border-teal-500 text-slate-800 hover:scale-105 active:scale-95'
                }`}
              >
                {tile.char.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Actions & Feedback */}
        <div className="mt-6 space-y-3">
          {status === 'idle' && (
            <button
              onClick={checkSpelling}
              disabled={typedLetters.length === 0}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base font-fredoka shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Kiểm Tra Chính Tả ✨
            </button>
          )}

          {status === 'correct' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-lg font-fredoka">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>PHÉP THUẬT DISNEY! CHÍNH XÁC!</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 font-bold">
                {currentItem.word} : {currentItem.meaning}
              </p>
              <button
                onClick={loadRandomWord}
                className="mt-3 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm font-fredoka shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <span>Từ Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'wrong' && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-rose-700 font-extrabold text-base font-fredoka">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Bé sắp đúng rồi, hãy thử sắp xếp lại nhé!</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setTypedLetters([]);
                    setScrambledLetters((prev) =>
                      prev.map((t) => ({ ...t, used: false }))
                    );
                    setStatus('idle');
                  }}
                  className="flex-1 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs transition cursor-pointer"
                >
                  Xếp lại từ đầu
                </button>
                <button
                  onClick={loadRandomWord}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  Đổi từ khác
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
