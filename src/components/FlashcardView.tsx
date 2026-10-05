import React, { useState } from 'react';
import { VocabItem, VocabCategory } from '../types';
import { speakText, playClickSound } from '../utils/audio';
import {
  Volume2,
  Volume1,
  Search,
  Star,
  RotateCw,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
} from 'lucide-react';

interface FlashcardViewProps {
  vocabList: VocabItem[];
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  onSelectWord: (item: VocabItem) => void;
  speechSpeed: number;
  onOpenClip?: (item: VocabItem) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  vocabList,
  bookmarkedIds,
  onToggleBookmark,
  onSelectWord,
  speechSpeed,
  onOpenClip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [flippedCardIds, setFlippedCardIds] = useState<Record<number, boolean>>({});
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

  // Border colors matching Disney palette
  const borderColors = [
    'border-rose-300 hover:border-rose-400 group-hover:shadow-rose-200',
    'border-teal-300 hover:border-teal-400 group-hover:shadow-teal-200',
    'border-sky-300 hover:border-sky-400 group-hover:shadow-sky-200',
    'border-amber-300 hover:border-amber-400 group-hover:shadow-amber-200',
    'border-emerald-300 hover:border-emerald-400 group-hover:shadow-emerald-200',
  ];

  const badgeBgs = [
    'bg-rose-500',
    'bg-teal-500',
    'bg-sky-500',
    'bg-amber-500',
    'bg-emerald-500',
  ];

  // Filtering
  const filtered = vocabList.filter((item) => {
    if (onlyBookmarked && !bookmarkedIds.includes(item.id)) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.char.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleFlip = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playClickSound();
    setFlippedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSpeak = (word: string, e?: React.MouseEvent, slow = false) => {
    if (e) e.stopPropagation();
    speakText(word, slow ? 0.65 : speechSpeed);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 shadow-sm border-2 border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm nhanh: address, flat, village, quê hương..."
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 font-medium text-sm outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs hover:bg-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all border-2 ${
                onlyBookmarked
                  ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star
                className={`w-4 h-4 ${onlyBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`}
              />
              <span>Từ đã lưu ({bookmarkedIds.length})</span>
            </button>

            <button
              onClick={() => {
                if (filtered.length > 0) {
                  setSlideshowIndex(0);
                  speakText(filtered[0].word, speechSpeed);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-200 font-bold text-xs transition-colors"
              title="Chế độ chiếu lớn từng thẻ"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Trình chiếu lớn</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Phân loại:
          </span>

          {[
            { id: 'all' as VocabCategory, label: 'Tất cả (32)' },
            { id: 'places' as VocabCategory, label: '🏰 Địa điểm & Nhà' },
            { id: 'adjectives' as VocabCategory, label: '✨ Tính từ miêu tả' },
            { id: 'addresses' as VocabCategory, label: '📍 Địa chỉ & Đường' },
            { id: 'numbers' as VocabCategory, label: '🔢 Số đếm' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter Summary */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Hiển thị: <span className="text-slate-800 font-bold">{filtered.length}</span> từ vựng
        </div>
        <div className="text-xs text-slate-500 italic">
          💡 Chạm vào thẻ để lật mặt sau xem nghĩa & ví dụ
        </div>
      </div>

      {/* Flashcards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 my-8">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-700 font-fredoka">
            Không tìm thấy từ vựng nào!
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Hãy thử tìm từ khác hoặc xoá bộ lọc đang chọn.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyBookmarked(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            Hiện lại tất cả 32 từ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isFlipped = !!flippedCardIds[item.id];
            const isBookmarked = bookmarkedIds.includes(item.id);
            const borderCls = borderColors[item.colorScheme % borderColors.length];
            const badgeBgCls = badgeBgs[item.colorScheme % badgeBgs.length];

            return (
              <div
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className={`group relative bg-white rounded-3xl p-5 border-3 transition-all duration-300 cursor-pointer select-none shadow-xs hover:shadow-lg hover:-translate-y-1.5 flex flex-col justify-between min-h-[260px] ${borderCls}`}
              >
                {/* Top Corner Details */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`w-7 h-7 rounded-full text-white text-xs font-extrabold flex items-center justify-center shadow-xs ${badgeBgCls}`}
                  >
                    {item.id}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      ✨ {item.char}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onToggleBookmark(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                      title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ'}
                    >
                      <Star
                        className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Content: Front vs Flipped Back */}
                {!isFlipped ? (
                  // Front Face
                  <div className="text-center my-2">
                    {/* Cute cartoon illustration container */}
                    <div className="relative my-2 py-3 px-2 rounded-2xl bg-gradient-to-b from-slate-50 via-blue-50/40 to-indigo-50/30 border border-slate-100 flex flex-col items-center justify-center shadow-inner">
                      <div className="text-5xl sm:text-6xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-200 select-none">
                        {item.icon}
                      </div>
                      <span className="mt-1.5 text-[10px] font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                        🏰 {item.char}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 font-quicksand tracking-wide mt-1">
                      {item.word}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono italic">
                        {item.ipa}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {item.pos}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-amber-600 mt-1.5 line-clamp-1">
                      {item.meaning}
                    </p>
                  </div>
                ) : (
                  // Back Face
                  <div className="text-center my-2 animate-in fade-in zoom-in-95 duration-200 flex-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                      Nghĩa Tiếng Việt
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-900 font-quicksand">
                      {item.meaning}
                    </h4>

                    {/* Short example */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 mt-2.5 text-left text-xs">
                      <p className="font-semibold text-slate-800">
                        "{item.exampleEn}"
                      </p>
                      <p className="text-slate-500 mt-0.5 italic">
                        → {item.exampleVi}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleSpeak(item.word, e)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all shadow-xs"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe</span>
                    </button>

                    {/* Thumb Clip & Repeat Link Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        if (onOpenClip) onOpenClip(item);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
                      title="Xem Clip & Luyện phát âm theo"
                    >
                      <Play className="w-3 h-3 fill-white text-white" />
                      <span>Clip</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => handleSpeak(item.word, e, true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      title="Nghe chậm (0.65x)"
                    >
                      <Volume1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onSelectWord(item);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Xem chi tiết ví dụ & mẫu câu"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleFlip(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Lật thẻ"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classroom Slideshow Fullscreen Modal */}
      {slideshowIndex !== null && filtered[slideshowIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSlideshowIndex(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border-4 border-amber-400 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close */}
            <button
              onClick={() => setSlideshowIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Từ {slideshowIndex + 1} / {filtered.length}
            </span>

            {/* Slide Content */}
            <div className="my-6">
              <div className="text-7xl mb-4 animate-bounce">
                {filtered[slideshowIndex].icon}
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 font-fredoka">
                {filtered[slideshowIndex].word}
              </h2>
              <p className="text-lg text-slate-500 font-mono italic mt-1">
                {filtered[slideshowIndex].ipa} ({filtered[slideshowIndex].pos})
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-3 font-nunito">
                {filtered[slideshowIndex].meaning}
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 mt-6 text-left">
                <p className="text-sm font-semibold text-slate-800">
                  "{filtered[slideshowIndex].exampleEn}"
                </p>
                <p className="text-xs text-slate-500 mt-1 italic">
                  → {filtered[slideshowIndex].exampleVi}
                </p>
              </div>
            </div>

            {/* Play Sound Button */}
            <div className="flex items-center justify-center gap-3 my-4">
              <button
                onClick={() => speakText(filtered[slideshowIndex].word, speechSpeed)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
                Nghe từ vựng
              </button>
              <button
                onClick={() => speakText(filtered[slideshowIndex].exampleEn, speechSpeed)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                Nghe cả câu
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <button
                disabled={slideshowIndex === 0}
                onClick={() => {
                  const nextIdx = slideshowIndex - 1;
                  setSlideshowIndex(nextIdx);
                  speakText(filtered[nextIdx].word, speechSpeed);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Từ trước
              </button>

              <button
                disabled={slideshowIndex === filtered.length - 1}
                onClick={() => {
                  const nextIdx = slideshowIndex + 1;
                  setSlideshowIndex(nextIdx);
                  speakText(filtered[nextIdx].word, speechSpeed);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-30 disabled:pointer-events-none"
              >
                Từ tiếp theo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
