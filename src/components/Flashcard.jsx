import React, { useState, useEffect } from 'react';

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Resetujemy stan obrotu za każdym razem, gdy zmienia się wyświetlana fiszka (np. po kliknięciu "Następna")
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        
        {/* Przód fiszki (Pytanie) */}
        <div className="front">
          <h2>{card.question}</h2>
          {card.questionImage && (
            <img src={card.questionImage} alt="Ilustracja do pytania" className="card-image" />
          )}
        </div>

        {/* Tył fiszki (Odpowiedź) */}
        <div className="back">
          <h2>{card.answer}</h2>
          {card.answerImage && (
            <img src={card.answerImage} alt="Ilustracja do odpowiedzi" className="card-image" />
          )}
        </div>

      </div>
    </div>
  );
}