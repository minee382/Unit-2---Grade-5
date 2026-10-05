import React from 'react';
import { GameTab } from '../types';
import { Sparkles, Gauge, Volume2, VolumeX, Star, Flame } from 'lucide-react';

interface HeaderProps {
  currentTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  speechRate: number;
  onToggleSpeechRate: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  starsCount: number;
  dailyStreak: number;
  onShowStreakModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  speechRate,
  onToggleSpeechRate,
  soundEnabled,
  onToggleSound,
  starsCount,
  dailyStreak,
  onShowStreakModal,
}) => {
  const tabs: { id: GameTab; label: string; icon: string; badge?: string }[] = [
    { id: 'flashcards', label: '32 Từ Vựng', icon: '📚' },
    { id: 'typingQuiz', label: 'Quiz Gõ Từ & Nghĩa', icon: '✍️', badge: 'MỚI' },
    { id: 'quiz', label: 'Trắc Nghiệm', icon: '🏆' },
    { id: 'match', label: 'Nối Từ Kỳ Diệu', icon: '⭐' },
    { id: 'spelling', label: 'Chính Tả', icon: '🔤' },
    { id: 'listening', label: 'Listen & Select (Nghe & Chọn)', icon: '🎧', badge: 'MỚI' },
    { id: 'sentences', label: 'Mẫu Câu & Hội Thoại', icon: '💬' },
  ];

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#1A365D] via-[#0F172A] to-[#311B92] text-white pt-6 pb-5 px-4 rounded-b-[36px] shadow-2xl border-b-4 border-amber-400">
      {/* Decorative stars */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-amber-300 opacity-90 text-sm tracking-widest font-fredoka pointer-events-none select-none">
        <span>✨</span> <span>🏰</span> <span>DISNEY MAGIC KINGDOM</span> <span>🏰</span> <span>✨</span>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-3">
        {/* Title & Subtitle */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs tracking-wide shadow-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            TIẾNG ANH LỚP 5 • UNIT 2: OUR HOMES (MY HOME TOWN)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-amber-300 tracking-wide font-fredoka flex items-center justify-center md:justify-start gap-2 drop-shadow-md">
            <span>🏰</span> OUR HOMES & MY HOMETOWN
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-xl">
            Khám phá trọn bộ 32 từ vựng, phát âm chuẩn, Quiz Mode thử thách gõ từ, game nối từ, trắc nghiệm và mẫu câu cùng Mickey & Bạn bè!
          </p>
        </div>

        {/* Global Controls & Score */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Daily Streak Counter */}
          <button
            onClick={() => onShowStreakModal?.()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-400/50 hover:border-orange-300 text-orange-300 font-bold text-sm shadow-inner backdrop-blur-sm transition active:scale-95 cursor-pointer"
            title="Chuỗi ngày học tập liên tục (Bấm để xem chi tiết lịch học)"
          >
            <Flame className="w-4 h-4 fill-orange-400 text-orange-400 animate-pulse" />
            <span className="font-quicksand tracking-wider">
              {dailyStreak} Ngày Liên Tiếp
            </span>
          </button>

          {/* Star Counter */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-bold text-sm shadow-inner backdrop-blur-sm">
            <Star className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
            <span className="font-quicksand tracking-wider">{starsCount} Sao Phép Thuật</span>
          </div>

          {/* Speech Rate Toggle */}
          <button
            onClick={onToggleSpeechRate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title="Đổi tốc độ phát âm (Bình thường / Chậm cho bé dễ nghe)"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-300" />
            <span>{speechRate < 0.8 ? '🐢 Chậm (0.7x)' : '🐰 Chuẩn (0.85x)'}</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition active:scale-95 text-xs cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto mt-5 pt-1 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm font-fredoka flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 border-2 border-amber-300 scale-105'
                    : 'bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border-2 border-transparent hover:border-amber-200 shadow-sm'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] uppercase font-black tracking-wider bg-rose-500 text-white rounded-full animate-pulse shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
