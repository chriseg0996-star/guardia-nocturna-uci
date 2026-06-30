import { useEffect } from 'react'
import { useGameStore } from '../game/store'
import { useOnlineStore } from '../online/onlineStore'

/** Android / browser back → previous screen or menú principal. */
export function useBackNavigation() {
  const screen = useGameStore((s) => s.screen)
  const onlineScreen = useOnlineStore((s) => s.screen)

  useEffect(() => {
    if (screen === 'splash' && onlineScreen === 'idle') return
    window.history.pushState({ gnucNav: true }, '')
  }, [screen, onlineScreen])

  useEffect(() => {
    const onPop = () => {
      const online = useOnlineStore.getState().screen
      if (online !== 'idle') {
        useOnlineStore.getState().reset()
        useGameStore.getState().setScreen('splash')
        return
      }

      const current = useGameStore.getState().screen
      if (current === 'game') {
        useGameStore.getState().pauseToMenu()
      } else if (current === 'setup' || current === 'quiz') {
        useGameStore.getState().setScreen('splash')
      }
    }

    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
}
