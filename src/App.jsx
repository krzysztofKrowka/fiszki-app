import { useState, useEffect } from "react";
import initialCardsData from "./data/flashcards.json";
import trueFalseData from "./data/trueFalse.json";
import "./App.css";
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
function App() {
  // --- STANY APLIKACJI ---
  const [mode, setMode] = useState("flashcards"); // 'flashcards' | 'trueFalse'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledTfData, setShuffledTfData] = useState(() =>
    shuffleArray(trueFalseData),
  );
  // Stany dla Fiszek
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem("flashcards_stats");
    return savedStats ? JSON.parse(savedStats) : {};
  });

  // Stany dla Prawda/Fałsz
  const [tfScore, setTfScore] = useState(0);
  const [isTfFinished, setIsTfFinished] = useState(false);
  const [lastPoints, setLastPoints] = useState(null);

  // Zapisywanie statystyk fiszek do Local Storage
  useEffect(() => {
    localStorage.setItem("flashcards_stats", JSON.stringify(stats));
  }, [stats]);

  // --- LOGIKA NAWIGACJI ---
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setCurrentIndex(0);
    setShowAnswer(false);
    setTfScore(0);
    setIsTfFinished(false);
    setLastPoints(null);
    if (newMode === "trueFalse") {
      setShuffledTfData(shuffleArray(trueFalseData)); // Tasuj przy przełączeniu na tryb P/F
    }
  };

  // --- LOGIKA FISZEK ---
  const sortedCardsForDashboard = [...initialCardsData].sort((a, b) => {
    const nieWiemB = stats[b.id]?.nieWiem || 0;
    const nieWiemA = stats[a.id]?.nieWiem || 0;
    return nieWiemB - nieWiemA;
  });

  const handleFlashcardAnswer = (isKnown) => {
    const currentCard = sortedCardsForDashboard[currentIndex];

    setStats((prevStats) => {
      const cardStats = prevStats[currentCard.id] || { wiem: 0, nieWiem: 0 };
      return {
        ...prevStats,
        [currentCard.id]: {
          wiem: isKnown ? cardStats.wiem + 1 : cardStats.wiem,
          nieWiem: !isKnown ? cardStats.nieWiem + 1 : cardStats.nieWiem,
        },
      };
    });

    setShowAnswer(false);
    if (currentIndex < sortedCardsForDashboard.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleResetFiszki = () => {
    setStats({});
    localStorage.removeItem("flashcards_stats");
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  // --- LOGIKA PRAWDA/FAŁSZ ---
  const handleTfGuess = (userGuess) => {
    const currentQuestion = shuffledTfData[currentIndex];
    let pointsAwarded = 0;

    if (userGuess === currentQuestion.answer) {
      pointsAwarded = 4;
    } else if (userGuess !== null) {
      pointsAwarded = -2;
    }

    setTfScore((prev) => prev + pointsAwarded);
    setLastPoints(pointsAwarded);
    setShowAnswer(true);
  };

  const handleTfNext = () => {
    setShowAnswer(false);

    setTimeout(() => {
      if (currentIndex < shuffledTfData.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsTfFinished(true);
      }
    }, 150);
  };

  const handleRestartTf = () => {
    setShuffledTfData(shuffleArray(trueFalseData)); // Tasuj ponownie przy restarcie testu
    setCurrentIndex(0);
    setTfScore(0);
    setIsTfFinished(false);
    setShowAnswer(false);
    setLastPoints(null);
  };

  // --- RENDEROWANIE WIDOKÓW ---
  return (
    <div className="App">
      <header className="app-header">
        <h1>🧠 Statystyka Master</h1>
        <div className="mode-selector">
          <button
            className={mode === "flashcards" ? "active" : ""}
            onClick={() => handleModeSwitch("flashcards")}
          >
            Fiszki
          </button>
          <button
            className={mode === "trueFalse" ? "active" : ""}
            onClick={() => handleModeSwitch("trueFalse")}
          >
            Test Prawda/Fałsz
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* WIDOK: FISZKI */}
        {mode === "flashcards" && (
          <div className="learning-module">
            <div className="header-info">
              <span>
                Postęp: {currentIndex + 1} / {sortedCardsForDashboard.length}
              </span>
              <button onClick={handleResetFiszki} className="reset-btn">
                Resetuj statystyki
              </button>
            </div>

            <div
              className="flashcard-container"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <div className={`flashcard ${showAnswer ? "flipped" : ""}`}>
                <div className="front">
                  <h2>{sortedCardsForDashboard[currentIndex].question}</h2>
                  {sortedCardsForDashboard[currentIndex].questionImage && (
                    <img
                      src={sortedCardsForDashboard[currentIndex].questionImage}
                      alt="Wzór do pytania"
                      className="card-image"
                    />
                  )}
                </div>
                <div className="back">
                  <h2>{sortedCardsForDashboard[currentIndex].answer}</h2>
                  {sortedCardsForDashboard[currentIndex].answerImage && (
                    <img
                      src={sortedCardsForDashboard[currentIndex].answerImage}
                      alt="Odpowiedź - wzór"
                      className="card-image"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="controls">
              <button
                className="btn-nie-wiem"
                onClick={() => handleFlashcardAnswer(false)}
              >
                ❌ Nie wiem
              </button>
              <button
                className="btn-wiem"
                onClick={() => handleFlashcardAnswer(true)}
              >
                ✅ Wiem
              </button>
            </div>
          </div>
        )}

        {/* WIDOK: PRAWDA / FAŁSZ */}
        {mode === "trueFalse" && !isTfFinished && (
          <div className="learning-module">
            <div className="header-info">
              <span>
                Pytanie: {currentIndex + 1} / {shuffledTfData.length}
              </span>
              <span>Punkty: {tfScore}</span>
            </div>

            <div className="flashcard-container">
              <div className={`flashcard ${showAnswer ? "flipped" : ""}`}>
                {/* Przód karty: Tylko pytanie */}
                <div className="front" style={{ padding: "40px" }}>
                  <h2>{shuffledTfData[currentIndex].question}</h2>
                </div>

                {/* Tył karty: Pytanie (przypomnienie), odpowiedź i punkty */}
                <div
                  className="back"
                  style={{
                    padding: "30px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1rem",
                      fontStyle: "italic",
                      color: "#555",
                      marginBottom: "20px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "15px",
                    }}
                  >
                    "{shuffledTfData[currentIndex].question}"
                  </p>

                  <h3 style={{ margin: "0", fontSize: "1.2rem" }}>
                    Poprawna odpowiedź:
                  </h3>
                  <h1
                    className={
                      shuffledTfData[currentIndex].answer
                        ? "txt-prawda"
                        : "txt-falsz"
                    }
                    style={{ margin: "10px 0" }}
                  >
                    {shuffledTfData[currentIndex].answer ? "PRAWDA" : "FAŁSZ"}
                  </h1>

                  <div
                    style={{
                      marginTop: "20px",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {lastPoints === 4 && (
                      <span style={{ color: "#2ecc71" }}>
                        ✅ Dobra odpowiedź! (+4 pkt)
                      </span>
                    )}
                    {lastPoints === -2 && (
                      <span style={{ color: "#e74c3c" }}>
                        ❌ Niestety błąd! (-2 pkt)
                      </span>
                    )}
                    {lastPoints === 0 && (
                      <span style={{ color: "#7f8c8d" }}>
                        🤷 Brak punktów (0 pkt)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamiczne przyciski */}
            {!showAnswer ? (
              <div className="controls tf-controls">
                <button
                  className="btn-wiem"
                  onClick={() => handleTfGuess(true)}
                >
                  👍 Prawda
                </button>
                <button
                  className="btn-nie-wiem"
                  onClick={() => handleTfGuess(false)}
                >
                  👎 Fałsz
                </button>
                <button
                  className="btn-neutral"
                  onClick={() => handleTfGuess(null)}
                >
                  🤷 Nie wiem
                </button>
              </div>
            ) : (
              <div className="controls tf-controls">
                <button
                  className="btn-wiem"
                  style={{ width: "100%", maxWidth: "300px" }}
                  onClick={handleTfNext}
                >
                  Następne pytanie ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* WIDOK: WYNIKI PRAWDA/FAŁSZ */}
        {mode === "trueFalse" &&
          isTfFinished &&
          (() => {
            const maxPoints = shuffledTfData.length * 4;
            const percentage = Math.max(
              0,
              Math.round((tfScore / maxPoints) * 100),
            );

            return (
              <div className="scoreboard">
                <h2>Koniec Testu!</h2>
                <div className="score-details">
                  <p>
                    Twój wynik: <strong>{tfScore}</strong> / {maxPoints} pkt
                  </p>
                  <h3>Skuteczność: {percentage}%</h3>
                </div>
                <button
                  className="btn-wiem"
                  onClick={handleRestartTf}
                  style={{ marginTop: "20px" }}
                >
                  Rozwiąż test ponownie
                </button>
              </div>
            );
          })()}
      </main>
    </div>
  );
}

export default App;
