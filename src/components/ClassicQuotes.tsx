'use client';

import { useState, useEffect } from 'react';

const quotes = [
  { text: '天行健，君子以自强不息。', source: '《易经·乾卦》' },
  { text: '地势坤，君子以厚德载物。', source: '《易经·坤卦》' },
  { text: '人法地，地法天，天法道，道法自然。', source: '《道德经》' },
  { text: '天地之间，气象万千，命运之道，吉凶悔吝。', source: '《紫微斗数全书》·陈希夷' },
  { text: '天道有寒暖，地道有燥湿，人道有贵贱。', source: '《滴天髓》·刘伯温注' },
  { text: '不知命，无以为君子也。', source: '《论语·尧曰》' },
  { text: '积善之家，必有余庆；积不善之家，必有余殃。', source: '《易经·坤卦》' },
  { text: '一阴一阳之谓道。', source: '《易经·系辞》' },
  { text: '易，穷则变，变则通，通则久。', source: '《易经·系辞》' },
];

export default function ClassicQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const quote = quotes[index];

  return (
    <div className="py-6 text-center">
      <div className="max-w-2xl mx-auto px-4">
        <blockquote className="text-lg md:text-xl text-gold-600 font-serif transition-opacity duration-700 leading-relaxed">
          「{quote.text}」
        </blockquote>
        <p className="text-xs text-gray-500 mt-2">{quote.source}</p>
      </div>
    </div>
  );
}
