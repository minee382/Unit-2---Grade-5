import React from 'react';
import { X, Volume2, Sparkles, BookOpen, Star } from 'lucide-react';
import { VocabItem } from '../types';
import { speakText, playClickSound } from '../utils/audio';

interface VocabModalProps {
  item: VocabItem | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: number) => void;
  speechSpeed?: number;
  onSpeak?: (text: string, rate?: number) => void;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  item,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
  speechSpeed = 0.85,
  onSpeak,
}) => {
  if (!item) return null;

  const handleSpeakWord = (slow = false) => {
    playClickSound();
    if (onSpeak) {
      onSpeak(item.word, slow ? 0.65 : speechSpeed);
    } else {
      speakText(item.word, slow ? 0.65 : speechSpeed);
    }
  };

  const handleSpeakSentence = () => {
    playClickSound();
    if (onSpeak) {
      onSpeak(item.exampleEn, speechSpeed);
    } else {
      speakText(item.exampleEn, speechSpeed);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center justify-between pr-10 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center gap-1 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Bạn đồng hành: {item.char}
            </span>
            <span className="text-xs text-slate-500 font-bold">Thẻ #{item.id}</span>
          </div>

          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(item.id)}
              className="p-1.5 rounded-full hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition cursor-pointer"
              title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ này'}
            >
              <Star
                className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Central Display */}
        <div className="text-center my-4">
          <div className="text-6xl mb-2 filter drop-shadow-md select-none">{item.icon}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-fredoka">
            {item.word}
          </h2>
          <div className="text-base text-slate-500 italic mt-1 font-mono">
            {item.ipa}{' '}
            <span className="font-sans font-bold text-slate-700">
              ({item.pos === 'adj' ? 'Tính từ' : item.pos === 'n' ? 'Danh từ' : 'Số đếm'})
            </span>
          </div>
          <div className="inline-block mt-3 px-4 py-1.5 rounded-2xl bg-indigo-100 text-indigo-900 font-extrabold text-xl shadow-xs">
            {item.meaning}
          </div>
        </div>

        {/* Audio buttons: normal and slow */}
        <div className="flex justify-center items-center gap-3 my-4">
          <button
            onClick={() => handleSpeakWord(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            Phát âm chuẩn (1.0x)
          </button>
          <button
            onClick={() => handleSpeakWord(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <span>🐢</span>
            Đọc chậm (0.65x)
          </button>
        </div>

        {/* Example Sentence Box */}
        <div className="mt-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-700" />
              Mẫu câu chuẩn Lớp 5 Unit 2:
            </span>
            <button
              onClick={handleSpeakSentence}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-200/60 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Nghe câu
            </button>
          </div>
          <p className="text-slate-800 font-bold text-sm sm:text-base leading-relaxed">
            "{item.exampleEn}"
          </p>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 italic">
            👉 {item.exampleVi}
          </p>
        </div>

        {/* Footer Disney Encouragement */}
        <div className="mt-4 text-center text-xs text-slate-500 italic">
          ✨ {item.char} nhắn nhủ: Hãy luyện phát âm to rõ 3 lần mỗi ngày để nhớ từ thật lâu nhé!
        </div>
      </div>
    </div>
  );
};
