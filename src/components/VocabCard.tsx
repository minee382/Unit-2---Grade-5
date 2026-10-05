import React, { useState } from 'react';
import { Volume2, Star, RotateCw } from 'lucide-react';
import { VocabItem } from '../types';

interface VocabCardProps {
  item: VocabItem;
  speechRate: number;
  onSpeak: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onOpenDetails: (item: VocabItem) => void;
}

const colorThemes = [
  { border: 'border-rose-400', badge: 'bg-rose-500', glow: 'hover:shadow-rose-200' },
  { border: 'border-teal-400', badge: 'bg-teal-500', glow: 'hover:shadow-teal-200' },
  { border: 'border-blue-400', badge: 'bg-blue-500', glow: 'hover:shadow-blue-200' },
  { border: 'border-amber-400', badge: 'bg-amber-500', glow: 'hover:shadow-amber-200' },
  { border: 'border-emerald-400', badge: 'bg-emerald-500', glow: 'hover:shadow-emerald-200' },
];

export const VocabCard: React.FC<VocabCardProps> = ({
  item,
  speechRate,
  onSpeak,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = colorThemes[item.colorScheme % colorThemes.length];

  const handleCardClick = () => {
    onSpeak(item.word);
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-3xl border-3 ${theme.border} p-5 shadow-sm hover:shadow-xl ${theme.glow} transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between min-h-[260px]`}
    >
      {/* Top Bar: Number & Disney Buddy & Favorite */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-9 h-9 rounded-full ${theme.badge} text-white font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-white`}
        >
          {item.id}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            ✨ <span>{item.char}</span>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className="p-1 text-slate-300 hover:text-amber-400 transition"
            title="Lưu vào danh sách yêu thích"
          >
            <Star
              className={`w-5 h-5 ${
                isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Body: Flip between basic view and example sentence */}
      {!isFlipped ? (
        <div className="text-center my-2 flex-1 flex flex-col justify-center items-center">
          <div className="text-5xl my-2 filter drop-shadow-md select-none transform group-hover:scale-110 transition duration-300">
            {item.icon}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 font-fredoka tracking-wide">
            {item.word}
          </h3>
          <div className="text-xs text-slate-500 italic mt-0.5">
            {item.ipa} <span className="font-semibold text-slate-600">({item.pos})</span>
          </div>
          <div className="text-base font-extrabold text-indigo-700 mt-2 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100/80">
            {item.meaning}
          </div>
        </div>
      ) : (
        <div className="my-2 flex-1 flex flex-col justify-center text-left bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-black uppercase text-indigo-600 tracking-wider mb-1 flex items-center gap-1">
            📖 Câu ví dụ Unit 2:
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
            "{item.exampleEn}"
          </p>
          <p className="text-xs text-slate-600 mt-1 italic">
            👉 {item.exampleVi}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(item.exampleEn);
            }}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
          >
            <Volume2 className="w-3.5 h-3.5" /> Nghe cả câu
          </button>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSpeak(item.word);
          }}
          className="w-9 h-9 rounded-full bg-sky-100 hover:bg-sky-500 text-sky-600 hover:text-white flex items-center justify-center transition shadow-sm"
          title="Nghe phát âm chuẩn"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleFlip}
            className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition"
            title="Lật thẻ xem ví dụ"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Từ vựng' : 'Ví dụ'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(item);
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};
