import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const GLB_PATH = '/models/null-drive-nd01-web.glb'

export const REQUIRED_NODES = [
  'NullDrive_Root',
  'Shell_Top',
  'Upper_Shield',
  'PCB_Main',
  'Internal_Frame',
  'Lower_Shield',
  'Shell_Bottom',
  'Connector_Housing',
  'USB_C_Connector',
  'USB_C_Tongue',
  'Status_LED',
  'Seam_Accent',
  'Brand_NULLDRIVE',
  'Brand_ND01',
  'Controller_IC',
  'NAND_01',
  'NAND_02',
  'Power_Management',
  'ESD_Protection',
  'Passive_Components',
  'PCB_Traces',
  'LED_Assembly',
]

const EXPLODE_OFFSETS = {
  Shell_Top: 0.038,
  Upper_Shield: 0.024,
  PCB_Main: 0.010,
  Internal_Frame: -0.010,
  Lower_Shield: -0.024,
  Shell_Bottom: -0.038,
}

function ResponsiveModel({ mode, rootRotation, onLoaded }) {
  const { scene } = useGLTF(GLB_PATH)
  const { size } = useThree()
  const presentationGroup = useRef()
  const originals = useRef(new Map())
  const rootOriginalRotation = useRef(null)

  const nodes = useMemo(() => {
    const result = new Map()
    scene.traverse((object) => {
      if (REQUIRED_NODES.includes(object.name)) result.set(object.name, object)
    })
    return result
  }, [scene])

  useLayoutEffect(() => {
    Object.keys(EXPLODE_OFFSETS).forEach((name) => {
      const object = nodes.get(name)
      if (!object) return
      originals.current.set(name, {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone(),
      })
    })

    const root = nodes.get('NullDrive_Root')
    if (root) rootOriginalRotation.current = root.rotation.clone()

    const missing = REQUIRED_NODES.filter((name) => !nodes.has(name))
    let triangles = 0
    const textures = new Set()
    scene.traverse((object) => {
      if (object.isMesh) {
        const geometry = object.geometry
        triangles += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
      }
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : []
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) textures.add(value.uuid)
        })
      })
    })
    const hierarchy = REQUIRED_NODES.map((name) => {
      const object = nodes.get(name)
      return { name, parent: object?.parent?.name ?? null, found: Boolean(object) }
    })

    console.groupCollapsed('[ND-01] GLB hierarchy validation')
    console.table(hierarchy)
    if (missing.length) console.error(`[ND-01] Missing nodes: ${missing.join(', ')}`)
    else console.info(`[ND-01] All ${REQUIRED_NODES.length} required nodes detected.`)
    console.groupEnd()

    onLoaded({ found: REQUIRED_NODES.length - missing.length, missing, triangles, textures: textures.size })
  }, [nodes, onLoaded])

  useEffect(() => {
    const root = nodes.get('NullDrive_Root')
    if (!root || !rootOriginalRotation.current) return
    root.rotation.copy(rootOriginalRotation.current)
    root.rotation.y += THREE.MathUtils.degToRad(rootRotation)
  }, [nodes, rootRotation])

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-delta * 7)
    Object.entries(EXPLODE_OFFSETS).forEach(([name, offset]) => {
      const object = nodes.get(name)
      const original = originals.current.get(name)
      if (!object || !original) return
      const targetY = original.position.y + (mode === 'exploded' ? offset : 0)
      object.position.y = THREE.MathUtils.lerp(object.position.y, targetY, blend)
    })
  })

  const modelScale = size.width < 520 ? 14 : size.width < 820 ? 18 : 23

  return (
    <group ref={presentationGroup} scale={modelScale} rotation={[0, -0.2, 0]} position={[0, 0.08, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function StudioEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl)
    const environment = generator.fromScene(new RoomEnvironment(), 0.03).texture
    const previousEnvironment = scene.environment
    scene.environment = environment
    return () => {
      scene.environment = previousEnvironment
      environment.dispose()
      generator.dispose()
    }
  }, [gl, scene])

  return null
}

export function NullDriveScene({ mode, rootRotation, resetToken, onLoaded }) {
  const controls = useRef()

  useEffect(() => {
    if (!controls.current) return
    controls.current.reset()
  }, [resetToken])

  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#b9c6ca', '#030405', 0.34]} />
      <directionalLight position={[-3.5, 4.5, 3]} intensity={3.2} color="#d8e4e8" />
      <directionalLight position={[4, 1.8, -3]} intensity={2.1} color="#86bdc6" />
      <directionalLight position={[-2, -1, -3]} intensity={0.8} color="#52686e" />
      <directionalLight position={[1, -3, 2]} intensity={1.15} color="#6f858b" />

      <ResponsiveModel mode={mode} rootRotation={rootRotation} onLoaded={onLoaded} />

      <ContactShadows position={[0, -0.47, 0]} opacity={0.48} scale={5} blur={2.8} far={2.2} resolution={512} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#050708" />
      </mesh>

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.075}
        enablePan={false}
        minDistance={2.2}
        maxDistance={6.2}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI * 0.72}
        target={[0, 0, 0]}
      />
    </>
  )
}

useGLTF.preload(GLB_PATH)
