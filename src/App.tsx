import { AnimatePresence, motion } from 'framer-motion'
import styles from './App.module.css'
import { GamePlaceholder } from './components/GamePlaceholder/GamePlaceholder'
import { Setup } from './components/Setup/Setup'
import { Splash } from './components/Splash/Splash'
import { useGameStore } from './game/store'

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className={styles.app}>
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <motion.div
            key="splash"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
            style={{ height: '100%' }}
          >
            <Splash onStart={() => setScreen('setup')} />
          </motion.div>
        )}
        {screen === 'setup' && (
          <motion.div
            key="setup"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
            style={{ height: '100%' }}
          >
            <Setup />
          </motion.div>
        )}
        {screen === 'game' && (
          <motion.div
            key="game"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
            style={{ height: '100%' }}
          >
            <GamePlaceholder />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
