'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lessons } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';
import WineMascot from '@/components/WineMascot';

type Stage = 'intro' | 'cards' | 'quiz' | 'result';

function ProgressBar({ current, total, color = '#8B1A4A' }: { current: number; total: number; color?: string }) {
  return (
    <div className="h-3 bg-[#F0E0E8] rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}BB)` }}
      />
    </div>
  );
}

function Header({
  onClose,
  current,
  total,
  hearts,
}: {
  onClose: () => void;
  current: number;
  total: number;
  hearts: number;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
      <button
        onClick={onClose}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B4050] hover:bg-[#F0E0E8] transition-colors text-xl"
      >
        ✕
      </button>
      <ProgressBar current={current} total={total} />
      <div className="flex items-center gap-1">
        <span className="text-base">❤️</span>
        <span className="font-black text-[#FF4B4B] text-sm">{hearts}</span>
      </div>
    </div>
  );
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { progress, completeLesson } = useProgress();

  const lesson = lessons.find((l) => l.id === id);
  const [stage, setStage] = useState<Stage>('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [hearts, setHearts] = useState(progress.hearts);
  const [xpEarned, setXpEarned] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setHearts(progress.hearts);
  }, [progress.hearts]);

  if (!lesson) {
    return <div className="flex items-center justify-center min-h-screen text-[#6B4050]">레슨을 찾을 수 없어요 😢</div>;
  }

  const totalSteps = lesson.cards.length + lesson.quiz.length;
  const currentStep = stage === 'cards' ? cardIndex : stage === 'quiz' ? lesson.cards.length + quizIndex : 0;

  const handleAnswer = () => {
    if (selected === null) return;
    const q = lesson.quiz[quizIndex];
    const isCorrect = selected === q.correct;
    setAnswered(true);
    setShowFeedback(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setIsWrong(true);
      setHearts((h) => Math.max(0, h - 1));
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setAnswered(false);
    setShowFeedback(false);
    if (quizIndex < lesson.quiz.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      const earned = correctCount * 10 + (correctCount === lesson.quiz.length ? 20 : 0) + 20;
      setXpEarned(earned);
      completeLesson(lesson.id, earned);
      setStage('result');
    }
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF5EE]">
        <div className="animate-bounce-in mb-4">
          <WineMascot expression="excited" size={140} />
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${lesson.color}, ${lesson.color}88)` }}
        >
          {lesson.emoji}
        </div>
        <h1 className="text-3xl font-black text-[#1A0A10] text-center mb-2">{lesson.title}</h1>
        <p className="text-[#6B4050] text-center mb-2">{lesson.description}</p>
        <p className="text-sm text-[#8B1A4A] font-bold mb-10">
          📖 {lesson.cards.length}개 카드 · 🧠 {lesson.quiz.length}문제 · ⭐ {lesson.xp} XP
        </p>
        <button
          onClick={() => setStage('cards')}
          className="w-full max-w-xs bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          시작하기! 🍷
        </button>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-[#6B4050] text-sm font-medium underline"
        >
          나중에 할게요
        </button>
      </div>
    );
  }

  if (stage === 'cards') {
    const card = lesson.cards[cardIndex];
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF5EE]">
        <Header onClose={() => router.push('/')} current={cardIndex} total={totalSteps} hearts={hearts} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
          <div className="text-xs font-bold text-[#8B1A4A] bg-[#F0E0E8] px-3 py-1 rounded-full mb-6">
            카드 {cardIndex + 1} / {lesson.cards.length}
          </div>
          <div
            key={cardIndex}
            className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-[#F0E0E8] animate-bounce-in"
          >
            <div className="text-6xl text-center mb-4">{card.emoji}</div>
            <h2 className="text-xl font-black text-[#1A0A10] text-center mb-4">{card.title}</h2>
            <p className="text-[#4A2030] text-center leading-relaxed">{card.content}</p>
          </div>
        </div>
        <div className="px-4 pb-8">
          <button
            onClick={() => {
              if (cardIndex < lesson.cards.length - 1) {
                setCardIndex((i) => i + 1);
              } else {
                setStage('quiz');
              }
            }}
            className="w-full bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            {cardIndex < lesson.cards.length - 1 ? '다음 →' : '퀴즈 시작! 🧠'}
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'quiz') {
    const q = lesson.quiz[quizIndex];
    return (
      <div className={`min-h-screen flex flex-col bg-[#FBF5EE] ${isWrong ? 'animate-shake' : ''}`}>
        <Header onClose={() => router.push('/')} current={currentStep} total={totalSteps} hearts={hearts} />
        <div className="flex-1 flex flex-col px-4 py-4">
          <div className="text-xs font-bold text-[#8B1A4A] bg-[#F0E0E8] px-3 py-1 rounded-full mb-5 self-start">
            문제 {quizIndex + 1} / {lesson.quiz.length}
          </div>
          <p className="text-xl font-black text-[#1A0A10] leading-tight mb-6">{q.question}</p>
          <div className="flex flex-col gap-3">
            {q.choices.map((choice, i) => {
              let style =
                'w-full text-left px-5 py-4 rounded-2xl font-bold text-base border-2 transition-all active:scale-95';
              if (!answered) {
                style +=
                  selected === i
                    ? ' border-[#8B1A4A] bg-[#F8E8F0] text-[#8B1A4A]'
                    : ' border-[#E8D0DC] bg-white text-[#1A0A10] hover:border-[#C44B7A]';
              } else {
                if (i === q.correct) {
                  style += ' border-[#58CC02] bg-[#E8F9DC] text-[#2B7A06]';
                } else if (selected === i) {
                  style += ' border-[#FF4B4B] bg-[#FFE8E8] text-[#CC0000]';
                } else {
                  style += ' border-[#E8D0DC] bg-white text-[#6B4050] opacity-50';
                }
              }
              return (
                <button
                  key={i}
                  className={style}
                  onClick={() => !answered && setSelected(i)}
                  disabled={answered}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback banner */}
        {showFeedback && (
          <div
            className={`px-4 py-4 rounded-t-3xl animate-pop-up ${
              selected === q.correct ? 'bg-[#D7F0B8]' : 'bg-[#FFE0E0]'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{selected === q.correct ? '✅' : '❌'}</span>
              <div>
                <div
                  className={`font-black text-base ${
                    selected === q.correct ? 'text-[#2B7A06]' : 'text-[#CC0000]'
                  }`}
                >
                  {selected === q.correct ? '정답이에요!' : '틀렸어요!'}
                </div>
                <div className="text-sm text-[#4A2030] mt-0.5">{q.explanation}</div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`w-full font-black text-lg py-3.5 rounded-2xl text-white active:scale-95 transition-transform ${
                selected === q.correct
                  ? 'bg-[#58CC02]'
                  : 'bg-[#FF4B4B]'
              }`}
            >
              계속하기 →
            </button>
          </div>
        )}

        {/* Check button */}
        {!showFeedback && (
          <div className="px-4 pb-8">
            <button
              onClick={handleAnswer}
              disabled={selected === null}
              className={`w-full font-black text-lg py-4 rounded-2xl transition-all ${
                selected !== null
                  ? 'bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white shadow-lg active:scale-95'
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

  // Result
  const isPerfect = correctCount === lesson.quiz.length;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF5EE]">
      <div className="animate-bounce-in">
        <WineMascot expression={isPerfect ? 'celebrating' : correctCount >= 3 ? 'happy' : 'thinking'} size={140} />
      </div>
      <h1 className="text-3xl font-black text-[#1A0A10] mt-4 mb-2">
        {isPerfect ? '완벽해요! 🎉' : correctCount >= 3 ? '잘 했어요! 👍' : '다음엔 더 잘 할 수 있어요!'}
      </h1>
      <p className="text-[#6B4050] mb-6">
        {lesson.quiz.length}문제 중 {correctCount}문제 정답
      </p>
      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-2xl px-6 py-4 text-center shadow-sm border border-[#F0E0E8]">
          <div className="text-3xl font-black text-[#D4A017]">+{xpEarned}</div>
          <div className="text-xs text-[#6B4050] font-bold">XP 획득</div>
        </div>
        <div className="bg-white rounded-2xl px-6 py-4 text-center shadow-sm border border-[#F0E0E8]">
          <div className="text-3xl font-black text-[#8B1A4A]">{Math.round((correctCount / lesson.quiz.length) * 100)}%</div>
          <div className="text-xs text-[#6B4050] font-bold">정답률</div>
        </div>
      </div>
      {isPerfect && (
        <div className="bg-gradient-to-r from-[#D4A017] to-[#F0C060] text-white font-black text-sm px-5 py-2.5 rounded-full mb-6 shadow-md">
          🏆 퍼펙트 클리어!
        </div>
      )}
      <button
        onClick={() => router.push('/')}
        className="w-full max-w-xs bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
      >
        홈으로 돌아가기 🏠
      </button>
      {!isPerfect && (
        <button
          onClick={() => {
            setStage('intro');
            setCardIndex(0);
            setQuizIndex(0);
            setSelected(null);
            setAnswered(false);
            setCorrectCount(0);
            setShowFeedback(false);
          }}
          className="mt-4 text-[#8B1A4A] font-bold text-sm underline"
        >
          다시 도전하기 🔄
        </button>
      )}
    </div>
  );
}
