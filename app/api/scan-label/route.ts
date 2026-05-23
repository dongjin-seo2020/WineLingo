import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType ?? 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `이 와인 라벨 사진을 분석해서 JSON으로만 답해주세요. 다른 텍스트 없이 JSON만 출력하세요.
{
  "name": "와인 이름",
  "producer": "생산자/와이너리",
  "region": "지역 (예: 부르고뉴, 나파 밸리)",
  "country": "국가",
  "grape": "포도 품종 (알 수 있는 경우)",
  "vintage": 2020,
  "type": "red|white|rosé|sparkling|dessert",
  "notes": "라벨에서 읽은 추가 정보"
}
라벨에서 읽을 수 없는 항목은 null로 표시하세요.`,
            },
          ],
        },
      ],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Parse failed' }, { status: 422 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
