import React, { useState, useEffect } from 'react';
import { GameTab, VocabItem } from './types';
import { VOCAB_ITEMS } from './data/vocabData';
import { Header } from './components/Header';
import { FlashcardView } from './components/FlashcardView';
import { TypingQuizMode } from './components/TypingQuizMode';
import { MultipleChoiceQuiz } from './components/MultipleChoiceQuiz';
import { MatchingGame } from './components/MatchingGame';
import { SpellingGame } from './components/SpellingGame';
import { ListeningGame } from './components/ListeningGame';
import { SentencePractice } from './components/SentencePractice';
import { VocabModal } from './components/VocabModal';
import { DailyStreakModal } from './components/DailyStreakModal';
import { PronounceClipModal } from './components/PronounceClipModal';
import { speakText, playClickSound } from './utils/audio';
import { Heart, Sparkles, RotateCcw } from 'lucide-react';

const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<GameTab>('flashcards');
  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null);
  const [selectedClipItem, setSelectedClipItem] = useState<VocabItem | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.85);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);

  // Persisted Stars / Score
  const [starsCount, setStarsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('disney_unit2_stars');
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  // Persisted Favorite Words
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('disney_unit2_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Streak tracked via localStorage
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    try {
      const todayStr = getLocalDateString();
      const yesterdayStr = getYesterdayDateString();
      const savedDate = localStorage.getItem('disney_unit2_last_practice_date');
      const savedStreakStr = localStorage.getItem('disney_unit2_daily_streak');
      const savedStreak = savedStreakStr ? parseInt(savedStreakStr, 10) : 1;

      if (!savedDate) {
        // First visit / practice session
        localStorage.setItem('disney_unit2_last_practice_date', todayStr);
        localStorage.setItem('disney_unit2_daily_streak', '1');
        return 1;
      }

      if (savedDate === todayStr) {
        // Already practiced today, keep streak
        return savedStreak || 1;
      }

      if (savedDate === yesterdayStr) {
        // Practiced yesterday! Active consecutive streak
        const newStreak = (savedStreak || 1) + 1;
        localStorage.setItem('disney_unit2_last_practice_date', todayStr);
        localStorage.setItem('disney_unit2_daily_streak', newStreak.toString());
        return newStreak;
      }

      // Missed more than 1 day, reset to 1
      localStorage.setItem('disney_unit2_last_practice_date', todayStr);
      localStorage.setItem('disney_unit2_daily_streak', '1');
      return 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('disney_unit2_stars', starsCount.toString());
    } catch {
      // ignore
    }
  }, [starsCount]);

  useEffect(() => {
    try {
      localStorage.setItem('disney_unit2_favs', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Record practice activity and update streak if needed
  const recordPracticeDay = () => {
    try {
      const todayStr = getLocalDateString();
      const savedDate = localStorage.getItem('disney_unit2_last_practice_date');
      const savedStreakStr = localStorage.getItem('disney_unit2_daily_streak');
      let currentStreak = savedStreakStr ? parseInt(savedStreakStr, 10) : 1;

      if (savedDate !== todayStr) {
        const yesterdayStr = getYesterdayDateString();
        if (savedDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        localStorage.setItem('disney_unit2_last_practice_date', todayStr);
        localStorage.setItem('disney_unit2_daily_streak', currentStreak.toString());
        setDailyStreak(currentStreak);
      }
    } catch {
      // ignore
    }
  };

  const handleSpeak = (text: string, rate?: number) => {
    if (!soundEnabled) return;
    speakText(text, rate || speechRate);
  };

  const handleAddScore = (points: number) => {
    setStarsCount((prev) => prev + points);
    recordPracticeDay();
  };

  const handleToggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSpeechRate = () => {
    playClickSound();
    setSpeechRate((prev) => (prev < 0.8 ? 0.85 : 0.65));
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleResetData = () => {
    if (window.confirm('Bé có muốn đặt lại toàn bộ điểm sao, chuỗi ngày học và danh sách từ đã lưu?')) {
      setStarsCount(100);
      setFavorites([]);
      setDailyStreak(1);
      localStorage.removeItem('disney_unit2_stars');
      localStorage.removeItem('disney_unit2_favs');
      localStorage.removeItem('disney_unit2_daily_streak');
      localStorage.removeItem('disney_unit2_last_practice_date');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-nunito bg-[#EEF4FB] text-slate-800">
      {/* Header Banner & Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          playClickSound();
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        speechRate={speechRate}
        onToggleSpeechRate={handleToggleSpeechRate}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        starsCount={starsCount}
        dailyStreak={dailyStreak}
        onShowStreakModal={() => {
          playClickSound();
          setShowStreakModal(true);
        }}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 mt-6">
        {currentTab === 'flashcards' && (
          <FlashcardView
            vocabList={VOCAB_ITEMS}
            bookmarkedIds={favorites}
            onToggleBookmark={handleToggleFavorite}
            onSelectWord={(item) => setSelectedVocab(item)}
            speechSpeed={speechRate}
          />
        )}

        {currentTab === 'typingQuiz' && (
          <TypingQuizMode
            vocabList={VOCAB_ITEMS}
            speechRate={speechRate}
            onSpeak={handleSpeak}
            onAddScore={handleAddScore}
          />
        )}

        {currentTab === 'quiz' && (
          <MultipleChoiceQuiz
            vocabList={VOCAB_ITEMS}
            speechRate={speechRate}
            onSpeak={handleSpeak}
            onAddScore={handleAddScore}
          />
        )}

        {currentTab === 'match' && (
          <MatchingGame
            vocabList={VOCAB_ITEMS}
            speechRate={speechRate}
            onSpeak={handleSpeak}
            onAddScore={handleAddScore}
          />
        )}

        {currentTab === 'spelling' && (
          <SpellingGame
            vocabList={VOCAB_ITEMS}
            speechRate={speechRate}
            onSpeak={handleSpeak}
            onAddScore={handleAddScore}
          />
        )}

        {currentTab === 'listening' && (
          <ListeningGame
            vocabList={VOCAB_ITEMS}
            onAddScore={handleAddScore}
            speechRate={speechRate}
            onSpeak={handleSpeak}
          />
        )}

        {currentTab === 'sentences' && (
          <SentencePractice
            onAddScore={handleAddScore}
            speechRate={speechRate}
            onSpeak={handleSpeak}
          />
        )}
      </main>

      {/* Detailed Word Modal */}
      <VocabModal
        item={selectedVocab}
        onClose={() => setSelectedVocab(null)}
        isBookmarked={selectedVocab ? favorites.includes(selectedVocab.id) : false}
        onToggleBookmark={handleToggleFavorite}
        speechSpeed={speechRate}
        onSpeak={handleSpeak}
      />

      {/* Daily Streak Modal */}
      <DailyStreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakCount={dailyStreak}
        starsCount={starsCount}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Disney Magic English 5 • Unit 2: Our Homes (My Home Town)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Đồng hành cùng học sinh Lớp 5{' '}
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
            </span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] underline cursor-pointer"
              title="Đặt lại điểm số"
            >
              <RotateCcw className="w-3 h-3" /> Đặt lại điểm
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
