import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { NullDriveModel } from './NullDriveModel.jsx'
import { SceneLighting } from './SceneLighting.jsx'
import { HostMachine } from './HostMachine.jsx'

function CameraRig({ cameraApi, profile }) {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    camera.position.set(...profile.camera)
    camera.fov = 34
    camera.near = 0.01
    camera.far = 100
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    cameraApi.current = { camera, target: target.current }
  }, [camera, profile])

  useFrame(() => camera.lookAt(target.current.x, target.current.y, target.current.z))

  return null
}

export function NullDriveScene({ connectionProfile, debug, profile, onReady }) {
  const lightingApi = useRef({})
  const cameraApi = useRef({})
  const hostApi = useRef(null)
  const [modelApi, setModelApi] = useState(null)
  const [hostReady, setHostReady] = useState(false)

  const handleHostReady = useCallback((api) => {
    hostApi.current = api
    setHostReady(true)
  }, [])

  useEffect(() => {
    if (!modelApi || !hostReady || !cameraApi.current.camera) return
    onReady({ ...modelApi, camera: cameraApi.current.camera, cameraTarget: cameraApi.current.target, host: hostApi.current })
  }, [hostReady, modelApi, onReady])

  return (
    <Suspense fallback={null}>
      <CameraRig cameraApi={cameraApi} profile={profile} />
      <SceneLighting lightingApi={lightingApi} />
      <HostMachine connectionProfile={connectionProfile} debug={debug} onReady={handleHostReady} />
      <NullDriveModel profile={profile} lightingApi={lightingApi} onReady={setModelApi} />
    </Suspense>
  )
}
