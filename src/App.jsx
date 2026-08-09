import { Component, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { NullDriveScene } from './components/three/NullDriveScene.jsx'
import { ChapterOne } from './components/chapters/ChapterOne.jsx'
import { ChapterTwo } from './components/chapters/ChapterTwo.jsx'
import { useExperiencePreferences } from './hooks/useExperiencePreferences.js'

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('[ND-01] WebGL scene failed:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="webgl-error" role="alert">
          <span>ND-01 / VISUAL SYSTEM UNAVAILABLE</span>
          <strong>THE PRODUCT STORY COULD NOT BE RENDERED.</strong>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const { connectionProfile, debug, profileKey, profile, reducedMotion } = useExperiencePreferences()
  const [sceneApi, setSceneApi] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const handleSceneReady = useCallback((api) => {
    setSceneApi(api)
    setLoaded(true)
  }, [])

  return (
    <main className={`cinematic-app profile-${profileKey}${reducedMotion ? ' reduced-motion' : ''}`}>
      <div className="webgl-layer" aria-hidden="true">
        <WebGLErrorBoundary>
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: profile.camera, fov: 34, near: 0.01, far: 100 }}
            onCreated={({ gl }) => gl.setClearColor('#020304')}
          >
            <NullDriveScene connectionProfile={connectionProfile} debug={debug} profile={profile} onReady={handleSceneReady} />
          </Canvas>
        </WebGLErrorBoundary>
      </div>

      <div className={`loading-state${loaded ? ' loading-state--complete' : ''}`} aria-live="polite">
        <span>NULL//DRIVE</span>
        <i />
        <span>{loaded ? 'SYSTEM READY' : 'INITIALIZING'}</span>
      </div>

      <ChapterOne
        debug={debug}
        profile={profile}
        reducedMotion={reducedMotion}
        sceneApi={sceneApi}
      />

      <ChapterTwo
        connectionProfile={connectionProfile}
        debug={debug}
        profile={profile}
        reducedMotion={reducedMotion}
        sceneApi={sceneApi}
      />

      <div className="future-chapters-placeholder" aria-hidden="true" />
    </main>
  )
}
