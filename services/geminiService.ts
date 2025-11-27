
import { GoogleGenAI } from "@google/genai";
import { Player, getStatType, StatType, Position } from "../types";

const getSystemInstruction = () => {
  return `你是一名专业的腰旗橄榄球(Flag Football)高级教练。
你的任务是根据提供的学员数据（可能包含多个位置的数据），生成一段简短、犀利且富有激励性的中文点评。
点评风格应该是“运动科技风”，专业、客观但充满激情。
分析应该指出学员在不同位置上的优势（基于数据高光）和改进方向（基于数据短板）。
请用Markdown格式输出，可以包含emoji。
字数控制在200字以内。`;
};

export const generatePlayerAnalysis = async (player: Player): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "请先配置 API Key 以启用 AI 教练点评功能。";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare data summary for the prompt
    let statsSummary = "";

    player.positions.forEach(pos => {
        const type = getStatType(pos);
        const s = player.stats[pos] as any;
        if (!s) return;

        if (type === StatType.OFFENSE_QB) {
            const completionRate = s.passAttempts > 0 ? ((s.passCompletions / s.passAttempts) * 100).toFixed(1) : 0;
            statsSummary += `\n[位置: ${pos}] 传球: ${s.passCompletions}/${s.passAttempts} (${completionRate}%), 码数: ${s.passYards}, 达阵: ${s.passTDs}, 抄截: ${s.interceptionsThrown}, 被擒杀: ${s.sacksTaken}`;
        } else if (type === StatType.OFFENSE_SKILL) {
            const catchRate = s.targets > 0 ? ((s.catches / s.targets) * 100).toFixed(1) : 0;
            statsSummary += `\n[位置: ${pos}] 接球: ${s.catches}/${s.targets} (${catchRate}%), 接球码数: ${s.receivingYards}, 接球达阵: ${s.receivingTDs}, 跑球码数: ${s.rushingYards}, 跑球达阵: ${s.rushingTDs}`;
        } else {
            const pullRate = s.flagPullsAttempts > 0 ? ((s.flagPullsSuccess / s.flagPullsAttempts) * 100).toFixed(1) : 0;
            statsSummary += `\n[位置: ${pos}] 拔旗: ${s.flagPullsSuccess}/${s.flagPullsAttempts} (${pullRate}%), 抄截: ${s.interceptionsCaught}, 破坏传球: ${s.passDeflections}, 擒杀: ${s.sacksMade}, 防守达阵: ${s.defensiveTDs}`;
        }
    });
    
    const prompt = `学员姓名: ${player.name} (#${player.number})
    年龄组: ${player.ageGroup}
    ${statsSummary}
    
    请根据以上综合数据进行点评。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
      },
    });

    return response.text || "AI 分析暂时不可用。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 教练正在休息，请稍后再试。";
  }
};
