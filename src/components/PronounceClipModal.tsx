import React, { useState, useEffect, useRef } from 'react';
import { VocabItem } from '../types';
import {
  speakText,
  playCorrectSound,
  playWrongSound,
  playClickSound,
  fireMagicConfetti,
} from '../utils/audio';
import {
  X,
  Volume2,
  Volume1,
  Mic,
  MicOff,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  PartyPopper,
  Flame,
} from 'lucide-react';

interface PronounceClipModalProps {
  item: VocabItem | null;
  vocabList: VocabItem[];
  onClose: () => void;
  onSelectWord: (item: VocabItem) => void;
  speechSpeed: number;
  onAddScore?: (amount: number) => void;
}

// Speech recognition interface
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export const PronounceClipModal: React.FC<PronounceClipModalProps> = ({
  item,
  vocabList,
  onClose,
  onSelectWord,
  speechSpeed,
  onAddScore,
}) => {
  if (!item) return null;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [speechFeedback, setSpeechFeedback] = useState<{
    status: 'idle' | 'success' | 'try_again' | 'unsupported';
    message: string;
    stars: number;
  }>({
    status: 'idle',
    message: 'Chạm vào Micro và nói từ Tiếng Anh theo giọng mẫu nhé!',
    stars: 0,
  });

  const recognitionRef = useRef<any>(null);

  // Split syllables approximately for primary kids
  const getSyllables = (word: string): string[] => {
    const clean = word.toLowerCase().trim();
    if (clean === 'twenty-three') return ['twen', 'ty', 'three'];
    if (clean === 'one hundred and sixteen') return ['one', 'hun', 'dred', 'six', 'teen'];
    if (clean.includes('-')) return clean.split('-');
    if (clean.length <= 4) return [clean];
    // Simple heuristic split
    const match = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
    return match && match.length > 1 ? match : [clean];
  };

  const syllables = getSyllables(item.word);

  const currentIndex = vocabList.findIndex((v) => v.id === item.id);
  const prevWord = currentIndex > 0 ? vocabList[currentIndex - 1] : null;
  const nextWord = currentIndex < vocabList.length - 1 ? vocabList[currentIndex + 1] : null;

  // Auto-play pronunciation when opened or changed
  useEffect(() => {
    setSpeechFeedback({
      status: 'idle',
      message: 'Chạm vào Micro và nói từ Tiếng Anh theo giọng mẫu nhé!',
      stars: 0,
    });
    setRecognizedText('');
    handlePlayAudio(false);
  }, [item.id]);

  const handlePlayAudio = (slow = false) => {
    setIsPlayingAudio(true);
    speakText(item.word, slow ? 0.65 : speechSpeed, 1.05, () => {
      setIsPlayingAudio(false);
    });
  };

  // Start Voice Recognition
  const handleStartListening = () => {
    playClickSound();
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechFeedback({
        status: 'unsupported',
        message: 'Trình duyệt chưa hỗ trợ ghi âm trực tiếp. Bé hãy tự nói to 3 lần và nhận 3 sao nhé! ⭐⭐⭐',
        stars: 3,
      });
      playCorrectSound();
      if (onAddScore) onAddScore(15);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRec();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 3;

      rec.onstart = () => {
        setIsRecording(true);
        setSpeechFeedback({
          status: 'idle',
          message: '🎧 Đang lắng nghe bé nói... Hãy phát âm to và rõ ràng nhé!',
          stars: 0,
        });
      };

      rec.onresult = (event: any) => {
        setIsRecording(false);
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setRecognizedText(transcript);

        const target = item.word.toLowerCase().trim();
        // Check exact or contains
        const isMatch =
          transcript === target ||
          transcript.includes(target) ||
          target.includes(transcript);

        if (isMatch) {
          playCorrectSound();
          fireMagicConfetti();
          if (onAddScore) onAddScore(20);
          setSpeechFeedback({
            status: 'success',
            message: '🎉 XUẤT SẮC! Bé phát âm chuẩn như người bản xứ!',
            stars: 3,
          });
        } else {
          playWrongSound();
          setSpeechFeedback({
            status: 'try_again',
            message: `Bé nói là: "${transcript}". Chưa chuẩn lắm, nghe lại và thử lần nữa nhé!`,
            stars: 1,
          });
        }
      };

      rec.onerror = () => {
        setIsRecording(false);
        setSpeechFeedback({
          status: 'try_again',
          message: 'Chưa nghe rõ giọng bé. Bé hãy bấm Micro và nói lại to hơn nhé!',
          stars: 0,
        });
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(false);
      setSpeechFeedback({
        status: 'unsupported',
        message: 'Bé hãy nói to theo mẫu để luyện khẩu hình miệng nhé!',
        stars: 3,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-nunito">
      <div
        className="relative w-full max-w-lg bg-white rounded-[32px] p-5 sm:p-7 shadow-2xl border-4 border-amber-300 text-center overflow-hidden animate-scaleUp max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <span>🎬 THUMB CLIP</span>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </span>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Luyện Nghe & Phát Âm Theo
            </span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mini Cinema Cartoon Screen Box */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 sm:p-6 text-white shadow-xl border-3 border-amber-400 overflow-hidden">
          {/* Top Cinema Banner */}
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-3 select-none">
            <span className="flex items-center gap-1">
              <span>🏰</span> DISNEY PHONICS STUDIO
            </span>
            <span className="bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30">
              HD AUDIO 1080p
            </span>
          </div>

          {/* Center Mascot & Waveform */}
          <div className="my-3 flex flex-col items-center justify-center">
            {/* Mascot Avatar with speech pulse */}
            <div className="relative">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-5xl sm:text-6xl shadow-xl shadow-orange-500/30 border-4 border-white transition transform ${
                  isPlayingAudio ? 'scale-110 ring-8 ring-amber-400/60' : 'hover:scale-105'
                }`}
              >
                {item.icon}
              </div>

              {/* Animated Speaking Mouth Badge */}
              <div className="absolute -bottom-2 -right-1 bg-white text-slate-900 rounded-full px-2.5 py-1 text-xs font-black shadow-md border-2 border-amber-400 flex items-center gap-1">
                <span>{item.char}</span>
                <span className="text-amber-500 animate-bounce">🗣️</span>
              </div>
            </div>

            {/* Sound Wave Animation Bars */}
            <div className="flex items-center gap-1.5 my-3 h-6">
              {[40, 75, 100, 60, 85, 95, 50, 80, 100, 65, 45].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-gradient-to-t from-amber-400 to-yellow-200 transition-all duration-150 ${
                    isPlayingAudio ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${h}%` : '25%',
                  }}
                />
              ))}
            </div>

            {/* English Word & IPA Display */}
            <h2 className="text-3xl sm:text-4xl font-black font-quicksand text-white tracking-wide drop-shadow-md">
              {item.word}
            </h2>
            <span className="text-sm font-mono text-amber-300 mt-0.5">
              {item.ipa}
            </span>

            {/* Syllables Clapping Guide */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="text-[11px] text-slate-300 font-bold mr-1">
                Tách âm:
              </span>
              {syllables.map((syl, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-white/15 border border-white/20 text-xs font-black uppercase text-amber-200 shadow-xs"
                >
                  {syl}
                  {i < syllables.length - 1 && <span className="text-amber-400 ml-1">•</span>}
                </span>
              ))}
              <span className="text-[11px] text-amber-300 font-medium ml-1">
                (👏 {syllables.length} nhịp)
              </span>
            </div>

            <p className="text-sm text-slate-200 font-bold mt-2">
              "{item.meaning}"
            </p>
          </div>

          {/* Model Audio Playback Controls */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => handlePlayAudio(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 fill-slate-950" />
              <span>Nghe Chuẩn (0.85x)</span>
            </button>

            <button
              onClick={() => handlePlayAudio(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
            >
              <Volume1 className="w-4 h-4 text-amber-300" />
              <span>Nghe Chậm (0.65x)</span>
            </button>
          </div>
        </div>

        {/* Interactive Repeat & Speak Section */}
        <div className="mt-5 p-4 rounded-3xl bg-orange-50/80 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-orange-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span>BƯỚC 2: BÉ PHÁT ÂM THEO</span>
            </span>

            {speechFeedback.stars > 0 && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= speechFeedback.stars
                        ? 'fill-amber-400 text-amber-500 animate-bounce'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-700 font-medium mb-3">
            {speechFeedback.message}
          </p>

          {/* Big Glowing Microphone Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleStartListening}
              disabled={isRecording}
              className={`relative px-6 py-3.5 rounded-2xl text-white font-black font-quicksand text-sm shadow-xl transition transform active:scale-95 flex items-center gap-2 cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 ring-8 ring-rose-300 animate-pulse'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5 animate-spin" />
                  <span>Đang Nghe Giọng Bé...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Chạm Vào Đây Để Nói 🎙️</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example Sentence Preview */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs">
          <span className="font-extrabold text-blue-700 block mb-0.5">
            📝 Câu ví dụ SGK Lớp 5:
          </span>
          <p className="font-semibold text-slate-800">"{item.exampleEn}"</p>
          <p className="text-slate-500 italic mt-0.5">→ {item.exampleVi}</p>
        </div>

        {/* Navigation Row between 32 Words */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              if (prevWord) {
                playClickSound();
                onSelectWord(prevWord);
              }
            }}
            disabled={!prevWord}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              prevWord
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'opacity-30 cursor-not-allowed text-slate-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Từ Trước</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {currentIndex + 1} / {vocabList.length}
          </span>

          <button
            onClick={() => {
              if (nextWord) {
                playClickSound();
                onSelectWord(nextWord);
              }
            }}
            disabled={!nextWord}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              nextWord
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'opacity-30 cursor-not-allowed text-slate-400'
            }`}
          >
            <span>Từ Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
