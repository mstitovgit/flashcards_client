import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css"; // Подключаем стили
import { FaVolumeUp } from 'react-icons/fa'

function App() {
  const [mode, setMode] = useState("menu");
  const [word, setWord] = useState(null);
  const [text, setText] = useState("");
  const [flipped, setFlipped] = useState(false); // Состояние для переворота карточки
  const INTERVALS = [
    20 * 60 * 1000,
    2 * 60 * 60 * 1000,
    1 * 24 * 60 * 60 * 1000,
    2 * 24 * 60 * 60 * 1000,
    7 * 24 * 60 * 60 * 1000,
    14 * 24 * 60 * 60 * 1000,
    30 * 24 * 60 * 60 * 1000
  ];
  const audioRef = useRef(null);

  useEffect(() => {
    if (mode === "train") {
      fetchWord();
    }
  }, [mode]);

  const fetchWord = async () => {
    const res = await axios.get("http://localhost:5172/train");
    setWord(res.data);
    setFlipped(false); // При загрузке нового слова сбрасываем переворот
  };

  const handlePlayAudio = (event) => {
    event.stopPropagation();
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  }

  const handleAddWords = async () => {
    await axios.post("http://localhost:5172/words", { text });
    setText("");
    setMode("menu");
  };

  const handleUpdateWord = async (action) => {
    if (!word) return;
    await axios.post("http://localhost:5172/update", { id: word.id, action });
    fetchWord();
  };

  return (
    <div className="container">
      {mode === "menu" && (
        <div className="StartScreen">
          <button className="text-button MainButton" onClick={() => setMode("train")}>
            Learn
          </button>
          <button className="text-button SecondaryButton" onClick={() => setMode("add")}>
            add new words
          </button>
        </div>
      )}

      {mode === "add" && (
        <div className="AddForm">
          <textarea placeholder="Add words: Term + Translation" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="buttons">
            <button className="fill-button" onClick={handleAddWords}>
              done
            </button>
            <button className="fill-button secondary-fill-button" onClick={() => setMode("menu")}>
              back
            </button>
          </div>
        </div>
      )}

      {mode === "train" && word && (
        <div className="card-container">
          <div className={`card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
            {/* Передняя сторона с термином */}
            <div className="card-front">
              <div className="progress-dots">
                {Array.from({ length: INTERVALS.length }).map((_, i) => (
                  <div key={i} className={`dot ${word.interval > i ? "filled" : ""}`} />
                ))}
              </div>
              <h2>{word.term}</h2>
              <button className="audio-button" onClick={handlePlayAudio}>
                <FaVolumeUp size={24} />
              </button>
              <audio ref={audioRef} autoPlay src={`http://localhost:5172${word.audio_url}`} />
            </div>

            {/* Задняя сторона с переводом */}
            <div className="card-back">
              <h2>{word.translation}</h2>
            </div>
          </div>

          <div className="buttons">
            <button className="fill-button secondary-fill-button" onClick={() => handleUpdateWord("study")}>
              study
            </button>
            <button className="fill-button" onClick={() => handleUpdateWord("know")}>know</button>
          </div>

          <button className="text-button backButton" onClick={() => setMode("menu")}>
            Back
          </button>
        </div>
      )}

      {mode === "train" && !word && (
        <div className="card-container">
          <div className="card-front">
          <h2>Нет слов для тренировки</h2>
          <button className="text-button" onClick={() => setMode("menu")}>
            Back
          </button>
        </div>
        </div>
      )}
    </div>
  );
}

export default App;
