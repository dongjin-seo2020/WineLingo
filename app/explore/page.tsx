'use client';
import { useState, useEffect, useRef } from 'react';
import { wineDatabase, regionGroups, aromaCategories, DIFFICULTY_INFO, type WineEntry, type Difficulty } from '@/data/wineDatabase';

const COLOR_MAP: Record<string, string> = {
  red: '#8B1A1A',
  white: '#C4A44A',
  rosé: '#E8728A',
  sparkling: '#4A8BC4',
  dessert: '#C48A1A',
  orange: '#C46A1A',
};
const COLOR_LABEL: Record<string, string> = {
  red: '레드', white: '화이트', rosé: '로제', sparkling: '스파클링', dessert: '디저트', orange: '오렌지',
};
const BODY_LABEL: Record<string, string> = {
  light: '라이트', 'medium-light': '미디엄-라이트', medium: '미디엄', 'medium-full': '미디엄-풀', full: '풀 바디',
};
const LEVEL_LABEL: Record<string, string> = {
  low: '낮음', 'medium-low': '낮은 편', medium: '중간', 'medium-high': '높은 편', high: '높음',
};

function PriceTag({ n }: { n: number }) {
  return (
    <span className="text-xs font-bold">
      {'$'.repeat(n)}<span className="opacity-30">{'$'.repeat(4 - n)}</span>
    </span>
  );
}

function WineDetailModal({ wine, onClose }: { wine: WineEntry; onClose: () => void }) {
  const accentColor = COLOR_MAP[wine.color];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div
        className="bg-[#FBF5EE] w-full max-w-lg mx-auto rounded-t-3xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 rounded-t-3xl px-5 pt-4 pb-3" style={{ background: accentColor }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/80 text-sm">{wine.countryEmoji} {wine.country}</span>
                <span className="text-white/60 text-xs">·</span>
                <span className="text-white/80 text-xs">{COLOR_LABEL[wine.color]}</span>
              </div>
              <h2 className="text-white font-black text-xl leading-tight">{wine.nameKo}</h2>
              <p className="text-white/80 text-sm italic mt-0.5">{wine.name}</p>
              <p className="text-white/60 text-xs mt-0.5">{wine.subRegion}</p>
            </div>
            <button onClick={onClose} className="text-white/80 text-2xl ml-3 mt-1">✕</button>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {BODY_LABEL[wine.body]}
            </span>
            {wine.tannin && (
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                타닌: {LEVEL_LABEL[wine.tannin]}
              </span>
            )}
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              산도: {LEVEL_LABEL[wine.acidity]}
            </span>
            <span className="bg-white/90 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ color: DIFFICULTY_INFO[wine.difficulty].color }}
            >
              {DIFFICULTY_INFO[wine.difficulty].emoji} {DIFFICULTY_INFO[wine.difficulty].label}
            </span>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5">
          {/* Grapes */}
          <div>
            <div className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2">🍇 포도 품종</div>
            <div className="flex flex-wrap gap-2">
              {wine.grapes.map((g) => (
                <span key={g} className="bg-white border border-[#E8D0DC] text-[#8B1A4A] font-bold text-sm px-3 py-1 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2">📖 설명</div>
            <p className="text-[#1A0A10] text-sm leading-relaxed">{wine.description}</p>
          </div>

          {/* Aromas */}
          <div>
            <div className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2">👃 아로마 프로파일</div>
            <div className="flex flex-col gap-2">
              {[
                { label: '1차 (과일/꽃)', items: wine.aromas.primary },
                { label: '2차 (발효)', items: wine.aromas.secondary },
                { label: '3차 (오크/숙성)', items: wine.aromas.tertiary },
              ].map(({ label, items }) => items.length > 0 && (
                <div key={label}>
                  <span className="text-xs text-[#6B4050] font-bold">{label}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {items.map((a) => (
                      <span key={a} className="bg-[#F0E0E8] text-[#8B1A4A] text-xs font-bold px-2.5 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '🌡️ 서빙 온도', value: wine.servingTemp },
              { label: '⏳ 숙성 가능', value: wine.agingPotential },
              { label: '💰 가격대', value: null, component: <PriceTag n={wine.priceRange} /> },
              { label: '😋 단계', value: BODY_LABEL[wine.body] },
            ].map(({ label, value, component }) => (
              <div key={label} className="bg-white rounded-xl p-3 border border-[#F0E0E8]">
                <div className="text-xs text-[#6B4050] mb-1">{label}</div>
                {component ?? <div className="font-bold text-[#1A0A10] text-sm">{value}</div>}
              </div>
            ))}
          </div>

          {/* Food Pairings */}
          <div>
            <div className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2">🍽️ 음식 페어링</div>
            <div className="flex flex-wrap gap-2">
              {wine.foodPairings.map((f) => (
                <span key={f} className="bg-white border border-[#E8D0DC] text-[#1A0A10] text-sm px-3 py-1 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Key Wineries */}
          <div>
            <div className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2">🏰 주요 생산자</div>
            <div className="flex flex-col gap-1">
              {wine.keyWineries.map((w) => (
                <div key={w} className="text-sm text-[#1A0A10] font-medium">· {w}</div>
              ))}
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-[#FFF8E0] rounded-2xl p-4 border border-[#F0C060]">
            <div className="text-xs font-black text-[#8B6000] mb-1">💡 알고 계셨나요?</div>
            <p className="text-sm text-[#4A3000] leading-relaxed">{wine.funFact}</p>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

function WineCard({ wine, onPress }: { wine: WineEntry; onPress: () => void }) {
  const accentColor = COLOR_MAP[wine.color];
  return (
    <button
      onClick={onPress}
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E0E8] text-left active:scale-95 transition-transform w-full"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg shadow-sm"
          style={{ background: accentColor }}
        >
          {wine.countryEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm text-[#1A0A10] leading-tight truncate">{wine.nameKo}</div>
          <div className="text-xs text-[#9B7080] italic truncate">{wine.name}</div>
          <div className="text-xs text-[#6B4050] mt-0.5">{wine.subRegion}</div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: accentColor }}>
              {COLOR_LABEL[wine.color]}
            </span>
            {wine.grapes.slice(0, 2).map((g) => (
              <span key={g} className="text-xs text-[#8B1A4A] bg-[#F0E0E8] px-2 py-0.5 rounded-full font-medium">
                {g}
              </span>
            ))}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: DIFFICULTY_INFO[wine.difficulty].color, background: DIFFICULTY_INFO[wine.difficulty].bg }}
            >
              {DIFFICULTY_INFO[wine.difficulty].emoji} {DIFFICULTY_INFO[wine.difficulty].label}
            </span>
          </div>
        </div>
        <span className="text-[#6B4050] text-lg">›</span>
      </div>
    </button>
  );
}

// Country pins on globe (SVG viewBox 0 0 240 230, globe center 120,115 r=98)
const GLOBE_PINS = [
  { id: 'france',       emoji: '🇫🇷', label: '프랑스',          x: 104, y: 60 },
  { id: 'italy',        emoji: '🇮🇹', label: '이탈리아',         x: 122, y: 74 },
  { id: 'spain',        emoji: '🇪🇸', label: '스페인',           x: 91,  y: 72 },
  { id: 'portugal',     emoji: '🇵🇹', label: '포르투갈',         x: 78,  y: 78 },
  { id: 'germany',      emoji: '🇩🇪', label: '독일',             x: 116, y: 48 },
  { id: 'austria',      emoji: '🇦🇹', label: '오스트리아',       x: 130, y: 54 },
  { id: 'hungary',      emoji: '🇭🇺', label: '헝가리',           x: 142, y: 58 },
  { id: 'greece',       emoji: '🇬🇷', label: '그리스',           x: 148, y: 76 },
  { id: 'georgia',      emoji: '🇬🇪', label: '조지아',           x: 162, y: 65 },
  { id: 'usa',          emoji: '🇺🇸', label: '미국',             x: 47,  y: 74 },
  { id: 'argentina',    emoji: '🇦🇷', label: '아르헨티나',       x: 68,  y: 158 },
  { id: 'chile',        emoji: '🇨🇱', label: '칠레',             x: 57,  y: 148 },
  { id: 'south-africa', emoji: '🇿🇦', label: '남아프리카공화국', x: 131, y: 165 },
  { id: 'australia',    emoji: '🇦🇺', label: '호주',             x: 183, y: 143 },
  { id: 'newzealand',   emoji: '🇳🇿', label: '뉴질랜드',         x: 196, y: 153 },
];

// Simplified continent paths (all within globe circle cx=120 cy=115 r=98)
const CONTINENTS = [
  // Europe
  'M 100,60 L 115,55 L 130,58 L 142,63 L 146,75 L 140,83 L 126,88 L 112,87 L 103,77 Z',
  // Africa
  'M 110,90 L 138,87 L 150,100 L 152,122 L 145,153 L 128,165 L 114,158 L 105,142 L 104,115 L 108,95 Z',
  // North America
  'M 56,50 L 68,46 L 73,58 L 72,74 L 63,86 L 50,88 L 44,80 L 44,64 L 52,53 Z',
  // South America
  'M 55,97 L 72,93 L 80,110 L 77,134 L 66,160 L 53,165 L 43,152 L 42,132 L 50,108 Z',
  // Australia
  'M 168,140 L 192,137 L 200,150 L 195,162 L 177,168 L 162,158 L 162,145 Z',
  // Asia (partial — Caucasus/Middle East visible)
  'M 155,58 L 175,55 L 185,65 L 180,80 L 165,85 L 152,78 Z',
];

function GlobeRegionPicker({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  const CX = 120, CY = 115, R = 98;
  const meridianRef = useRef<SVGGElement>(null);
  const parallelYs = [50, 68, 85, 102, 120, 138, 155, 172];

  // RAF-driven rotation — directly mutates SVG transform to avoid re-renders
  useEffect(() => {
    let offset = 0;
    let last = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      offset = (offset + (now - last) * 0.004) % 30;
      last = now;
      meridianRef.current?.setAttribute('transform', `translate(${offset.toFixed(2)}, 0)`);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Build meridian x positions: wide enough to always fill the globe during animation
  const meridianXs = Array.from({ length: 22 }, (_, i) => -100 + i * 30);

  const selectedPin = GLOBE_PINS.find(p => p.id === selected);

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox="0 0 240 230"
        className="w-72 h-72"
        style={{ filter: 'drop-shadow(0 8px 28px rgba(14,30,60,0.6))' }}
      >
        <defs>
          <clipPath id="gc">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          {/* Ocean gradient — lit from upper-left */}
          <radialGradient id="og" cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#4A8FCC" />
            <stop offset="45%"  stopColor="#1D5090" />
            <stop offset="100%" stopColor="#081830" />
          </radialGradient>
          {/* Sphere highlight */}
          <radialGradient id="sh" cx="32%" cy="26%" r="55%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
            <stop offset="60%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </radialGradient>
          {/* Land gradient */}
          <radialGradient id="lg" cx="40%" cy="35%" r="70%">
            <stop offset="0%"   stopColor="#6BAA50" />
            <stop offset="100%" stopColor="#3D7030" />
          </radialGradient>
        </defs>

        {/* Ocean base */}
        <circle cx={CX} cy={CY} r={R} fill="url(#og)" />

        <g clipPath="url(#gc)">
          {/* Continents */}
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d}
              fill="url(#lg)"
              stroke="rgba(120,180,90,0.5)"
              strokeWidth="0.8"
            />
          ))}

          {/* Rotating meridians */}
          <g ref={meridianRef}>
            {meridianXs.map(x => (
              <line key={x} x1={x} y1={17} x2={x} y2={213}
                stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            ))}
          </g>

          {/* Static parallels */}
          {parallelYs.map(y => {
            const hw = Math.sqrt(Math.max(0, R * R - (y - CY) ** 2));
            return (
              <line key={y}
                x1={CX - hw} y1={y} x2={CX + hw} y2={y}
                stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* Globe rim */}
        <circle cx={CX} cy={CY} r={R}
          fill="none" stroke="rgba(140,200,255,0.55)" strokeWidth="1.5" />

        {/* Sphere lighting overlay */}
        <circle cx={CX} cy={CY} r={R} fill="url(#sh)" clipPath="url(#gc)" />

        {/* Country pins — rendered on top of globe */}
        {GLOBE_PINS.map(pin => {
          const active = selected === pin.id;
          return (
            <g key={pin.id} onClick={() => onSelect(active ? null : pin.id)} style={{ cursor: 'pointer' }}>
              {active && (
                <circle cx={pin.x} cy={pin.y} r="17"
                  fill="rgba(139,26,74,0.35)"
                  stroke="#E87AB0" strokeWidth="1.5" />
              )}
              <circle cx={pin.x} cy={pin.y} r="13"
                fill={active ? 'rgba(139,26,74,0.92)' : 'rgba(0,0,0,0.62)'}
                stroke={active ? '#F5B0D0' : 'rgba(255,255,255,0.45)'}
                strokeWidth="1.5"
              />
              <text x={pin.x} y={pin.y + 5} textAnchor="middle" fontSize="13">{pin.emoji}</text>
            </g>
          );
        })}
      </svg>
      {selectedPin ? (
        <p className="text-[#8B1A4A] font-black text-sm mt-1">
          {selectedPin.emoji} {selectedPin.label} 와인 탐험 중
        </p>
      ) : (
        <p className="text-[#9B7080] text-xs mt-1">국가를 탭해서 선택하세요</p>
      )}
    </div>
  );
}

type Tab = 'region' | 'aroma' | 'all';

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>('region');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedAroma, setSelectedAroma] = useState<string | null>(null);
  const [selectedWine, setSelectedWine] = useState<WineEntry | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(null);

  const displayedWines = (() => {
    let wines = wineDatabase;
    if (tab === 'region' && selectedRegion) {
      const group = regionGroups.find((r) => r.id === selectedRegion);
      wines = group ? wines.filter((w) => group.wines.includes(w.id)) : wines;
    }
    if (tab === 'aroma' && selectedAroma) {
      const cat = aromaCategories.find((a) => a.id === selectedAroma);
      wines = cat ? wines.filter((w) => cat.wines.includes(w.id)) : wines;
    }
    if (difficultyFilter !== null) {
      wines = wines.filter((w) => w.difficulty === difficultyFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      wines = wines.filter(
        (w) =>
          w.nameKo.toLowerCase().includes(q) ||
          w.grapes.some((g) => g.toLowerCase().includes(q)) ||
          w.region.toLowerCase().includes(q) ||
          w.aromas.primary.some((a) => a.toLowerCase().includes(q))
      );
    }
    return wines;
  })();

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 bg-[#FBF5EE] z-20 px-4 pt-4 pb-2">
        <h1 className="text-2xl font-black text-[#8B1A4A] mb-3">🔍 탐험</h1>
        <input
          type="text"
          placeholder="와인 이름, 품종, 지역 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#E8D0DC] rounded-xl px-4 py-2.5 text-sm text-[#1A0A10] placeholder-[#9B7080] focus:outline-none focus:border-[#8B1A4A]"
        />
        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {[
            { id: 'region', label: '🗺️ 지역별' },
            { id: 'aroma', label: '👃 아로마별' },
            { id: 'all', label: '📋 전체' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id as Tab); setSelectedRegion(null); setSelectedAroma(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                tab === id ? 'bg-[#8B1A4A] text-white shadow-sm' : 'bg-white text-[#6B4050] border border-[#E8D0DC]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Difficulty filter */}
        <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setDifficultyFilter(null)}
            className={`flex-shrink-0 py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
              difficultyFilter === null ? 'bg-[#1A0A10] text-white' : 'bg-white text-[#6B4050] border border-[#E8D0DC]'
            }`}
          >
            전체 난이도
          </button>
          {([1, 2, 3, 4] as Difficulty[]).map((d) => {
            const info = DIFFICULTY_INFO[d];
            return (
              <button
                key={d}
                onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                className="flex-shrink-0 py-1.5 px-3 rounded-xl text-xs font-black transition-all border"
                style={{
                  background: difficultyFilter === d ? info.color : info.bg,
                  color: difficultyFilter === d ? '#fff' : info.color,
                  borderColor: info.color + '44',
                }}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Region tab — Globe + country list */}
        {tab === 'region' && (
          <>
            <div className="mt-3">
              <GlobeRegionPicker selected={selectedRegion} onSelect={setSelectedRegion} />
            </div>

            {/* Country chip list */}
            <div className="flex flex-wrap gap-2 mt-3">
              {regionGroups.map((rg) => {
                const active = selectedRegion === rg.id;
                return (
                  <button
                    key={rg.id}
                    onClick={() => setSelectedRegion(active ? null : rg.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all active:scale-95"
                    style={active
                      ? { background: rg.color, borderColor: rg.color, color: '#fff' }
                      : { background: '#fff', borderColor: rg.color + '55', color: rg.color }
                    }
                  >
                    <span>{rg.emoji}</span>
                    <span>{rg.name}</span>
                    <span className="text-xs opacity-70">{rg.wines.length}</span>
                  </button>
                );
              })}
            </div>

            {selectedRegion && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#6B4050] uppercase tracking-wider">
                    {displayedWines.length}개 와인
                  </span>
                  <button onClick={() => setSelectedRegion(null)} className="text-[#8B1A4A] text-xs font-bold">
                    선택 해제 ×
                  </button>
                </div>
                {displayedWines.map((w) => (
                  <WineCard key={w.id} wine={w} onPress={() => setSelectedWine(w)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Aroma tab */}
        {tab === 'aroma' && !selectedAroma && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {aromaCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedAroma(cat.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E0E8] text-left active:scale-95 transition-transform"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-black text-sm text-[#1A0A10]">{cat.name}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cat.aromas.slice(0, 3).map((a) => (
                    <span key={a} className="text-xs text-[#6B4050] bg-[#F0E0E8] px-1.5 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-[#8B1A4A] font-bold mt-2">{cat.wines.length}개 와인</div>
              </button>
            ))}
          </div>
        )}

        {/* Aroma selected */}
        {tab === 'aroma' && selectedAroma && (() => {
          const cat = aromaCategories.find((a) => a.id === selectedAroma)!;
          return (
            <>
              <button
                onClick={() => setSelectedAroma(null)}
                className="flex items-center gap-2 text-[#8B1A4A] font-bold text-sm mt-3 mb-2"
              >
                ‹ 아로마 목록
              </button>
              <div className="bg-white rounded-2xl p-4 border border-[#F0E0E8] mb-3">
                <div className="text-2xl mb-2">{cat.emoji} {cat.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.aromas.map((a) => (
                    <span key={a} className="text-sm font-bold text-white px-3 py-1 rounded-full" style={{ background: cat.color }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {displayedWines.map((w) => (
                  <WineCard key={w.id} wine={w} onPress={() => setSelectedWine(w)} />
                ))}
              </div>
            </>
          );
        })()}

        {/* All wines */}
        {tab === 'all' && (
          <div className="flex flex-col gap-3 mt-3">
            {displayedWines.length === 0 ? (
              <div className="text-center py-12 text-[#6B4050]">검색 결과가 없어요 🍷</div>
            ) : (
              displayedWines.map((w) => (
                <WineCard key={w.id} wine={w} onPress={() => setSelectedWine(w)} />
              ))
            )}
          </div>
        )}
      </div>

      {selectedWine && <WineDetailModal wine={selectedWine} onClose={() => setSelectedWine(null)} />}
    </div>
  );
}
