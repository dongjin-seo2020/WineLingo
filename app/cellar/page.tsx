'use client';
import { useState, useRef } from 'react';
import { useCellar, type CellarEntry } from '@/hooks/useCellar';

const TYPE_OPTIONS = [
  { value: 'red', label: '레드', color: '#8B1A1A' },
  { value: 'white', label: '화이트', color: '#C4A44A' },
  { value: 'rosé', label: '로제', color: '#E8728A' },
  { value: 'sparkling', label: '스파클링', color: '#4A8BC4' },
  { value: 'dessert', label: '디저트', color: '#C48A1A' },
  { value: 'orange', label: '오렌지', color: '#C46A1A' },
];

const COLOR_MAP: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t.color]));

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange?.(s)}
          className={`text-2xl transition-transform active:scale-110 ${s <= value ? 'opacity-100' : 'opacity-25'}`}
        >
          🍷
        </button>
      ))}
    </div>
  );
}

function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: Omit<CellarEntry, 'id' | 'dateAdded'>) => void }) {
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [form, setForm] = useState({
    name: '', producer: '', region: '', country: '', grape: '',
    vintage: '', type: 'red' as CellarEntry['type'], rating: 3, notes: '',
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = (e.target?.result as string).split(',')[1];
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
      setImageBase64(b64);
      setScanning(true);
      setScanError('');
      try {
        const res = await fetch('/api/scan-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: b64, mediaType }),
        });
        if (!res.ok) throw new Error('scan failed');
        const data = await res.json();
        setForm((f) => ({
          ...f,
          name: data.name ?? f.name,
          producer: data.producer ?? f.producer,
          region: data.region ?? f.region,
          country: data.country ?? f.country,
          grape: data.grape ?? f.grape,
          vintage: data.vintage?.toString() ?? f.vintage,
          type: data.type ?? f.type,
          notes: data.notes ?? f.notes,
        }));
      } catch {
        setScanError('라벨 인식에 실패했어요. 직접 입력해주세요.');
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onAdd({
      ...form,
      vintage: form.vintage ? Number(form.vintage) : null,
      imageBase64,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-[#FBF5EE] w-full max-w-lg mx-auto rounded-t-3xl max-h-[95vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#1A0A10]">와인 기록하기</h2>
          <button onClick={onClose} className="text-2xl text-[#6B4050]">✕</button>
        </div>

        <div className="px-5 flex flex-col gap-4 pb-8">
          {/* Photo + AI Scan */}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-[#C44B7A] bg-[#FFF0F5] flex flex-col items-center justify-center py-5 gap-2 active:bg-[#F0E0E8]"
          >
            {imageBase64 ? (
              <img src={`data:image/jpeg;base64,${imageBase64}`} className="w-full h-48 object-cover rounded-xl" alt="label" />
            ) : (
              <>
                <span className="text-4xl">{scanning ? '⏳' : '📷'}</span>
                <span className="text-sm font-bold text-[#8B1A4A]">
                  {scanning ? 'AI가 라벨을 읽는 중...' : '라벨 사진 찍기 (AI 자동 인식)'}
                </span>
                <span className="text-xs text-[#6B4050]">탭해서 카메라 열기</span>
              </>
            )}
          </button>
          {scanError && <p className="text-xs text-red-500">{scanError}</p>}
          {imageBase64 && !scanning && (
            <button onClick={() => fileRef.current?.click()} className="text-[#8B1A4A] text-xs font-bold text-center">
              다시 찍기
            </button>
          )}

          {/* Wine type */}
          <div>
            <label className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2 block">종류</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button key={t.value} onClick={() => setForm((f) => ({ ...f, type: t.value as CellarEntry['type'] }))}
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${form.type === t.value ? 'text-white border-transparent' : 'bg-white text-[#6B4050] border-[#E8D0DC]'}`}
                  style={form.type === t.value ? { background: t.color, borderColor: t.color } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          {[
            { key: 'name', label: '와인 이름 *', placeholder: 'Château Margaux', required: true },
            { key: 'producer', label: '생산자', placeholder: 'Château Margaux' },
            { key: 'region', label: '지역', placeholder: '보르도, 부르고뉴...' },
            { key: 'country', label: '국가', placeholder: '프랑스, 이탈리아...' },
            { key: 'grape', label: '포도 품종', placeholder: '카베르네 소비뇽...' },
            { key: 'vintage', label: '빈티지', placeholder: '2020', type: 'number' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-1.5 block">{label}</label>
              <input
                type={type ?? 'text'}
                placeholder={placeholder}
                value={(form as Record<string, unknown>)[key] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-white border border-[#E8D0DC] rounded-xl px-4 py-2.5 text-sm text-[#1A0A10] focus:outline-none focus:border-[#8B1A4A]"
              />
            </div>
          ))}

          {/* Rating */}
          <div>
            <label className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-2 block">평점</label>
            <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-black text-[#6B4050] uppercase tracking-wider mb-1.5 block">테이스팅 노트</label>
            <textarea
              placeholder="어디서 마셨는지, 맛은 어땠는지, 기억하고 싶은 것들..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full bg-white border border-[#E8D0DC] rounded-xl px-4 py-2.5 text-sm text-[#1A0A10] focus:outline-none focus:border-[#8B1A4A] resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className={`w-full font-black text-lg py-4 rounded-2xl transition-all ${form.name.trim() ? 'bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400'}`}
          >
            저장하기 📒
          </button>
        </div>
      </div>
    </div>
  );
}

function WineEntryCard({ entry, onDelete }: { entry: CellarEntry; onDelete: () => void }) {
  const [showDetail, setShowDetail] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const color = COLOR_MAP[entry.type] ?? '#888';
  const dateStr = new Date(entry.dateAdded).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDetail(true)}
          className="bg-white rounded-2xl shadow-sm border border-[#F0E0E8] overflow-hidden active:scale-95 transition-transform w-full text-left"
        >
          {entry.imageBase64 ? (
            <img src={`data:image/jpeg;base64,${entry.imageBase64}`} className="w-full h-36 object-cover" alt={entry.name} />
          ) : (
            <div className="w-full h-24 flex items-center justify-center text-4xl" style={{ background: color + '22' }}>
              🍷
            </div>
          )}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-[#1A0A10] truncate">{entry.name}</div>
                {entry.producer && <div className="text-xs text-[#6B4050] truncate">{entry.producer}</div>}
                {entry.vintage && <div className="text-xs text-[#8B1A4A] font-bold">{entry.vintage}</div>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: color }}>
                  {TYPE_OPTIONS.find((t) => t.value === entry.type)?.label}
                </span>
                <div className="flex">
                  {'🍷'.repeat(entry.rating)}
                  <span className="opacity-20">{'🍷'.repeat(5 - entry.rating)}</span>
                </div>
              </div>
            </div>
            {entry.region && <div className="text-xs text-[#6B4050] mt-1">📍 {entry.region}</div>}
            <div className="text-xs text-[#9B8090] mt-1">{dateStr}</div>
          </div>
        </button>

        {/* Trash button */}
        {!confirming && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
            className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white/90 active:scale-90 transition-transform"
            aria-label="삭제"
          >
            🗑️
          </button>
        )}

        {/* Delete confirmation overlay */}
        {confirming && (
          <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-10">
            <p className="text-white font-black text-sm text-center">정말 삭제할까요?</p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 bg-white/20 text-white font-bold py-2 rounded-xl text-sm active:bg-white/30"
              >
                취소
              </button>
              <button
                onClick={() => { onDelete(); setConfirming(false); }}
                className="flex-1 bg-red-500 text-white font-bold py-2 rounded-xl text-sm active:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowDetail(false)}>
          <div className="bg-[#FBF5EE] w-full max-w-lg mx-auto rounded-t-3xl max-h-[85vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#1A0A10]">{entry.name}</h2>
              <button onClick={() => setShowDetail(false)} className="text-2xl text-[#6B4050]">✕</button>
            </div>
            {entry.imageBase64 && (
              <img src={`data:image/jpeg;base64,${entry.imageBase64}`} className="w-full h-48 object-cover mt-3" alt={entry.name} />
            )}
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white px-3 py-1 rounded-full" style={{ background: color }}>
                  {TYPE_OPTIONS.find((t) => t.value === entry.type)?.label}
                </span>
                {entry.vintage && <span className="text-sm font-bold text-[#8B1A4A]">{entry.vintage}년</span>}
              </div>
              <StarRating value={entry.rating} />
              {[
                { label: '생산자', value: entry.producer },
                { label: '지역', value: entry.region },
                { label: '국가', value: entry.country },
                { label: '품종', value: entry.grape },
              ].filter((f) => f.value).map(({ label, value }) => (
                <div key={label}>
                  <span className="text-xs font-black text-[#6B4050] uppercase">{label}: </span>
                  <span className="text-sm text-[#1A0A10]">{value}</span>
                </div>
              ))}
              {entry.notes && (
                <div className="bg-white rounded-2xl p-4 border border-[#F0E0E8]">
                  <div className="text-xs font-black text-[#6B4050] uppercase mb-1">테이스팅 노트</div>
                  <p className="text-sm text-[#1A0A10] leading-relaxed">{entry.notes}</p>
                </div>
              )}
              <button
                onClick={() => { onDelete(); setShowDetail(false); }}
                className="w-full py-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-500 text-sm font-black mt-2 active:bg-red-100"
              >
                🗑️ 삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CellarPage() {
  const { entries, loaded, addEntry, deleteEntry } = useCellar();
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const displayed = filterType === 'all' ? entries : entries.filter((e) => e.type === filterType);

  if (!loaded) return <div className="flex items-center justify-center min-h-screen"><div className="text-5xl animate-spin">🍷</div></div>;

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 bg-[#FBF5EE] z-20 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black text-[#8B1A4A]">📒 내 셀러</h1>
            <p className="text-xs text-[#6B4050]">{entries.length}개의 와인 기록</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black text-sm px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform"
          >
            + 추가
          </button>
        </div>
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterType === 'all' ? 'bg-[#8B1A4A] text-white' : 'bg-white text-[#6B4050] border border-[#E8D0DC]'}`}
          >
            전체
          </button>
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterType === t.value ? 'text-white' : 'bg-white text-[#6B4050] border border-[#E8D0DC]'}`}
              style={filterType === t.value ? { background: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-6xl">📭</div>
            <div className="font-black text-lg text-[#1A0A10]">아직 기록된 와인이 없어요</div>
            <p className="text-[#6B4050] text-center text-sm">마신 와인의 라벨을 찍으면<br/>AI가 자동으로 정보를 읽어줘요!</p>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-[#8B1A4A] to-[#C44B7A] text-white font-black px-6 py-3 rounded-2xl shadow-md active:scale-95 transition-transform"
            >
              첫 와인 기록하기 🍷
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {displayed.map((entry) => (
              <WineEntryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addEntry} />}
    </div>
  );
}
