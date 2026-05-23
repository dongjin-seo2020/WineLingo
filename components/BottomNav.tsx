'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/daily', label: '데일리', icon: '⚡' },
  { href: '/profile', label: '프로필', icon: '📊' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F0E0E8]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all ${
                active ? 'text-[#8B1A4A]' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className={`text-xs font-bold ${active ? 'text-[#8B1A4A]' : 'text-gray-400'}`}>{label}</span>
              {active && <div className="h-1 w-6 rounded-full bg-[#8B1A4A] mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
