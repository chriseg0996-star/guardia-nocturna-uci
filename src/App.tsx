import { AnimatePresence, motion } from 'framer-motion'
import styles from './App.module.css'
import { GameView } from './components/Game/GameView'
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
            <Splash />
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
            <GameView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
