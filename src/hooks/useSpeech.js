import { useState, useCallback, useEffect } from 'react';

export const useSpeech = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [voices, setVoices] = useState([]);

    // Load voices for synthesis
    useEffect(() => {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };

        // Browsers initially don't have voices loaded right away
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text, options = {}) => {
        if (!window.speechSynthesis) return;

        // cancel previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        // Constrain pitch and rate to avoid weird jittering/robotic sounds
        utterance.pitch = Math.max(0.5, Math.min(1.5, options.pitch || 1));
        utterance.rate = Math.max(0.7, Math.min(1.3, options.rate || 1));

        // Try to find Japanese voices
        const jaVoices = voices.filter(v => v.lang.includes('ja'));

        if (jaVoices.length > 0) {
            const preferredGender = options.gender; // 'male' or 'female'

            // We attempt to identify voice gender by known voice names
            // Windows: Microsoft Ichiro (Male), Microsoft Ayumi (Female), Microsoft Haruka (Female)
            // Google: Google 日本語 (Female default), sometimes specific extensions provide others.
            // Mac/iOS: Kyoko (Female), Otoya (Male)
            let selectedVoice = jaVoices[0];

            if (preferredGender === 'male') {
                const maleVoice = jaVoices.find(v =>
                    v.name.includes('Ichiro') || v.name.includes('Otoya') || v.name.includes('Male') || v.name.includes('Keita')
                );
                if (maleVoice) selectedVoice = maleVoice;
            } else if (preferredGender === 'female') {
                const femaleVoice = jaVoices.find(v =>
                    v.name.includes('Ayumi') || v.name.includes('Haruka') || v.name.includes('Kyoko') || v.name.includes('Female')
                );
                // If we can't find explicitly a female name, any Japanese default is usually female (like Google 日本語)
                if (femaleVoice) selectedVoice = femaleVoice;
            }

            utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
    }, [voices]);

    const startListening = useCallback((lang = 'ja-JP', onResult, onError) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            if (onError) onError('您的瀏覽器不支援語音辨識服務');
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang; // 動態傳入語系：'ja-JP', 'cmn-Hant-TW', 或 'en-US'
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let hasResponded = false; // 防連發機制

        recognition.onstart = () => setIsRecording(true);

        recognition.onresult = (event) => {
            if (hasResponded) return;
            hasResponded = true;
            const transcript = event.results[0][0].transcript;

            // 確保只回傳一次後立刻關閉辨識
            recognition.stop();
            if (onResult) onResult(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error !== 'aborted') { // 忽略手動 stop 造成的 aborted
                if (onError) onError(`語音辨識錯誤: ${event.error}`);
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();

        // function to stop manually
        return () => {
            hasResponded = true;
            recognition.stop();
            setIsRecording(false);
        };
    }, []);

    return { speak, startListening, isRecording };
};
