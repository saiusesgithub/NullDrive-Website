import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { LIGHTING_STATES } from '../../animation/sceneConfig.js'

export function SceneLighting({ lightingApi }) {
  const { gl, scene } = useThree()
  const initial = LIGHTING_STATES.initial

  useLayoutEffect(() => {
    const generator = new THREE.PMREMGenerator(gl)
    const environment = generator.fromScene(new RoomEnvironment(), 0.03).texture
    const previousEnvironment = scene.environment
    const previousEnvironmentIntensity = scene.environmentIntensity
    scene.environment = environment
    scene.environmentIntensity = initial.environment
    lightingApi.current.environment = {
      get intensity() { return scene.environmentIntensity },
      set intensity(value) { scene.environmentIntensity = value },
    }
    return () => {
      scene.environment = previousEnvironment
      scene.environmentIntensity = previousEnvironmentIntensity
      delete lightingApi.current.environment
      environment.dispose()
      generator.dispose()
    }
  }, [gl, initial.environment, lightingApi, scene])

  return (
    <>
      <ambientLight ref={(light) => { lightingApi.current.ambient = light }} intensity={initial.ambient} />
      <directionalLight
        ref={(light) => { lightingApi.current.key = light }}
        position={[-3.5, 4.5, 3]}
        intensity={initial.key}
        color="#d8e4e8"
      />
      <directionalLight
        ref={(light) => { lightingApi.current.rim = light }}
        position={[4, 1.8, -3]}
        intensity={initial.rim}
        color="#86bdc6"
      />
      <directionalLight
        ref={(light) => { lightingApi.current.fill = light }}
        position={[-2, -1, -3]}
        intensity={initial.fill}
        color="#52686e"
      />
      <directionalLight
        ref={(light) => { lightingApi.current.underside = light }}
        position={[1, -3, 2]}
        intensity={initial.underside}
        color="#6f858b"
      />
      <directionalLight
        ref={(light) => { lightingApi.current.host = light }}
        position={[4.5, 1.4, 3.5]}
        intensity={0}
        color="#9bb9bd"
      />
    </>
  )
}
