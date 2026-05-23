'use client';

type Expression = 'happy' | 'excited' | 'thinking' | 'sad' | 'celebrating';

interface Props {
  expression?: Expression;
  size?: number;
  className?: string;
}

export default function WineMascot({ expression = 'happy', size = 120, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.5)}
      viewBox="0 0 120 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glass bowl outline */}
      <path
        d="M18,6 L102,6 Q90,62 80,84 L40,84 Q30,62 18,6 Z"
        fill="rgba(196,75,122,0.07)"
        stroke="rgba(196,75,122,0.25)"
        strokeWidth="2"
      />
      {/* Rim highlight */}
      <line x1="18" y1="6" x2="102" y2="6" stroke="rgba(196,75,122,0.4)" strokeWidth="3" strokeLinecap="round" />

      {/* Wine fill */}
      <path
        d="M32,36 L88,36 Q82,80 78,84 L42,84 Q38,80 32,36 Z"
        fill="#8B1A4A"
      />
      {/* Wine surface */}
      <path d="M32,36 Q60,26 88,36" fill="#A8224E" />
      {/* Wine highlight */}
      <ellipse cx="57" cy="34" rx="16" ry="5" fill="#C44B7A" opacity="0.35" />

      {/* Eyes white */}
      <circle cx="46" cy="53" r="9.5" fill="white" />
      <circle cx="74" cy="53" r="9.5" fill="white" />

      {expression === 'sad' ? (
        <>
          <circle cx="47" cy="55" r="5.5" fill="#1A0A0A" />
          <circle cx="75" cy="55" r="5.5" fill="#1A0A0A" />
          <circle cx="49" cy="53" r="1.8" fill="white" />
          <circle cx="77" cy="53" r="1.8" fill="white" />
          {/* Tears */}
          <ellipse cx="44" cy="64" rx="2" ry="3.5" fill="#7EC8E3" opacity="0.8" />
          <ellipse cx="72" cy="64" rx="2" ry="3.5" fill="#7EC8E3" opacity="0.8" />
        </>
      ) : expression === 'thinking' ? (
        <>
          <path d="M37,51 Q46,45 55,51" stroke="#1A0A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M65,51 Q74,45 83,51" stroke="#1A0A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="46" cy="54" r="5" fill="#1A0A0A" />
          <circle cx="74" cy="54" r="5" fill="#1A0A0A" />
          <circle cx="48" cy="52" r="1.5" fill="white" />
          <circle cx="76" cy="52" r="1.5" fill="white" />
        </>
      ) : (
        <>
          <circle cx="47" cy="54" r="5.5" fill="#1A0A0A" />
          <circle cx="75" cy="54" r="5.5" fill="#1A0A0A" />
          <circle cx="49" cy="52" r="1.8" fill="white" />
          <circle cx="77" cy="52" r="1.8" fill="white" />
          {expression === 'excited' && (
            <>
              <circle cx="44" cy="47" r="2" fill="#FFD700" opacity="0.9" />
              <circle cx="78" cy="45" r="1.5" fill="#FFD700" opacity="0.9" />
            </>
          )}
        </>
      )}

      {/* Blush */}
      <ellipse cx="33" cy="64" rx="7" ry="4.5" fill="#FFB0B0" opacity="0.45" />
      <ellipse cx="87" cy="64" rx="7" ry="4.5" fill="#FFB0B0" opacity="0.45" />

      {/* Mouth */}
      {expression === 'happy' && (
        <path d="M47,68 Q60,79 73,68" stroke="#1A0A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {expression === 'excited' && (
        <ellipse cx="60" cy="71" rx="10" ry="7" fill="#1A0A0A" />
      )}
      {expression === 'celebrating' && (
        <>
          <path d="M46,67 Q60,80 74,67" stroke="#1A0A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <text x="90" y="22" fontSize="16">✨</text>
          <text x="5" y="28" fontSize="14">⭐</text>
          <text x="95" y="50" fontSize="12">🎉</text>
        </>
      )}
      {expression === 'thinking' && (
        <>
          <path d="M48,69 Q60,75 72,69" stroke="#1A0A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="88" cy="18" r="7" fill="white" stroke="#C44B7A" strokeWidth="1.5" />
          <text x="84.5" y="23" fontSize="9">?</text>
          <circle cx="80" cy="30" r="3" fill="white" stroke="#C44B7A" strokeWidth="1.5" />
        </>
      )}
      {expression === 'sad' && (
        <path d="M47,74 Q60,66 73,74" stroke="#1A0A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* Stem */}
      <rect x="57" y="84" width="6" height="54" fill="#7A1640" rx="3" />

      {/* Base shadow */}
      <ellipse cx="60" cy="141" rx="33" ry="10" fill="#6B0E32" />
      {/* Base */}
      <ellipse cx="60" cy="138" rx="33" ry="10" fill="#8B1A4A" />
      <ellipse cx="60" cy="136" rx="28" ry="6" fill="#9E2255" />
    </svg>
  );
}
