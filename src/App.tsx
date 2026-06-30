import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './App.module.css'
import { GameView } from './components/Game/GameView'
import { OnlineFlow } from './components/Online/OnlineFlow'
import { Setup } from './components/Setup/Setup'
import { Splash } from './components/Splash/Splash'
import { useGameStore } from './game/store'
import { parseJoinPinFromUrl } from './online/joinUrl'
import { useOnlineStore } from './online/onlineStore'

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const onlineScreen = useOnlineStore((s) => s.screen)

  useEffect(() => {
    if (parseJoinPinFromUrl()) {
      useOnlineStore.getState().bindSocketEvents()
      useOnlineStore.setState({ screen: 'join' })
    }
  }, [])

  const exitOnline = () => useOnlineStore.getState().reset()

  if (onlineScreen !== 'idle') {
    return (
      <div className={styles.app}>
        <OnlineFlow onExit={exitOnline} />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <motion.div
            key="splash"
            className={styles.screen}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
          >
            <Splash />
          </motion.div>
        )}
        {screen === 'setup' && (
          <motion.div
            key="setup"
            className={styles.screen}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
          >
            <Setup />
          </motion.div>
        )}
        {screen === 'game' && (
          <motion.div
            key="game"
            className={styles.screen}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28 }}
          >
            <GameView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
