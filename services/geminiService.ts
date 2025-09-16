
import { GoogleGenAI } from "@google/genai";
import type { Individual } from '../types';

// IMPORTANT: In a real application, the API key should be handled securely
// and not be exposed in the client-side code. This is for demonstration purposes.
// We assume `process.env.API_KEY` is configured in the build environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateIndividualReport = async (individual: Individual): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI機能は現在利用できません。APIキーが設定されていません。");
  }

  const {
    speciesCommon,
    speciesScientific,
    stage,
    sex,
    lineName,
    parentCodeM,
    parentCodeF,
    measurements,
    notes
  } = individual;

  const latestMeasurement = measurements[measurements.length - 1];

  const prompt = `
あなたは世界クラスのクワガタ・カブトムシのブリーダー専門家です。
以下のデータを持つ個体について、その特徴、将来性、および飼育上のアドバイスを組み合わせた、魅力的で専門的なレポートを作成してください。

# 個体データ
- 和名: ${speciesCommon}
- 学名: ${speciesScientific}
- ステージ: ${stage}
- 性別: ${sex}
- 血統名: ${lineName || 'なし'}
- 父個体コード: ${parentCodeM || '不明'}
- 母個体コード: ${parentCodeF || '不明'}
- 最新の計測値: ${latestMeasurement ? `体重 ${latestMeasurement.weightG || 'N/A'}g, 体長 ${latestMeasurement.lengthMm || 'N/A'}mm, 大顎幅 ${latestMeasurement.jawWidthMm || 'N/A'}mm` : 'なし'}
- ブリーダーのメモ: ${notes || '特になし'}

# レポート作成の指示
1.  **序文**: この個体の種としての魅力や特徴について簡潔に述べてください。
2.  **個体の評価**: 提供されたデータ（特に血統、最新のサイズ）を基に、この個体のポテンシャルを評価してください。例えば、大型が期待できるか、血統的な価値はどうか、など。
3.  **飼育アドバイス**: 現在のステージと種に合わせて、具体的な次のステップや注意点をアドバイスしてください。（例：幼虫であれば次のボトル交換のタイミング、成虫であればペアリングの注意点など）
4.  **結び**: この個体を飼育する楽しみや期待を煽るような、ポジティブな言葉で締めくくってください。

レポートは、専門用語を適度に使いつつも、情熱的で読みやすい文章で記述してください。
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    return "AIレポートの生成中にエラーが発生しました。しばらくしてからもう一度お試しください。";
  }
};
