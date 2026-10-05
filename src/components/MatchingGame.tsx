import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import { VocabItem } from '../types';
import {
  speakText,
  playCorrectSound,
  playWrongSound,
  playClickSound,
  fireMagicConfetti,
} from '../utils/audio';

interface MatchingGameProps {
  vocabList: VocabItem[];
  speechRate?: number;
  speechSpeed?: number;
  onSpeak?: (text: string, rate?: number) => void;
  onAddScore?: (points: number) => void;
  onAddStars?: (points: number) => void;
}

interface MatchCardItem {
  id: number;
  uniqueId: string;
  type: 'en' | 'vi';
  text: string;
  subText?: string;
  icon?: string;
  isMatched: boolean;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  vocabList,
  speechRate,
  speechSpeed = 0.85,
  onSpeak,
  onAddScore,
  onAddStars,
}) => {
  const currentSpeed = speechRate ?? speechSpeed;
  const handleSpeak = (text: string) => {
    if (onSpeak) onSpeak(text, currentSpeed);
    else speakText(text, currentSpeed);
  };
  const addPoints = (pts: number) => {
    if (onAddScore) onAddScore(pts);
    if (onAddStars) onAddStars(pts);
  };
  const [pairsCount, setPairsCount] = useState<6 | 8>(6);
  const [engCards, setEngCards] = useState<MatchCardItem[]>([]);
  const [viCards, setViCards] = useState<MatchCardItem[]>([]);
  const [selectedEng, setSelectedEng] = useState<MatchCardItem | null>(null);
  const [selectedVi, setSelectedVi] = useState<MatchCardItem | null>(null);
  const [mismatchedPair, setMismatchedPair] = useState<{
    engId: string;
    viId: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [matchesWon, setMatchesWon] = useState(0);
  const [isRoundCompleted, setIsRoundCompleted] = useState(false);

  const initGame = (count = pairsCount) => {
    setSelectedEng(null);
    setSelectedVi(null);
    setMismatchedPair(null);
    setIsRoundCompleted(false);

    const picked = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, count);

    const english: MatchCardItem[] = picked
      .map((item) => ({
        id: item.id,
        uniqueId: `en-${item.id}`,
        type: 'en' as const,
        text: item.word,
        subText: item.ipa,
        icon: item.icon,
        isMatched: false,
      }))
      .sort(() => 0.5 - Math.random());

    const vietnamese: MatchCardItem[] = picked
      .map((item) => ({
        id: item.id,
        uniqueId: `vi-${item.id}`,
        type: 'vi' as const,
        text: item.meaning,
        subText: `Nhân vật: ${item.char}`,
        isMatched: false,
      }))
      .sort(() => 0.5 - Math.random());

    setEngCards(english);
    setViCards(vietnamese);
  };

  useEffect(() => {
    initGame(pairsCount);
  }, [vocabList, pairsCount]);

  // Handle English Card Click
  const handleSelectEng = (card: MatchCardItem) => {
    if (card.isMatched || mismatchedPair) return;
    playClickSound();
    handleSpeak(card.text);
    setSelectedEng(card);

    if (selectedVi) {
      checkMatch(card, selectedVi);
    }
  };

  // Handle Vietnamese Card Click
  const handleSelectVi = (card: MatchCardItem) => {
    if (card.isMatched || mismatchedPair) return;
    playClickSound();
    setSelectedVi(card);

    if (selectedEng) {
      checkMatch(selectedEng, card);
    }
  };

  // Check Match Pair logic
  const checkMatch = (eng: MatchCardItem, vi: MatchCardItem) => {
    if (eng.id === vi.id) {
      // Correct Match!
      playCorrectSound();
      setScore((prev) => prev + 10);
      addPoints(10);

      const nextEng = engCards.map((c) =>
        c.uniqueId === eng.uniqueId ? { ...c, isMatched: true } : c
      );
      const nextVi = viCards.map((c) =>
        c.uniqueId === vi.uniqueId ? { ...c, isMatched: true } : c
      );

      setEngCards(nextEng);
      setViCards(nextVi);
      setSelectedEng(null);
      setSelectedVi(null);

      // Check if all matched
      const allDone = nextEng.every((c) => c.isMatched);
      if (allDone) {
        setMatchesWon((prev) => prev + 1);
        setIsRoundCompleted(true);
        fireMagicConfetti();
      }
    } else {
      // Wrong Match
      playWrongSound();
      setMismatchedPair({ engId: eng.uniqueId, viId: vi.uniqueId });
      setTimeout(() => {
        setSelectedEng(null);
        setSelectedVi(null);
        setMismatchedPair(null);
      }, 700);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              ⭐ GAME 1
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Nối thẻ Tiếng Anh & Nghĩa Tiếng Việt tương ứng
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-fredoka mt-1">
            Nối Từ Kỳ Diệu Cùng Mickey
          </h2>
        </div>

        {/* Score & Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-fredoka font-bold text-sm">
            ⭐ Điểm ván: <span className="text-amber-600 text-lg">{score}</span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setPairsCount(6);
                initGame(6);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                pairsCount === 6
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Cặp
            </button>
            <button
              onClick={() => {
                setPairsCount(8);
                initGame(8);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                pairsCount === 8
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8 Cặp
            </button>
          </div>

          <button
            onClick={() => initGame(pairsCount)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Làm mới ván này"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary School Child-Friendly Instructions Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-quicksand">
          <span className="text-2xl">👉</span>
          <span>
            <strong>BƯỚC 1:</strong> Chạm 1 ô Xanh (Tiếng Anh) ➔ <strong>BƯỚC 2:</strong> Chạm 1 ô Cam (Tiếng Việt) tương ứng!
          </span>
        </div>
        <span className="text-2xl hidden sm:inline select-none">🏰✨</span>
      </div>

      {/* Board Columns: Left English, Right Vietnamese */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
        {/* English Column */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-3 sm:p-5 border-2 border-blue-200 shadow-sm">
          <h3 className="text-xs sm:text-base font-extrabold text-blue-700 font-quicksand mb-2 sm:mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>🇺🇸</span> Tiếng Anh
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-normal hidden sm:inline">
              Click để nghe
            </span>
          </h3>

          <div className="space-y-2 sm:space-y-3">
            {engCards.map((card) => {
              const isSelected = selectedEng?.uniqueId === card.uniqueId;
              const isMismatched = mismatchedPair?.engId === card.uniqueId;

              return (
                <button
                  key={card.uniqueId}
                  onClick={() => handleSelectEng(card)}
                  disabled={card.isMatched}
                  className={`w-full p-2.5 sm:p-4 rounded-2xl border-2 sm:border-3 text-left font-quicksand font-bold text-xs sm:text-base transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-60 pointer-events-none scale-95'
                      : isMismatched
                      ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake'
                      : isSelected
                      ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-lg scale-102 ring-4 ring-amber-200'
                      : 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-400 text-slate-800 shadow-xs hover:scale-101'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                    <span className="text-xl sm:text-2xl shrink-0">{card.icon}</span>
                    <div className="truncate">
                      <div className="text-xs sm:text-base leading-tight font-extrabold truncate">
                        {card.text}
                      </div>
                      {card.subText && (
                        <div className="text-[10px] sm:text-xs text-slate-400 font-normal italic font-sans truncate">
                          {card.subText}
                        </div>
                      )}
                    </div>
                  </div>

                  <Volume2 className="w-3.5 h-3.5 text-blue-500 opacity-70 shrink-0 ml-1" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Vietnamese Column */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-3 sm:p-5 border-2 border-emerald-200 shadow-sm">
          <h3 className="text-xs sm:text-base font-extrabold text-emerald-700 font-quicksand mb-2 sm:mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>🇻🇳</span> Nghĩa Tiếng Việt
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-normal hidden sm:inline">
              Ghép đôi
            </span>
          </h3>

          <div className="space-y-2 sm:space-y-3">
            {viCards.map((card) => {
              const isSelected = selectedVi?.uniqueId === card.uniqueId;
              const isMismatched = mismatchedPair?.viId === card.uniqueId;

              return (
                <button
                  key={card.uniqueId}
                  onClick={() => handleSelectVi(card)}
                  disabled={card.isMatched}
                  className={`w-full p-2.5 sm:p-4 rounded-2xl border-2 sm:border-3 text-left font-quicksand font-bold text-xs sm:text-base transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700 opacity-60 pointer-events-none scale-95'
                      : isMismatched
                      ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake'
                      : isSelected
                      ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-lg scale-102 ring-4 ring-amber-200'
                      : 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-400 text-slate-800 shadow-xs hover:scale-101'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs sm:text-base leading-tight font-extrabold truncate">
                      {card.text}
                    </div>
                    {card.subText && (
                      <div className="text-[10px] sm:text-xs text-slate-400 font-normal font-sans truncate">
                        {card.subText}
                      </div>
                    )}
                  </div>

                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 opacity-50 shrink-0 ml-1" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Round Complete Modal */}
      {isRoundCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 border-4 border-amber-400 shadow-2xl text-center max-w-md w-full">
            <div className="text-7xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-fredoka">
              Chúc Mừng Bé!
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Bé đã ghép đúng toàn bộ các cặp từ vựng phép thuật!
            </p>
            <div className="my-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs uppercase font-extrabold text-amber-800">
                Điểm ván này:
              </span>
              <div className="text-4xl font-extrabold text-amber-600 font-fredoka my-1">
                +{pairsCount * 10} Điểm
              </div>
              <p className="text-xs text-slate-500">
                Đã chiến thắng: {matchesWon} ván
              </p>
            </div>
            <button
              onClick={() => initGame(pairsCount)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold font-fredoka text-base shadow-lg transition active:scale-95 cursor-pointer"
            >
              Chơi Ván Mới Ngay 🏰
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
