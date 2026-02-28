import React, { useState } from 'react';
import './ApiSettings.css';

const ApiSettings = ({ apiKey, onSave }) => {
    const [key, setKey] = useState(apiKey || '');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="api-settings-container">
            <button
                className="settings-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="AI API 設定"
            >
                ⚙️
            </button>

            {isOpen && (
                <div className="settings-panel glass-panel">
                    <h4>Gemini API Key 設定</h4>
                    <p>輸入 API Key 以解鎖老師的「真人對談」模式。如果留空，將使用預設的簡單問答腳本。</p>
                    <input
                        type="password"
                        placeholder="輸入你的 Gemini API Key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                    <button
                        className="btn-primary small"
                        onClick={() => {
                            onSave(key);
                            setIsOpen(false);
                        }}
                    >
                        儲存
                    </button>
                </div>
            )}
        </div>
    );
};

export default ApiSettings;
