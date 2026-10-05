import confetti from 'canvas-confetti';

// Web Audio API Sound Synthesizer
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Disney Sparkle Chime & Ting-Ting (Correct answer)
export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  // Happy Disney ascending glissando: C5, E5, G5, B5, C6
  const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.07);

    gain.gain.setValueAtTime(0.001, now + idx * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.28, now + idx * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.07);
    osc.stop(now + idx * 0.07 + 0.38);
  });

  // Extra high sparkling bell at the end
  const bell = ctx.createOscillator();
  const bellGain = ctx.createGain();
  bell.type = 'sine';
  bell.frequency.setValueAtTime(1318.51, now + 0.28); // E6
  bellGain.gain.setValueAtTime(0.18, now + 0.28);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  bell.connect(bellGain);
  bellGain.connect(ctx.destination);
  bell.start(now + 0.28);
  bell.stop(now + 0.62);
}

// Playful Cartoon Spring "Boing" / Gentle Boop (Wrong answer)
export function playWrongSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Spring sound: Rapid pitch wobble downwards
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';

  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
  osc.frequency.linearRampToValueAtTime(220, now + 0.25);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);
}

// Crisp Bubble Pop / Tap Sound
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(650, now);
  osc.frequency.exponentialRampToValueAtTime(1100, now + 0.035);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.055);
}

// Victory Fanfare
export function playVictorySound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.09);

    gain.gain.setValueAtTime(0.01, now + idx * 0.09);
    gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.09 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 0.9);
  });
}

// Launch celebratory confetti
export function fireMagicConfetti() {
  playVictorySound();
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#3A86FF', '#FF4D8D', '#7B2CBF', '#00F5D4'],
  });
}

// Text to Speech
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function speakText(
  text: string,
  rate = 0.85,
  pitch = 1.0,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel prior utterances
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  // Find a good English US or UK voice
  const preferredVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Natural') ||
        v.name.includes('US') ||
        v.name.includes('English'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}
