import { Suspense, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { NullDriveModel } from './NullDriveModel.jsx'
import { SceneLighting } from './SceneLighting.jsx'

function StableCamera({ profile }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(...profile.camera)
    camera.fov = 34
    camera.near = 0.01
    camera.far = 100
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, profile])

  return null
}

export function NullDriveScene({ profile, onReady }) {
  const lightingApi = useRef({})

  return (
    <Suspense fallback={null}>
      <StableCamera profile={profile} />
      <SceneLighting lightingApi={lightingApi} />
      <NullDriveModel profile={profile} lightingApi={lightingApi} onReady={onReady} />
    </Suspense>
  )
}
