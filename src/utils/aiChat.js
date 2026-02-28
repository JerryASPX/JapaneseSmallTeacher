import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateTeacherResponse as fallbackMockResponse } from './mockApi';

export const generateAIResponse = async (messages, teacher, userLatestText, apiKey) => {
    // 若沒設定 API Key，先退回 Mock 模式
    if (!apiKey) {
        return fallbackMockResponse(userLatestText, teacher.id);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 建立 System Prompt
        const systemPrompt = `
你是一位正在教台灣學生日文的老師，名叫 ${teacher.name}。
你的個性設定標籤是：${teacher.style}。
你的內心設定：${teacher.desc}

【對話規則與進展】
1. 一開始你們是師生，但隨著對話進行，你要慢慢卸下老師的架子，表現出可以當「朋友」的信任感與親合力。
2. 老師（你）本身精通日文、繁體中文與英文。學生可能會用「繁體中文」、「日文」或「英文」跟你對話，甚至三語穿插。無論他用什麼語言，你都要能聽懂。
3. 針對學生的發言，給予超級簡短的自然回應（如果是閒聊就以閒聊為主）。
4. 為了讓學生學習，你**必須**回傳以下的精確格式（共四行），不能有 markdown code block 包裝，也不能有其他廢話：
第一行（優化學生的句子）：將學生剛剛說的話翻譯成自然的日文。如果學生已經用完美日文說了，就照抄或微調。這行是給學生看的完美日文示範。
第二行（學生句子的中文）：學生剛剛說的話的繁體中文翻譯。如果學生原本就有說中文，就保留或翻譯完整。
第三行（老師的回覆）：你的日文對話回應內容。
第四行（老師回覆的中文）：你的日文回應的繁體中文翻譯。

【歷史對話紀錄】（請根據上下文發展感情）
${messages.map(m => `${m.sender === 'teacher' ? teacher.name : '學生'}: ${m.text} ${m.tw ? '(' + m.tw + ')' : ''}`).join('\n')}

學生說了：${userLatestText}
請回覆（嚴格遵守四行格式）：`;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text().trim();

        // 解析回傳的文字 (拆分成 4 行)
        const lines = responseText.split('\n').filter(line => line.trim() !== '');

        let userJp = userLatestText;
        let userTw = userLatestText;
        let teacherJp = '……（微笑）';
        let teacherTw = '……（微笑）';

        if (lines.length >= 4) {
            userJp = lines[0].replace(/^第一行[:：]*/, '').trim();
            userTw = lines[1].replace(/^第二行[:：]*/, '').trim();
            teacherJp = lines[2].replace(/^第三行[:：]*/, '').trim();
            teacherTw = lines.slice(3).join(' ').replace(/^第四行[:：]*/, '').trim();
        } else if (lines.length === 2) {
            // Fallback 如果 AI 沒遵守只回了老師的話
            teacherJp = lines[0];
            teacherTw = lines[1];
        }

        return {
            userJp,
            userTw,
            teacherText: teacherJp,
            teacherTw: teacherTw
        };

    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            text: 'ごめんなさい、ちょっと考えさせてください。（網路連線似乎不穩定）',
            tw: '抱歉，讓我稍微想一下。（網路連線似乎不穩定）'
        };
    }
};
