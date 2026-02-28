import React from 'react';
import { teachers } from '../data/teachers';
import './Home.css';

const Home = ({ onSelectTeacher }) => {
    return (
        <div className="home-container animate-fade-in">
            <header className="home-header">
                <h1>🌸 日語伴讀小書僮 🌸</h1>
                <p>選擇一位老師開始今天的練習吧！</p>
            </header>

            <div className="teachers-grid">
                {teachers.map((teacher) => (
                    <div
                        key={teacher.id}
                        className="teacher-card glass-panel"
                        onClick={() => onSelectTeacher(teacher)}
                    >
                        <div className="teacher-image-wrapper">
                            <img
                                src={`/src/assets/images/${teacher.img}`}
                                alt={teacher.name}
                                className="teacher-image"
                            />
                        </div>
                        <div className="teacher-info">
                            <h3>{teacher.name}</h3>
                            <span className="teacher-style">{teacher.style}</span>
                            <p>{teacher.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
