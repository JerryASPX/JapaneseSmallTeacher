import React, { useState, useEffect, useRef } from 'react';
import { backgrounds } from '../data/teachers';
import { Mic, ArrowLeft, Settings2, PlaySquare, Loader2 } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { generateFeedback } from '../utils/mockApi';
import { generateAIResponse } from '../utils/aiChat';
import './Chat.css';

const Chat = ({ teacher, onEndChat, apiKey }) => {
    const [messages, setMessages] = useState([]);
    const [bgImage, setBgImage] = useState(backgrounds[0].img);
    const [voiceRate, setVoiceRate] = useState(teacher.voiceRate);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [inputLang, setInputLang] = useState('ja-JP'); // 'ja-JP', 'cmn-Hant-TW', 'en-US'
    const messagesEndRef = useRef(null);

    const { speak, startListening, isRecording } = useSpeech();

    useEffect(() => {
        // Load saved history or start fresh
        const saved = localStorage.getItem(`chat_${teacher.id}`);
        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            setMessages([
                { id: Date.now(), sender: 'teacher', text: teacher.greeting, tw: teacher.greetingTw },
            ]);
            // Note: Auto-speak greeting is often blocked by browsers until first interaction
        }
    }, [teacher]);

    // Handle saving to local storage when messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chat_${teacher.id}`, JSON.stringify(messages));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, teacher.id]);

    const handleSpeak = (text) => {
        speak(text, { rate: voiceRate, pitch: teacher.voicePitch, gender: teacher.gender });
    };

    const isGeneratingRef = useRef(false);
    const isMicStartingRef = useRef(false); // 防止點擊多次麥克風按鈕

    const handleMicClick = () => {
        if (isRecording || isProcessing || isGeneratingRef.current || isMicStartingRef.current) return;

        isMicStartingRef.current = true;

        startListening(
            inputLang,
            async (userTranscript) => {
                isMicStartingRef.current = false;
                if (isGeneratingRef.current) return; // Prevent double trigger
                isGeneratingRef.current = true;

                const newUserMsg = { id: Date.now(), sender: 'user', text: userTranscript, tw: '' };
                const currentSnapshot = [...messages, newUserMsg];

                // Synchronously add the user's message and set processing state
                setMessages(currentSnapshot);
                setIsProcessing(true);

                // Now call AI OUTSIDE of the state updater
                generateAIResponse(currentSnapshot.slice(0, -1), teacher, userTranscript, apiKey)
                    .then(teacherRes => {
                        setIsProcessing(false);
                        isGeneratingRef.current = false;

                        setMessages(currentMessages => {
                            const newMessages = [...currentMessages];
                            const lastUserMsgIndex = newMessages.length - 1;

                            // 只要這還是我們的使用者訊息，就更新雙語
                            if (lastUserMsgIndex >= 0 && newMessages[lastUserMsgIndex].sender === 'user' && teacherRes.userJp) {
                                newMessages[lastUserMsgIndex] = {
                                    ...newMessages[lastUserMsgIndex],
                                    text: teacherRes.userJp,
                                    tw: teacherRes.userTw
                                };
                            }

                            const newTeacherMsg = {
                                id: Date.now() + 1,
                                sender: 'teacher',
                                text: teacherRes.teacherText || teacherRes.text,
                                tw: teacherRes.teacherTw || teacherRes.tw
                            };
                            return [...newMessages, newTeacherMsg];
                        });

                        const textToSpeak = teacherRes.teacherText || teacherRes.text;
                        handleSpeak(textToSpeak);

                        if (Math.random() > 0.7) {
                            const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
                            setBgImage(randomBg.img);
                        }
                    })
                    .catch(err => {
                        setIsProcessing(false);
                        isGeneratingRef.current = false;
                        console.error(err);
                    });
            },
            (error) => {
                isMicStartingRef.current = false;
                console.error(error);
                alert(error);
            }
        );
    };

    const handleEnd = () => {
        setShowFeedback(true);
    };

    const clearHistoryAndExit = () => {
        localStorage.removeItem(`chat_${teacher.id}`);
        onEndChat();
    };

    if (showFeedback) {
        const feedback = generateFeedback(messages.length, teacher.id);
        return (
            <div className="chat-container feedback-screen animate-fade-in" style={{ backgroundImage: `url('/src/assets/images/${bgImage}')` }}>
                <div className="chat-overlay" style={{ background: 'rgba(255,255,255,0.85)' }}></div>
                <div className="feedback-content glass-panel" style={{ zIndex: 10, margin: 'auto', padding: '40px', maxWidth: '600px', textAlign: 'center', position: 'relative' }}>
                    <h2 style={{ fontSize: '2rem', color: '#ff8b94', marginBottom: '20px' }}>🎉 學習完成！</h2>
                    <img src={`/src/assets/images/${teacher.img}`} alt={teacher.name} style={{ width: '120px', borderRadius: '50%', margin: '0 auto 20px auto', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>來自 {teacher.name} 的評語：</h3>
                    <p style={{ fontSize: '1.15rem', lineHeight: '1.8', whiteWhiteSpace: 'pre-wrap', marginBottom: '30px', color: '#4A4A4A' }}>{feedback}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <button className="btn-primary" onClick={() => onEndChat()}>保留紀錄並回到首頁</button>
                        <button className="btn-primary" style={{ background: '#95a5a6', boxShadow: 'none' }} onClick={clearHistoryAndExit}>清除紀錄並回到首頁</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="chat-container animate-fade-in"
            style={{ backgroundImage: `url('/src/assets/images/${bgImage}')` }}
        >
            <div className="chat-overlay"></div>

            <header className="chat-header glass-panel">
                <button className="icon-btn" onClick={handleEnd} title="結束並查看評語">
                    <ArrowLeft size={24} />
                    <span>結束</span>
                </button>

                <div className="teacher-status">
                    <img src={`/src/assets/images/${teacher.img}`} alt={teacher.name} className="status-avatar" />
                    <div className="status-info">
                        <h2>{teacher.name}</h2>
                        <span className="status-style">{teacher.style}</span>
                    </div>
                </div>

                <div className="chat-controls">
                    <div className="rate-control">
                        <Settings2 size={18} />
                        <span className="rate-label">語速</span>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={voiceRate}
                            onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        />
                        <span className="rate-value">{voiceRate.toFixed(1)}x</span>
                    </div>
                </div>
            </header>

            <main className="chat-messages-area">
                <div className="messages-list">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-wrapper ${msg.sender === 'teacher' ? 'teacher-msg' : 'user-msg'}`}>
                            {msg.sender === 'teacher' && (
                                <img src={`/src/assets/images/${teacher.img}`} alt={teacher.name} className="msg-avatar" />
                            )}
                            <div className="message-bubble glass-panel">
                                <p className="msg-jp">{msg.text}</p>
                                {msg.tw && <p className="msg-tw">{msg.tw}</p>}

                                {msg.sender === 'teacher' && (
                                    <button className="play-btn" title="朗讀" onClick={() => handleSpeak(msg.text)}>
                                        <PlaySquare size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="message-wrapper teacher-msg animate-fade-in">
                            <img src={`/src/assets/images/${teacher.img}`} alt={teacher.name} className="msg-avatar" style={{ opacity: 0.5 }} />
                            <div className="message-bubble glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Loader2 className="spinner" size={18} /> <span style={{ fontSize: '0.9rem', color: '#666' }}>思考中...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="chat-footer glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div className="lang-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                    <button
                        className={`lang-btn ${inputLang === 'ja-JP' ? 'active' : ''}`}
                        onClick={() => setInputLang('ja-JP')}
                        style={{ padding: '6px 12px', borderRadius: '15px', border: '1px solid #ff8b94', background: inputLang === 'ja-JP' ? '#ff8b94' : 'transparent', color: inputLang === 'ja-JP' ? '#fff' : '#ff8b94', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        🗣️ 日文
                    </button>
                    <button
                        className={`lang-btn ${inputLang === 'cmn-Hant-TW' ? 'active' : ''}`}
                        onClick={() => setInputLang('cmn-Hant-TW')}
                        style={{ padding: '6px 12px', borderRadius: '15px', border: '1px solid #ff8b94', background: inputLang === 'cmn-Hant-TW' ? '#ff8b94' : 'transparent', color: inputLang === 'cmn-Hant-TW' ? '#fff' : '#ff8b94', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        🗣️ 中文
                    </button>
                    <button
                        className={`lang-btn ${inputLang === 'en-US' ? 'active' : ''}`}
                        onClick={() => setInputLang('en-US')}
                        style={{ padding: '6px 12px', borderRadius: '15px', border: '1px solid #ff8b94', background: inputLang === 'en-US' ? '#ff8b94' : 'transparent', color: inputLang === 'en-US' ? '#fff' : '#ff8b94', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        🗣️ 英文
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', justifyContent: 'center' }}>
                    <button
                        className={`mic-btn ${isRecording ? 'recording' : ''}`}
                        onClick={handleMicClick}
                        disabled={isProcessing}
                        style={{ opacity: isProcessing ? 0.6 : 1 }}
                    >
                        <Mic size={28} />
                    </button>
                    <div className="mic-hint">
                        {isRecording ? `聆聽中... (請說${inputLang === 'ja-JP' ? '日文' : inputLang === 'en-US' ? '英文' : '中文'})` : isProcessing ? '老師正在回應...' : '點擊麥克風開始說話'}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Chat;
