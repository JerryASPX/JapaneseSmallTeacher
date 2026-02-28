export const teachers = [
  {
    id: 'strict_male',
    name: '佐藤 老師',
    style: '嚴厲・正經',
    desc: '要求完美，但默默關心學生的進度，發音一絲不苟。',
    img: 'teacher_strict_male_1772281964699.png',
    gender: 'male',
    voicePitch: 0.7,
    voiceRate: 0.9,
    greeting: 'こんにちは。今日のレッスンも厳しくいきますよ。',
    greetingTw: '你好。今天的課程我也會嚴格要求喔。'
  },
  {
    id: 'serious_male',
    name: '高橋 老師',
    style: '正經・穩重',
    desc: '講話非常有條理，一步步帶領你深入文法結構。',
    img: 'teacher_serious_male_1772281978882.png',
    gender: 'male',
    voicePitch: 0.6,
    voiceRate: 0.85,
    greeting: 'こんにちは。一緒に基礎からしっかり学びましょう。',
    greetingTw: '你好。我們一起從基礎好好學起吧。'
  },
  {
    id: 'gentle_female',
    name: '小林 老師',
    style: '溫柔・優雅',
    desc: '總是帶著微笑，對於犯錯給予最大的包容與鼓勵。',
    img: 'teacher_gentle_female_1772281998828.png',
    gender: 'female',
    voicePitch: 1.1,
    voiceRate: 0.9,
    greeting: 'こんにちは～ 間違えても大丈夫ですから、リラックスして話してくださいね。',
    greetingTw: '你好～ 講錯也沒關係，請放輕鬆說喔。'
  },
  {
    id: 'cute_female',
    name: '鈴木 老師',
    style: '可愛・元氣',
    desc: '元氣滿滿！讓學習變成一件最快樂的事！',
    img: 'teacher_cute_female_1772282014349.png',
    gender: 'female',
    voicePitch: 1.3, // 降低原先的 1.5 以避免抖動
    voiceRate: 1.0,
    greeting: 'ヤッホー！今日も一日楽しく日本語を勉強しようね！',
    greetingTw: '呀呼！今天也開心地學日文吧！'
  }
];

export const backgrounds = [
  { id: 'restaurant', name: '居酒屋', img: 'bg_restaurant_1772282029081.png' },
  { id: 'transport', name: '車站', img: 'bg_transport_1772282048150.png' },
  { id: 'attraction', name: '神社', img: 'bg_attraction_1772282067132.png' }
];
