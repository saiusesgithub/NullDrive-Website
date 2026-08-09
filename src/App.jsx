import { Component, Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { NullDriveScene } from './components/NullDriveScene.jsx'

const EXPECTED_NODE_COUNT = 22

class AssetErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    this.props.onError(error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="asset-error" role="alert">
          <strong>GLB LOAD FAILED</strong>
          <span>{this.state.error.message}</span>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [mode, setMode] = useState('assembled')
  const [assetStatus, setAssetStatus] = useState('loading')
  const [nodeReport, setNodeReport] = useState({ found: 0, missing: [], triangles: 0, textures: 0 })
  const [rootRotation, setRootRotation] = useState(0)
  const [resetToken, setResetToken] = useState(0)

  const handleLoaded = useCallback((report) => {
    setAssetStatus('loaded')
    setNodeReport(report)
  }, [])

  const handleError = useCallback(() => setAssetStatus('failed'), [])

  const resetView = () => {
    setMode('assembled')
    setRootRotation(0)
    setResetToken((token) => token + 1)
  }

  return (
    <main className="validation-shell">
      <header className="masthead">
        <div>
          <span className="wordmark">NULL//DRIVE</span>
          <span className="model">ND-01</span>
        </div>
        <span className="test-label"><i /> WEBGL TEST</span>
      </header>

      <section className="viewport" aria-label="Interactive NullDrive model validation">
        <AssetErrorBoundary onError={handleError}>
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [2.7, 1.65, 3.25], fov: 34, near: 0.01, far: 100 }}
            onCreated={({ gl }) => {
              gl.setClearColor('#050708')
              gl.domElement.dataset.renderer = 'webgl'
            }}
          >
            <Suspense fallback={null}>
              <NullDriveScene
                mode={mode}
                rootRotation={rootRotation}
                resetToken={resetToken}
                onLoaded={handleLoaded}
              />
            </Suspense>
          </Canvas>
        </AssetErrorBoundary>
        <Loader
          containerStyles={{ background: '#050708' }}
          innerStyles={{ background: '#20282b', width: '180px', height: '1px' }}
          barStyles={{ background: '#4ed5d1', height: '1px' }}
          dataStyles={{ color: '#718084', fontSize: '10px', letterSpacing: '0.16em' }}
        />
        <div className="axis-mark axis-mark--x">X</div>
        <div className="axis-mark axis-mark--z">Z</div>
      </section>

      <footer className="control-deck">
        <div className="buttons" role="group" aria-label="Model configuration">
          <button className={mode === 'assembled' ? 'active' : ''} onClick={() => setMode('assembled')}>
            ASSEMBLED
          </button>
          <button className={mode === 'exploded' ? 'active' : ''} onClick={() => setMode('exploded')}>
            EXPLODED
          </button>
          <button onClick={resetView}>RESET VIEW</button>
        </div>

        <label className="rotation-control">
          <span>ROOT ROTATION</span>
          <input
            aria-label="Root rotation"
            type="range"
            min="-180"
            max="180"
            value={rootRotation}
            onChange={(event) => setRootRotation(Number(event.target.value))}
          />
          <output>{rootRotation}&deg;</output>
          <button type="button" aria-label="Rotate root clockwise" onClick={() => setRootRotation((angle) => angle >= 135 ? -180 : angle + 45)}>
            +45&deg;
          </button>
        </label>

        <dl className="debug-panel">
          <div><dt>GLB</dt><dd className={`status-${assetStatus}`}>{assetStatus.toUpperCase()}</dd></div>
          <div><dt>MAJOR NODES</dt><dd>{nodeReport.found} / {EXPECTED_NODE_COUNT}</dd></div>
          <div><dt>MODE</dt><dd>{mode.toUpperCase()}</dd></div>
          <div><dt>RENDERER</dt><dd>WEBGL</dd></div>
          <div><dt>TRIANGLES</dt><dd>{nodeReport.triangles.toLocaleString()}</dd></div>
          <div><dt>TEXTURES</dt><dd>{nodeReport.textures}</dd></div>
          {nodeReport.missing.length > 0 && <div className="missing"><dt>MISSING</dt><dd>{nodeReport.missing.join(', ')}</dd></div>}
        </dl>
      </footer>
    </main>
  )
}
