'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import WineMascot from '@/components/WineMascot';
import { lessons } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';

function XPBar({ xp }: { xp: number }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-bold text-[#8B1A4A] w-12">Lv.{level}</div>
      <div className="flex-1 h-3 bg-[#F0E0E8] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-sm font-bold text-[#8B1A4A] w-16 text-right">{xp} XP</div>
    </div>
  );
}

function LessonNode({
  lesson,
  status,
  index,
}: {
  lesson: (typeof lessons)[0];
  status: 'completed' | 'available' | 'locked';
  index: number;
}) {
  const isLeft = index % 2 === 0;

  const nodeContent = (
    <div className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="relative flex-shrink-0">
        {status === 'completed' ? (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-md text-3xl border-4 border-white"
            style={{ background: `linear-gradient(135deg, ${lesson.color}88, ${lesson.color}44)` }}
          >
            ✅
          </div>
        ) : status === 'available' ? (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl text-4xl border-4 border-white"
            style={{ background: `linear-gradient(135deg, ${lesson.color}, ${lesson.color}BB)` }}
          >
            {lesson.emoji}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-gray-100 border-4 border-gray-200">
            🔒
          </div>
        )}
        {status === 'available' && (
          <div className="absolute -top-2 -right-2 bg-[#D4A017] text-white text-xs font-black px-2 py-0.5 rounded-full shadow animate-bounce">
            GO!
          </div>
        )}
      </div>

      <div
        className={`flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#F0E0E8] ${
          status === 'locked' ? 'opacity-40' : ''
        }`}
      >
        <div className="font-black text-base text-[#1A0A10]">{lesson.title}</div>
        <div className="text-xs text-[#6B4050] mt-0.5">{lesson.description}</div>
        <div
          className="flex items-center gap-1 mt-1.5 text-xs font-bold text-[#D4A017]"
          style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
        >
          <span>⭐</span>
          <span>{lesson.xp} XP</span>
          {status === 'completed' && <span className="text-green-500 ml-1">완료!</span>}
        </div>
      </div>
    </div>
  );

  if (status === 'locked') return <div className="cursor-not-allowed select-none">{nodeContent}</div>;

  return (
    <Link href={`/lesson/${lesson.id}`} className="block active:scale-95 transition-transform duration-100">
      {nodeContent}
    </Link>
  );
}

export default function Home() {
  const { progress, loaded, isDailyCompleted } = useProgress();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded) setTimeout(() => setReady(true), 100);
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-5xl animate-spin">🍷</div>
      </div>
    );
  }

  const completedCount = progress.completedLessons.length;
  const greeting =
    completedCount === 0
      ? '안녕하세요! 와인 여행을 시작해볼까요? 🍷'
      : `반가워요! ${progress.streak}일째 공부 중이에요 🔥`;

  return (
    <main className="pb-safe pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-[#8B1A4A]">Vino 🍷</h1>
          <p className="text-xs text-[#6B4050]">와인을 배워요</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm border border-[#F0E0E8]">
            <span>🔥</span>
            <span className="font-black text-[#FF9600] text-sm">{progress.streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm border border-[#F0E0E8]">
            <span>❤️</span>
            <span className="font-black text-[#FF4B4B] text-sm">{progress.hearts}</span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      {ready && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E0E8] mb-4 animate-pop-up">
          <XPBar xp={progress.xp} />
        </div>
      )}

      {/* Mascot + Greeting */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#F0E0E8] mb-4 flex items-center gap-4">
        <WineMascot expression={completedCount > 0 ? 'happy' : 'excited'} size={72} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1A0A10] text-sm leading-relaxed">{greeting}</p>
          <p className="text-xs text-[#6B4050] mt-1">
            {completedCount}/{lessons.length} 레슨 완료
          </p>
          <div className="h-2 bg-[#F0E0E8] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / lessons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <Link href="/daily">
        <div
          className={`rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-md active:scale-95 transition-all duration-100 ${
            isDailyCompleted
              ? 'bg-gray-100 border border-gray-200'
              : 'bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A]'
          }`}
        >
          <span className="text-3xl">{isDailyCompleted ? '✅' : '⚡'}</span>
          <div>
            <div className={`font-black text-base ${isDailyCompleted ? 'text-gray-500' : 'text-white'}`}>
              {isDailyCompleted ? '오늘의 테스트 완료!' : '오늘의 테스트'}
            </div>
            <div className={`text-xs ${isDailyCompleted ? 'text-gray-400' : 'text-white/80'}`}>
              {isDailyCompleted ? '내일 다시 도전해요' : '매일 10문제 · +100 XP'}
            </div>
          </div>
          {!isDailyCompleted && (
            <span className="ml-auto text-white font-black text-sm">시작 →</span>
          )}
        </div>
      </Link>

      {/* Lesson Map */}
      <h2 className="font-black text-base text-[#1A0A10] mb-4">📚 레슨 맵</h2>
      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const prevDone = i === 0 || progress.completedLessons.includes(lessons[i - 1].id);
          const status = isCompleted ? 'completed' : prevDone ? 'available' : 'locked';
          return (
            <div key={lesson.id}>
              {i > 0 && (
                <div className="flex justify-center py-1">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full mx-0.5"
                      style={{ background: prevDone ? '#D4A017' : '#D1D5DB' }}
                    />
                  ))}
                </div>
              )}
              <LessonNode lesson={lesson} status={status} index={i} />
            </div>
          );
        })}
      </div>

      <div className="h-4" />
    </main>
  );
}
