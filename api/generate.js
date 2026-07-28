export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '수면 고민 내용이 필요합니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const systemInstruction = "당신은 전문 수면 분석 AI입니다. 사용자의 수면 고민을 바탕으로 예상되는 REM 수면 상태를 측정/추정하고, 이에 대한 설명과 원인, 그리고 개선 방안을 친절하고 깔끔하게 제시해주세요.";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstruction}\n\n사용자 수면 고민: ${prompt}` }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API 호출 실패' });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';

    return res.status(200).json({ result: generatedText });
  } catch (error) {
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
