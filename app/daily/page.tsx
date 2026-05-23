'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { allQuizQuestions } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';
import WineMascot from '@/components/WineMascot';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getDailyQuestions() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rand = seededRandom(seed);
  const shuffled = [...allQuizQuestions].sort(() => rand() - 0.5);
  return shuffled.slice(0, 10);
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="h-3 bg-[#F0E0E8] rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#D4A017] to-[#F0C060]"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

export default function DailyPage() {
  const router = useRouter();
  const { progress, isDailyCompleted, completeDaily } = useProgress();
  const questions = useMemo(() => getDailyQuestions(), []);

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [hearts, setHearts] = useState(progress.hearts);

  if (isDailyCompleted && !done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF5EE]">
        <WineMascot expression="happy" size={130} className="mb-4" />
        <h1 className="text-2xl font-black text-[#1A0A10] mb-2">오늘은 완료했어요!</h1>
        <p className="text-[#6B4050] text-center mb-8">내일 다시 도전해요. 스트릭을 유지하세요! 🔥</p>
        <div className="bg-white rounded-2xl px-8 py-4 shadow-sm border border-[#F0E0E8] mb-8 text-center">
          <div className="text-3xl font-black text-[#FF9600]">{progress.streak}일</div>
          <div className="text-sm text-[#6B4050] font-bold">현재 스트릭 🔥</div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="w-full max-w-xs bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          홈으로 가기 🏠
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF5EE]">
        <div className="animate-bounce-in">
          <WineMascot expression="excited" size={140} />
        </div>
        <div className="text-5xl mb-2">⚡</div>
        <h1 className="text-3xl font-black text-[#1A0A10] mb-2">오늘의 테스트</h1>
        <p className="text-[#6B4050] text-center mb-3">
          매일 바뀌는 10문제로 실력을 확인해요!
        </p>
        <div className="flex gap-3 mb-10">
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#F0E0E8] text-center">
            <div className="font-black text-[#8B1A4A]">10</div>
            <div className="text-xs text-[#6B4050]">문제</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#F0E0E8] text-center">
            <div className="font-black text-[#D4A017]">+100</div>
            <div className="text-xs text-[#6B4050]">XP</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-[#F0E0E8] text-center">
            <div className="font-black text-[#FF9600]">🔥</div>
            <div className="text-xs text-[#6B4050]">스트릭</div>
          </div>
        </div>
        <button
          onClick={() => setStarted(true)}
          className="w-full max-w-xs bg-gradient-to-r from-[#D4A017] to-[#F0C060] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          시작하기 ⚡
        </button>
        <button onClick={() => router.push('/')} className="mt-4 text-[#6B4050] text-sm underline">
          나중에 할게요
        </button>
      </div>
    );
  }

  if (done) {
    const xpEarned = correctCount * 8 + (correctCount === 10 ? 20 : 0) + 20;
    const isPerfect = correctCount === 10;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF5EE]">
        <div className="animate-bounce-in">
          <WineMascot expression={isPerfect ? 'celebrating' : correctCount >= 7 ? 'happy' : 'thinking'} size={140} />
        </div>
        <h1 className="text-3xl font-black text-[#1A0A10] mt-4 mb-2">
          {isPerfect ? '완벽해요! 🎉' : correctCount >= 7 ? '훌륭해요! 👍' : '오늘도 배웠어요!'}
        </h1>
        <p className="text-[#6B4050] mb-6">10문제 중 {correctCount}문제 정답</p>
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-2xl px-6 py-4 text-center shadow-sm border border-[#F0E0E8]">
            <div className="text-3xl font-black text-[#D4A017]">+{xpEarned}</div>
            <div className="text-xs text-[#6B4050] font-bold">XP 획득</div>
          </div>
          <div className="bg-white rounded-2xl px-6 py-4 text-center shadow-sm border border-[#F0E0E8]">
            <div className="text-3xl font-black text-[#FF9600]">{progress.streak + 1}일</div>
            <div className="text-xs text-[#6B4050] font-bold">연속 🔥</div>
          </div>
        </div>
        {isPerfect && (
          <div className="bg-gradient-to-r from-[#D4A017] to-[#F0C060] text-white font-black text-sm px-5 py-2.5 rounded-full mb-6">
            🏆 퍼펙트!
          </div>
        )}
        <button
          onClick={() => router.push('/')}
          className="w-full max-w-xs bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          홈으로 가기 🏠
        </button>
      </div>
    );
  }

  const q = questions[index];

  const handleAnswer = () => {
    if (selected === null) return;
    const isCorrect = selected === q.correct;
    setAnswered(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setIsWrong(true);
      setHearts((h) => Math.max(0, h - 1));
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  const handleNext = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const earned = correctCount * 8 + (correctCount === 10 ? 20 : 0) + 20;
      completeDaily(earned);
      setDone(true);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#FBF5EE] ${isWrong ? 'animate-shake' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B4050] hover:bg-[#F0E0E8] transition-colors text-xl"
        >
          ✕
        </button>
        <ProgressBar current={index} total={questions.length} />
        <div className="flex items-center gap-1">
          <span>❤️</span>
          <span className="font-black text-[#FF4B4B] text-sm">{hearts}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-[#D4A017] bg-[#FFF3CD] px-3 py-1 rounded-full">
            ⚡ 데일리 {index + 1}/{questions.length}
          </span>
          <span className="text-xs text-[#6B4050]">from: {q.lessonTitle}</span>
        </div>
        <p className="text-xl font-black text-[#1A0A10] leading-tight mb-6">{q.question}</p>
        <div className="flex flex-col gap-3">
          {q.choices.map((choice, i) => {
            let style =
              'w-full text-left px-5 py-4 rounded-2xl font-bold text-base border-2 transition-all active:scale-95';
            if (!answered) {
              style +=
                selected === i
                  ? ' border-[#D4A017] bg-[#FFF8E0] text-[#8B6000]'
                  : ' border-[#E8D0DC] bg-white text-[#1A0A10]';
            } else {
              if (i === q.correct) style += ' border-[#58CC02] bg-[#E8F9DC] text-[#2B7A06]';
              else if (selected === i) style += ' border-[#FF4B4B] bg-[#FFE8E8] text-[#CC0000]';
              else style += ' border-[#E8D0DC] bg-white text-[#6B4050] opacity-50';
            }
            return (
              <button key={i} className={style} onClick={() => !answered && setSelected(i)} disabled={answered}>
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {answered ? (
        <div
          className={`px-4 py-4 rounded-t-3xl animate-pop-up ${
            selected === q.correct ? 'bg-[#D7F0B8]' : 'bg-[#FFE0E0]'
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{selected === q.correct ? '✅' : '❌'}</span>
            <div>
              <div className={`font-black text-base ${selected === q.correct ? 'text-[#2B7A06]' : 'text-[#CC0000]'}`}>
                {selected === q.correct ? '정답이에요!' : '틀렸어요!'}
              </div>
              <div className="text-sm text-[#4A2030] mt-0.5">{q.explanation}</div>
            </div>
          </div>
          <button
            onClick={handleNext}
            className={`w-full font-black text-lg py-3.5 rounded-2xl text-white active:scale-95 transition-transform ${
              selected === q.correct ? 'bg-[#58CC02]' : 'bg-[#FF4B4B]'
            }`}
          >
            {index < questions.length - 1 ? '계속하기 →' : '결과 보기 🎉'}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-8">
          <button
            onClick={handleAnswer}
            disabled={selected === null}
            className={`w-full font-black text-lg py-4 rounded-2xl transition-all ${
              selected !== null
                ? 'bg-gradient-to-r from-[#D4A017] to-[#F0C060] text-white shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            확인하기
          </button>
        </div>
      )}
    </div>
  );
}
