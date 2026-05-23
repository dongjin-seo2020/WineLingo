'use client';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/hooks/useProgress';
import { lessons } from '@/data/lessons';
import WineMascot from '@/components/WineMascot';

const BADGES = [
  { id: 'first_lesson', emoji: '🎓', name: '첫 레슨', desc: '첫 번째 레슨 완료', req: (c: number) => c >= 1 },
  { id: 'half_done', emoji: '🍾', name: '반환점', desc: '5개 레슨 완료', req: (c: number) => c >= 5 },
  { id: 'all_done', emoji: '🏆', name: '소믈리에', desc: '모든 레슨 완료', req: (c: number) => c >= 10 },
  { id: 'streak3', emoji: '🔥', name: '3일 연속', desc: '3일 스트릭 달성', req: (_: number, s: number) => s >= 3 },
  { id: 'streak7', emoji: '⚡', name: '7일 연속', desc: '7일 스트릭 달성', req: (_: number, s: number) => s >= 7 },
  { id: 'xp100', emoji: '⭐', name: '100 XP', desc: '100 XP 달성', req: (_: number, __: number, xp: number) => xp >= 100 },
];

export default function ProfilePage() {
  const { progress } = useProgress();
  const router = useRouter();
  const completedCount = progress.completedLessons.length;
  const level = Math.floor(progress.xp / 100) + 1;
  const xpInLevel = progress.xp % 100;

  return (
    <main className="pb-safe pt-4 px-4">
      <h1 className="text-2xl font-black text-[#8B1A4A] mb-5">📊 내 프로필</h1>

      {/* Mascot + Level */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F0E0E8] mb-4 flex flex-col items-center">
        <WineMascot
          expression={completedCount === 10 ? 'celebrating' : completedCount > 5 ? 'excited' : 'happy'}
          size={100}
        />
        <div className="mt-3 text-center">
          <div className="font-black text-xl text-[#1A0A10]">와인 학습자</div>
          <div className="text-sm text-[#6B4050]">레벨 {level} · {progress.xp} XP</div>
        </div>
        <div className="w-full mt-3">
          <div className="flex justify-between text-xs font-bold text-[#8B1A4A] mb-1">
            <span>Lv.{level}</span>
            <span>{xpInLevel}/100 XP</span>
          </div>
          <div className="h-3 bg-[#F0E0E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] rounded-full transition-all"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: '🔥', value: progress.streak, label: '스트릭' },
          { icon: '📚', value: completedCount, label: '완료 레슨' },
          { icon: '❤️', value: progress.hearts, label: '하트' },
        ].map(({ icon, value, label }) => (
          <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-[#F0E0E8] text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-black text-xl text-[#1A0A10]">{value}</div>
            <div className="text-xs text-[#6B4050]">{label}</div>
          </div>
        ))}
      </div>

      {/* Completed Lessons */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E0E8] mb-4">
        <h2 className="font-black text-base text-[#1A0A10] mb-3">📖 완료한 레슨</h2>
        {completedCount === 0 ? (
          <p className="text-sm text-[#6B4050] text-center py-3">아직 완료한 레슨이 없어요. 시작해봐요!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lessons
              .filter((l) => progress.completedLessons.includes(l.id))
              .map((l) => (
                <div key={l.id} className="flex items-center gap-2">
                  <span className="text-xl">{l.emoji}</span>
                  <span className="font-bold text-sm text-[#1A0A10]">{l.title}</span>
                  <span className="ml-auto text-xs text-green-500 font-bold">✅ 완료</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E0E8] mb-4">
        <h2 className="font-black text-base text-[#1A0A10] mb-3">🏅 배지</h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = badge.req(completedCount, progress.streak, progress.xp);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-3 text-center border ${
                  earned ? 'bg-[#FFF8E0] border-[#D4A017]' : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-3xl mb-1">{badge.emoji}</div>
                <div className={`text-xs font-black ${earned ? 'text-[#8B6000]' : 'text-gray-400'}`}>{badge.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{badge.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('진도를 초기화할까요? 이 작업은 되돌릴 수 없어요.')) {
            localStorage.removeItem('wine-progress');
            router.push('/');
          }
        }}
        className="w-full py-3 rounded-2xl border-2 border-[#F0E0E8] text-[#6B4050] text-sm font-bold mb-4"
      >
        진도 초기화
      </button>
    </main>
  );
}
