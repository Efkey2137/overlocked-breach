'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface PuzzleProps {
  isActive: boolean;
  onSolve: () => void;
  onFail: () => void;
  onTimeout: () => void;
  difficulty?: number;
}

// Japońskie znaki do wykorzystania w zagadkach
const japaneseSymbols = [
  '木', '火', '水', '金', '土', '日', '月',
  '山', '川', '田', '人', '口', '目', '手',
  '足', '心', '力', '刀', '車', '門', '雨',
  '雪', '風', '空', '星', '花', '鳥', '魚'
];

// Typy wzorów zagadek
type PuzzlePattern = 'sequence' | 'matching' | 'oddOne';

const Puzzle: React.FC<PuzzleProps> = ({ 
  isActive, 
  onSolve, 
  onFail, 
  onTimeout,
  difficulty = 1
}) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [pattern, setPattern] = useState<PuzzlePattern>('sequence');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [puzzleDescription, setPuzzleDescription] = useState('');

  // Generowanie sekwencji symboli z powtórzeniami
  const generateSequence = useCallback(() => {
    // Wybierz 3 unikalne symbole
    const uniqueSymbols = [...japaneseSymbols].sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Wybierz jeden symbol, który będzie powtórzony (prawidłowa odpowiedź)
    const repeatedSymbol = uniqueSymbols[Math.floor(Math.random() * uniqueSymbols.length)];
    
    // Utwórz sekwencję z powtórzeniami
    const sequence = [...uniqueSymbols];
    // Dodaj powtórzenia prawidłowego symbolu (2-3 razy)
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      sequence.push(repeatedSymbol);
    }
    
    // Pomieszaj sekwencję
    const shuffledSequence = [...sequence].sort(() => Math.random() - 0.5);
    setSymbols(shuffledSequence);
    setCorrectAnswer(repeatedSymbol);
    
    // Opcje do wyboru (zawierające poprawną odpowiedź)
    setOptions(uniqueSymbols);
    
    setPuzzleDescription('Wybierz symbol, który występuje najczęściej');
  }, []);

  // Generowanie zagadki dopasowania z jasnym wzorem
  const generateMatching = useCallback(() => {
    // Utwórz pary symboli z jasnym wzorem (np. pierwszy i drugi rząd)
    const pairs: [string, string][] = [];
    
    // Wybierz 3 pary symboli
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * (japaneseSymbols.length - 1));
      // Użyj sąsiadujących symboli jako pary
      pairs.push([japaneseSymbols[randomIndex], japaneseSymbols[randomIndex + 1]]);
    }
    
    // Wybierz losową parę do zagadki
    const targetPairIndex = Math.floor(Math.random() * pairs.length);
    const targetPair = pairs[targetPairIndex];
    
    // Pokaż pierwszy symbol z każdej pary
    const firstSymbols = pairs.map(pair => pair[0]);
    setSymbols(firstSymbols);
    
    // Ustaw poprawną odpowiedź (drugi symbol z wybranej pary)
    setCorrectAnswer(targetPair[1]);
    
    // Opcje do wyboru (wszystkie drugie symbole z par)
    setOptions(pairs.map(pair => pair[1]));
    
    setPuzzleDescription(`Znajdź symbol, który pasuje do ${firstSymbols[targetPairIndex]} według wzoru`);
  }, []);

  // Generowanie zagadki "znajdź niepasujący"
  const generateOddOne = useCallback(() => {
    const baseSymbol = japaneseSymbols[Math.floor(Math.random() * japaneseSymbols.length)];
    const displaySymbols = Array(4).fill(baseSymbol);
    
    // Wybierz inny symbol jako niepasujący
    let oddSymbol;
    do {
      oddSymbol = japaneseSymbols[Math.floor(Math.random() * japaneseSymbols.length)];
    } while (oddSymbol === baseSymbol);
    
    // Wstaw niepasujący symbol w losowe miejsce
    const oddPosition = Math.floor(Math.random() * displaySymbols.length);
    displaySymbols[oddPosition] = oddSymbol;
    
    setSymbols(displaySymbols);
    setCorrectAnswer(oddSymbol);
    
    // Opcje do wyboru - zawsze zawierają dokładnie niepasujący symbol i jeden z pasujących
    setOptions([baseSymbol, oddSymbol]);
    
    setPuzzleDescription('Znajdź symbol, który nie pasuje do pozostałych');
  }, []);

  // Generowanie zagadki w zależności od wybranego wzoru
  const generatePuzzle = useCallback(() => {
    const patterns: PuzzlePattern[] = ['sequence', 'matching', 'oddOne'];
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setPattern(selectedPattern);
    
    switch (selectedPattern) {
      case 'sequence':
        generateSequence();
        break;
      case 'matching':
        generateMatching();
        break;
      case 'oddOne':
        generateOddOne();
        break;
    }
  }, [generateSequence, generateMatching, generateOddOne]);

  // Inicjalizacja zagadki
  useEffect(() => {
    if (isActive) {
      setTimeLeft(10);
      setSelectedAnswer(null);
      generatePuzzle();
    }
  }, [isActive, generatePuzzle]);

  // Odliczanie czasu
  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      onTimeout();
    }
  }, [timeLeft, isActive, onTimeout]);

  // Sprawdzanie odpowiedzi
  const checkAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    
    setTimeout(() => {
      if (answer === correctAnswer) {
        onSolve();
      } else {
        onFail();
      }
    }, 500);
  }, [correctAnswer, onSolve, onFail]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Rozwiąż zagadkę</h2>
          <p className="text-gray-300 mb-4">{puzzleDescription}</p>
          <div className="text-amber-500 text-lg font-bold">
            Czas: {timeLeft}s
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {symbols.map((symbol, index) => (
            <div 
              key={index}
              className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-md text-2xl"
            >
              {symbol}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => checkAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`w-16 h-16 text-3xl rounded-md transition-colors ${
                selectedAnswer === option 
                  ? option === correctAnswer 
                    ? 'bg-green-600' 
                    : 'bg-red-600' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Puzzle;
