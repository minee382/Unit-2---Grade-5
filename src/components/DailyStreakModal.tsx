import React from 'react';
import { Flame, X, Trophy, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface DailyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  starsCount: number;
}

export const DailyStreakModal: React.FC<DailyStreakModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  starsCount,
}) => {
  if (!isOpen) return null;

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0 is Monday, 6 is Sunday

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn font-nunito">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Flame Icon */}
        <div className="relative mx-auto my-3 w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/40">
          <Flame className="w-14 h-14 fill-white text-white animate-pulse" />
          <span className="absolute -bottom-1 -right-1 text-2xl select-none">
            🏰
          </span>
        </div>

        {/* Badge Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
          <span>CHUỖI HỌC TẬP HÀNG NGÀY</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-quicksand">
          {streakCount} Ngày Liên Tiếp!
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto">
          {streakCount >= 7
            ? '🔥 Thật phi thường! Bé đang duy trì ngọn lửa học tiếng Anh siêu bền bỉ!'
            : streakCount >= 3
            ? '✨ Tuyệt vời lắm! Bé đang xây dựng thói quen học tập rất xuất sắc!'
            : '🌟 Chào mừng bé đã bắt đầu chuỗi học tập ngày hôm nay!'}
        </p>

        {/* 7-Day Week Visual Calendar */}
        <div className="my-6 bg-orange-50/70 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-orange-900 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>Tuần Này Của Bé:</span>
            </span>
            <span className="text-[11px] text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded-lg">
              Hôm nay: {daysOfWeek[todayDayIndex]}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysOfWeek.map((day, idx) => {
              const isToday = idx === todayDayIndex;
              const isPastOrToday = idx <= todayDayIndex;

              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition ${
                    isToday
                      ? 'bg-gradient-to-b from-orange-500 to-amber-500 text-white border-orange-600 shadow-md scale-105'
                      : isPastOrToday
                      ? 'bg-white border-orange-300 text-orange-900 font-bold'
                      : 'bg-white/40 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-bold block">{day}</span>
                  <div className="mt-1">
                    {isPastOrToday ? (
                      <Flame
                        className={`w-4 h-4 ${
                          isToday
                            ? 'fill-amber-200 text-amber-200 animate-bounce'
                            : 'fill-orange-500 text-orange-500'
                        }`}
                      />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left">
            <span className="text-[11px] font-bold text-slate-500 block">
              ⭐ TỔNG SAO PHÉP THUẬT
            </span>
            <span className="text-lg font-black font-quicksand text-amber-600">
              {starsCount} Sao
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left">
            <span className="text-[11px] font-bold text-slate-500 block">
              🏆 DANH HIỆU
            </span>
            <span className="text-xs font-black font-quicksand text-blue-700">
              {streakCount >= 7
                ? 'Phù Thủy Tiếng Anh'
                : streakCount >= 3
                ? 'Chiến Binh Chăm Chỉ'
                : 'Thực Tập Sinh Disney'}
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold font-quicksand text-sm shadow-lg shadow-orange-500/25 transition transform active:scale-95 cursor-pointer"
        >
          Tiếp Tục Luyện Tập Thôi! 🚀
        </button>
      </div>
    </div>
  );
};
