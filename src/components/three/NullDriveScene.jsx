import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { NullDriveModel } from './NullDriveModel.jsx'
import { SceneLighting } from './SceneLighting.jsx'
import { HostMachine } from './HostMachine.jsx'
import { HostInternals } from './HostInternals.jsx'

function CameraRig({ cameraApi, profile }) {
  const { camera, invalidate, setFrameloop } = useThree()
  const target = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    camera.position.set(...profile.camera)
    camera.fov = 34
    camera.near = 0.01
    camera.far = 100
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    cameraApi.current = { camera, invalidate, setFrameloop, target: target.current }
  }, [camera, invalidate, profile, setFrameloop])

  useFrame(() => camera.lookAt(target.current.x, target.current.y, target.current.z))

  return null
}

export function NullDriveScene({ connectionProfile, debug, profile, onReady }) {
  const lightingApi = useRef({})
  const cameraApi = useRef({})
  const hostApi = useRef(null)
  const internalsApi = useRef(null)
  const [modelApi, setModelApi] = useState(null)
  const [hostReady, setHostReady] = useState(false)
  const [internalsReady, setInternalsReady] = useState(false)

  const handleHostReady = useCallback((api) => {
    hostApi.current = api
    setHostReady(true)
  }, [])

  const handleInternalsReady = useCallback((api) => {
    internalsApi.current = api
    setInternalsReady(true)
  }, [])

  useEffect(() => {
    if (!modelApi || !hostReady || !internalsReady || !cameraApi.current.camera) return
    onReady({
      ...modelApi,
      camera: cameraApi.current.camera,
      cameraTarget: cameraApi.current.target,
      host: hostApi.current,
      internals: internalsApi.current,
      invalidate: cameraApi.current.invalidate,
      setFrameloop: cameraApi.current.setFrameloop,
    })
  }, [hostReady, internalsReady, modelApi, onReady])

  return (
    <Suspense fallback={null}>
      <CameraRig cameraApi={cameraApi} profile={profile} />
      <SceneLighting lightingApi={lightingApi} />
      <HostMachine connectionProfile={connectionProfile} debug={debug} onReady={handleHostReady} />
      <HostInternals onReady={handleInternalsReady} />
      <NullDriveModel profile={profile} lightingApi={lightingApi} onReady={setModelApi} />
    </Suspense>
  )
}
