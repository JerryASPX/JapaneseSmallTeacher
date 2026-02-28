export const generateTeacherResponse = (userText, teacherStyleId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let response = { text: 'なるほど！もっと話してくださいね。', tw: '原來如此！請再多說一點喔。' };

            if (userText.includes('こんにちは') || userText.includes('你好')) {
                if (teacherStyleId === 'strict_male') response = { text: 'こんにちは。発音は悪くないですが、もっとはっきりと。', tw: '你好。發音還不差，但要再更清楚一點。' };
                if (teacherStyleId === 'serious_male') response = { text: 'こんにちは。今日も正しい文法で話しましょう。', tw: '你好。今天也用正確的文法說話吧。' };
                if (teacherStyleId === 'gentle_female') response = { text: 'こんにちは〜 今日も会えて嬉しいです。', tw: '你好～ 今天能見到你也很開心。' };
                if (teacherStyleId === 'cute_female') response = { text: 'ヤッホー！こんにちは！', tw: '呀呼！你好呀！' };
            } else if (userText.includes('ラーメン') || userText.includes('食べたい')) {
                response = { text: 'いいですね！美味しいものを食べると元気が出ますよ。', tw: '真不錯！吃到好吃的東西就會有精神喔。' };
                if (teacherStyleId === 'strict_male') response.tw = '不錯。但別吃太多，會胖的。';
            } else if (userText.includes('ありがとう') || userText.includes('謝謝')) {
                response = { text: 'どういたしまして。引き続き頑張りましょう。', tw: '不客氣。我們繼續努力吧。' };
            } else if (userText.length < 3) {
                response = { text: 'もう少し長く話してみましょうか。', tw: '要不要試著說長一點的句子呢？' };
            } else {
                // generic responses based on style
                if (teacherStyleId === 'gentle_female') {
                    response = { text: 'とても上手ですね！その調子です。', tw: '說得太好了！就是保持這個節奏。' };
                } else if (teacherStyleId === 'strict_male') {
                    response = { text: '文法は合っています。次はもっと流暢に。', tw: '文法是正確的。下次要更流利一點。' };
                } else if (teacherStyleId === 'serious_male') {
                    response = { text: 'ふむ、なかなかいい表現ですね。', tw: '嗯，滿不錯的表達方式呢。' };
                } else if (teacherStyleId === 'cute_female') {
                    response = { text: 'すごいすごい！天才かも！', tw: '好厲害好厲害！說不定是天才喔！' };
                }
            }

            resolve(response);
        }, 1000 + Math.random() * 1000);
    });
};

export const generateFeedback = (messagesCount, teacherStyleId) => {
    if (messagesCount < 3) {
        return '時間が短かったですね。次回はもっとたくさん話しましょう！\n（時間有點短呢。下次再多說一點吧！）';
    }

    if (teacherStyleId === 'strict_male') {
        return '今日の練習はここまで。悪くはなかったですが、まだまだ伸びしろがあります。復習を忘れないように。\n（今天的練習就到這裡。雖然不算差，但還有進步空間。別忘了複習。）';
    } else if (teacherStyleId === 'serious_male') {
        return 'お疲れ様でした。少しずつですが、確実に良くなっています。継続は力なりです。\n（辛苦了。雖然只是一點點，但有確實地在變好。持續就是力量。）';
    } else if (teacherStyleId === 'gentle_female') {
        return '今日もお疲れ様でした！たくさん話せてとても楽しかったですよ。また次回も一緒に頑張りましょうね。\n（今天也辛苦了！能聊這麼多真的很開心喔。下次我們也一起努力吧。）';
    } else {
        return 'ばっちり！今日のレッスンはこれでおしまい！すごく上達してるから、自信持ってね！またね〜！\n（完美！今天的課程就到這邊！你進步超多的，要對自己有自信喔！下次見〜！）';
    }
};
