import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/app/taluo/TaluoClient.tsx', 'utf8');

// 找到 startReading 函数的起止
const startMarker = '  const startReading = useCallback(';
const endMarker = '  // Reset to menu';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx < 0 || endIdx < 0) {
  console.error('Cant find startReading function bounds');
  process.exit(1);
}

const oldFunc = content.substring(startIdx, endIdx);

const newFunc = `  const startReading = useCallback(
    (spreadId: string) => {
      setSelectedSpread(spreadId)
      setPhase('shuffling')
      setShowInterpretation(false)
      setFlippedIndices(new Set())
      setVisibleInterpretation(false)
      setReadingTab('core')

      // 清理之前的定时器
      timersRef.current.forEach(t => clearTimeout(t))
      timersRef.current = []

      const cards = drawForSpread(spreadId)
      setDrawnCards(cards)

      let idx = 0
      setShuffleText(SHUFFLE_TEXTS[0])
      shufflerRef.current = setInterval(() => {
        idx = (idx + 1) % SHUFFLE_TEXTS.length
        setShuffleText(SHUFFLE_TEXTS[idx])
      }, 700)

      const t1 = setTimeout(() => {
        if (shufflerRef.current) clearInterval(shufflerRef.current)
        setPhase('placing')

        const t2 = setTimeout(() => {
          setPhase('reading')
          const count = cards.length
          for (let i = 0; i < count; i++) {
            const delay = 400 + i * 500
            const tFlip = setTimeout(() => {
              setFlippedIndices((prev) => new Set(prev).add(i))
              if (i === count - 1) {
                const tShow = setTimeout(() => {
                  setShowInterpretation(true)
                  const tVis = setTimeout(() => setVisibleInterpretation(true), 100)
                  timersRef.current.push(tVis)
                }, 800)
                timersRef.current.push(tShow)
              }
            }, delay)
            timersRef.current.push(tFlip)
          }
        }, 1200)
        timersRef.current.push(t2)
      }, 2500)
      timersRef.current.push(t1)
    },
    [],
  )
`;

content = content.substring(0, startIdx) + newFunc + content.substring(endIdx);
writeFileSync('src/app/taluo/TaluoClient.tsx', content);
console.log('DONE - startReading replaced');
