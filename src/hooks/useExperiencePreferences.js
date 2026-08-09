import { useEffect, useState } from 'react'
import { profileForWidth, SCENE_PROFILES } from '../animation/sceneConfig.js'

function readPreferences() {
  const profileKey = profileForWidth(window.innerWidth)
  return {
    debug: new URLSearchParams(window.location.search).get('debug') === 'true',
    profileKey,
    profile: SCENE_PROFILES[profileKey],
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

export function useExperiencePreferences() {
  const [preferences, setPreferences] = useState(readPreferences)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setPreferences(readPreferences()))
    }
    window.addEventListener('resize', update)
    motionQuery.addEventListener('change', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      motionQuery.removeEventListener('change', update)
    }
  }, [])

  return preferences
}
