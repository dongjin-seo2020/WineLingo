'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { wineDatabase, type WineEntry } from '@/data/wineDatabase';
import { useProgress } from '@/hooks/useProgress';

const COLOR_HEX: Record<string, string> = {
  red: '#8B1A1A', white: '#D4C060', rosé: '#E8728A',
  sparkling: '#A0C4E8', dessert: '#D4A040', orange: '#C46A1A',
};

const CLUE_LABELS = ['색상', '아로마', '맛/질감', '힌트', '품종'];

function WineGlass({ color, revealed }: { color: string; revealed: boolean }) {
  return (
    <svg width={120} height={180} viewBox="0 0 120 180" className="drop-shadow-lg">
      <path d="M18,6 L102,6 Q90,62 80,84 L40,84 Q30,62 18,6 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <path d="M32,36 L88,36 Q82,80 78,84 L42,84 Q38,80 32,36 Z" fill={revealed ? color : '#888'} style={{ transition: 'fill 1s ease' }} />
      <path d="M32,36 Q60,26 88,36" fill={revealed ? color + 'CC' : '#666'} />
      <ellipse cx="57" cy="34" rx="16" ry="5" fill="rgba(255,255,255,0.25)" />
      <rect x="57" y="84" width="6" height="54" fill="rgba(255,255,255,0.3)" rx="3" />
      <ellipse cx="60" cy="138" rx="33" ry="10" fill="rgba(255,255,255,0.2)" />
      <ellipse cx="60" cy="136" rx="28" ry="7" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

function ScoreBadge({ score, max }: { score: number; max: number }) {
  return (
    <div className="bg-[#FFF8E0] border border-[#F0C060] rounded-xl px-4 py-2 text-center">
      <div className="text-2xl font-black text-[#D4A017]">{score}</div>
      <div className="text-xs text-[#8B6000]">/ {max} 점</div>
    </div>
  );
}

function getWrongChoices(correct: WineEntry, all: WineEntry[]): WineEntry[] {
  const pool = all.filter((w) => w.id !== correct.id && w.color === correct.color);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

const SCORE_PER_CLUE = [500, 400, 300, 200, 100];

export default function GuessPage() {
  const router = useRouter();
  const { completeLesson } = useProgress();

  const [started, setStarted] = useState(false);
  const [wine, setWine] = useState<WineEntry | null>(null);
  const [choices, setChoices] = useState<WineEntry[]>([]);
  const [clueIndex, setClueIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const [roundResults, setRoundResults] = useState<{ wine: WineEntry; correct: boolean; score: number; cluesUsed: number }[]>([]);

  const ROUNDS = 5;

  const pickNewWine = () => {
    const pool = wineDatabase;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const wrong = getWrongChoices(picked, pool);
    const all = [...wrong, picked].sort(() => Math.random() - 0.5);
    setWine(picked);
    setChoices(all);
    setClueIndex(0);
    setSelected(null);
    setAnswered(false);
  };

  const start = () => {
    pickNewWine();
    setStarted(true);
    setTotalScore(0);
    setRound(1);
    setDone(false);
    setRoundResults([]);
  };

  const handleGuess = () => {
    if (!selected || !wine) return;
    const isCorrect = selected === wine.id;
    const score = isCorrect ? SCORE_PER_CLUE[clueIndex] : 0;
    setTotalScore((s) => s + score);
    setAnswered(true);
    setRoundResults((prev) => [...prev, { wine, correct: isCorrect, score, cluesUsed: clueIndex + 1 }]);
  };

  const handleNext = () => {
    if (round >= ROUNDS) {
      setDone(true);
    } else {
      setRound((r) => r + 1);
      pickNewWine();
    }
  };

  const clues = wine ? [
    { label: '색상', icon: '🎨', text: wine.clues.visual },
    { label: '아로마', icon: '👃', text: wine.clues.aroma },
    { label: '맛/질감', icon: '👅', text: wine.clues.taste },
    { label: '힌트', icon: '📍', text: wine.clues.hint },
    { label: '품종', icon: '🍇', text: wine.clues.grape },
  ] : [];

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#1A0A2E]">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-black text-white mb-2">Guess This Wine</h1>
        <p className="text-white/70 text-center mb-6">단계별 힌트를 보고 와인을 맞춰요.<br/>힌트가 적을수록 점수가 높아요!</p>
        <div className="flex gap-3 mb-10">
          {SCORE_PER_CLUE.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-white font-black text-lg">{s}</div>
              <div className="text-white/50 text-xs">힌트{i + 1}</div>
            </div>
          ))}
        </div>
        <button
          onClick={start}
          className="w-full max-w-xs bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          게임 시작! 🍷
        </button>
        <button onClick={() => router.push('/')} className="mt-4 text-white/50 text-sm">홈으로</button>
      </div>
    );
  }

  if (done) {
    const maxScore = ROUNDS * 500;
    const pct = Math.round((totalScore / maxScore) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#1A0A2E]">
        <div className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🎓'}</div>
        <h1 className="text-3xl font-black text-white mb-1">
          {pct >= 80 ? '소믈리에급!' : pct >= 50 ? '와인 러버!' : '공부 중!'}
        </h1>
        <p className="text-white/60 mb-6">{ROUNDS}라운드 결과</p>
        <div className="bg-white/10 rounded-2xl p-5 w-full max-w-sm mb-6">
          <div className="text-4xl font-black text-[#D4A017] text-center mb-1">{totalScore}</div>
          <div className="text-white/60 text-center text-sm mb-4">/ {maxScore} 점</div>
          <div className="flex flex-col gap-2">
            {roundResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{r.correct ? '✅' : '❌'}</span>
                <span className="text-white text-sm flex-1 truncate">{r.wine.nameKo}</span>
                <span className="text-[#D4A017] font-black text-sm">+{r.score}</span>
                <span className="text-white/40 text-xs">(힌트{r.cluesUsed})</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={start}
          className="w-full max-w-xs bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mb-3"
        >
          다시 도전! 🔄
        </button>
        <button onClick={() => router.push('/')} className="text-white/50 text-sm">홈으로</button>
      </div>
    );
  }

  if (!wine) return null;

  const colorHex = COLOR_HEX[wine.color] ?? '#888';
  const currentScore = SCORE_PER_CLUE[clueIndex] ?? 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#1A0A2E]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => router.push('/')} className="text-white/60 text-xl">✕</button>
        <div className="text-white/80 text-sm font-bold">라운드 {round}/{ROUNDS}</div>
        <div className="text-[#D4A017] font-black">🏅 {totalScore}점</div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-2">
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < round - 1 ? 'bg-[#D4A017]' : i === round - 1 ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>

      {/* Wine glass */}
      <div className="flex flex-col items-center py-4">
        <WineGlass color={colorHex} revealed={clueIndex >= 0} />
        <div className="mt-2 text-white/60 text-sm text-center">
          {answered ? (
            <div>
              <span className="text-[#D4A017] font-black">{wine.nameKo}</span>
              <div className="text-white/40 text-xs italic mt-0.5">{wine.name}</div>
            </div>
          ) : (
            `힌트 ${clueIndex + 1}/${clues.length} · 정답 시 ${currentScore}점`
          )}
        </div>
      </div>

      {/* Clues */}
      <div className="flex-1 px-4">
        <div className="flex flex-col gap-2 mb-4">
          {clues.slice(0, clueIndex + 1).map((clue, i) => (
            <div key={i} className={`bg-white/10 rounded-2xl p-3 flex gap-3 ${i === clueIndex && !answered ? 'ring-1 ring-white/30' : ''}`}>
              <span className="text-xl">{clue.icon}</span>
              <div>
                <div className="text-white/50 text-xs font-bold mb-0.5">{clue.label}</div>
                <div className="text-white text-sm leading-relaxed">{clue.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Choices */}
        {!answered && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {choices.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`p-3 rounded-xl text-left text-sm font-bold transition-all active:scale-95 border ${
                  selected === c.id
                    ? 'border-[#D4A017] bg-[#D4A017]/20 text-[#D4A017]'
                    : 'border-white/20 bg-white/5 text-white/80'
                }`}
              >
                {c.nameKo}
              </button>
            ))}
          </div>
        )}

        {/* Correct/Wrong feedback */}
        {answered && (
          <div className={`rounded-2xl p-4 mb-4 ${selected === wine.id ? 'bg-[#58CC02]/20 border border-[#58CC02]/40' : 'bg-red-500/20 border border-red-500/40'}`}>
            <div className="font-black text-white text-base mb-1">
              {selected === wine.id ? `🎉 정답! +${SCORE_PER_CLUE[clueIndex]}점` : '❌ 틀렸어요'}
            </div>
            <div className="text-white/70 text-sm">
              정답: <span className="font-bold text-white">{wine.nameKo}</span>
              <span className="text-white/50 italic text-xs ml-1">({wine.name})</span>
            </div>
            <div className="text-white/50 text-xs mt-1">{wine.region} · {wine.grapes.join(', ')}</div>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="px-4 pb-8 flex gap-3">
        {!answered && (
          <>
            {clueIndex < clues.length - 1 && (
              <button
                onClick={() => setClueIndex((i) => i + 1)}
                className="flex-1 border border-white/30 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95"
              >
                다음 힌트 (-{SCORE_PER_CLUE[clueIndex] - SCORE_PER_CLUE[clueIndex + 1]}점)
              </button>
            )}
            <button
              onClick={handleGuess}
              disabled={!selected}
              className={`flex-1 font-black py-3.5 rounded-2xl text-sm active:scale-95 transition-all ${
                selected ? 'bg-gradient-to-r from-[#D4A017] to-[#F0C060] text-white shadow-lg' : 'bg-white/10 text-white/30'
              }`}
            >
              정답 확인!
            </button>
          </>
        )}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black py-3.5 rounded-2xl active:scale-95"
          >
            {round >= ROUNDS ? '결과 보기 🏆' : '다음 와인 →'}
          </button>
        )}
      </div>
    </div>
  );
}
