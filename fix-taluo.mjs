import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/app/taluo/TaluoClient.tsx', 'utf8');

const oldStr = `      // Start shuffle text rotation
      let idx = 0
      setShuffleText(SHUFFLE_TEXTS[0])
      shufflerRef.current = setInterval(() => {
        idx = (idx + 1) % SHUFFLE_TEXTS.length
        setShuffleText(SHUFFLE_TEXTS[idx])
      }, 700)

      // After 2.5s
      setTimeout(() => {
        if (shufflerRef.current) clearInterval(shufflerRef.current)
        setPhase('placing')

        // After 1.2s for cards to animate in
        setTimeout(() => {
          setPhase('reading')
          const count = cards.length
          for (let i = 0; i < count; i++) {
            const delay = 400 + i * 500
            setTimeout(() => {
              setFlippedIndices((prev) => new Set(prev).add(i))
              if (i === count - 1) {
                setTimeout(() => {
                  setShowInterpretation(true)
                  setTimeout(() => setVisibleInterpretation(true), 100)
                }, 800)
              }
            }, delay)
          }
        }, 1200)
      }, 2500)`;

const newStr = `      // Start shuffle text rotation
      let idx = 0
      setShuffleText(SHUFFLE_TEXTS[0])
      shufflerRef.current = setInterval(() => {
        idx = (idx + 1) % SHUFFLE_TEXTS.length
        setShuffleText(SHUFFLE_TEXTS[idx])
      }, 700)

      // 清理之前的定时器
      timersRef.current.forEach(t => clearTimeout(t))
      timersRef.current = []

      // After 2.5s
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
                  const tVisible = setTimeout(() => setVisibleInterpretation(true), 100)
                  timersRef.current.push(tVisible)
                }, 800)
                timersRef.current.push(tShow)
              }
            }, delay)
            timersRef.current.push(tFlip)
          }
        }, 1200)
        timersRef.current.push(t2)
      }, 2500)
      timersRef.current.push(t1)`;

if (content.includes(oldStr)) {
  const result = content.replace(oldStr, newStr);
  writeFileSync('src/app/taluo/TaluoClient.tsx', result);
  console.log('DONE');
} else {
  console.log('NOT FOUND');
  process.exit(1);
}
