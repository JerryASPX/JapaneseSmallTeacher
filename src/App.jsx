import { useState, useEffect } from 'react';
import Home from './components/Home';
import Chat from './components/Chat';
import ApiSettings from './components/ApiSettings';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'chat'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setCurrentView('chat');
  };

  const handleEndChat = () => {
    setCurrentView('home');
    setSelectedTeacher(null);
  };

  return (
    <div className="page-container">
      <ApiSettings apiKey={apiKey} onSave={handleSaveApiKey} />

      {currentView === 'home' && (
        <Home onSelectTeacher={handleSelectTeacher} />
      )}
      {currentView === 'chat' && selectedTeacher && (
        <Chat teacher={selectedTeacher} onEndChat={handleEndChat} apiKey={apiKey} />
      )}
    </div>
  );
}

export default App;
