import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { EXPLODED_OFFSETS, GLB_PATH, REQUIRED_NODES } from '../../animation/sceneConfig.js'

function detectSeparationAxis(root) {
  root.updateWorldMatrix(true, true)
  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3())
  const dimensions = [
    { label: 'X', value: size.x, direction: new THREE.Vector3(1, 0, 0) },
    { label: 'Y', value: size.y, direction: new THREE.Vector3(0, 1, 0) },
    { label: 'Z', value: size.z, direction: new THREE.Vector3(0, 0, 1) },
  ]
  const vertical = dimensions.reduce((smallest, dimension) => dimension.value < smallest.value ? dimension : smallest)
  const inverseRoot = root.matrixWorld.clone().invert()
  const localOrigin = new THREE.Vector3().applyMatrix4(inverseRoot)
  const localDirection = vertical.direction.clone().applyMatrix4(inverseRoot).sub(localOrigin).normalize()
  return { label: vertical.label, localDirection, size }
}

export function NullDriveModel({ profile, lightingApi, onReady }) {
  const { scene } = useGLTF(GLB_PATH)
  const presentation = useRef()

  const nodes = useMemo(() => {
    const result = new Map()
    scene.traverse((object) => {
      if (REQUIRED_NODES.includes(object.name)) result.set(object.name, object)
    })
    return result
  }, [scene])

  useLayoutEffect(() => {
    const root = nodes.get('NullDrive_Root')
    if (!root || !presentation.current) return

    const missing = REQUIRED_NODES.filter((name) => !nodes.has(name))
    const originals = new Map()
    Object.keys(EXPLODED_OFFSETS).forEach((name) => {
      const object = nodes.get(name)
      if (!object) return
      originals.set(name, {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone(),
      })
    })

    const axis = detectSeparationAxis(root)
    const hierarchy = REQUIRED_NODES.map((name) => {
      const object = nodes.get(name)
      return { name, parent: object?.parent?.name ?? null, found: Boolean(object) }
    })

    console.groupCollapsed('[ND-01] Chapter 1 asset validation')
    console.table(hierarchy)
    if (missing.length) console.error(`[ND-01] Missing nodes: ${missing.join(', ')}`)
    else console.info(`[ND-01] All ${REQUIRED_NODES.length} cinematic nodes ready.`)
    console.info(
      `[ND-01] Separation axis: world ${axis.label}; root-local ` +
      `(${axis.localDirection.x.toFixed(3)}, ${axis.localDirection.y.toFixed(3)}, ${axis.localDirection.z.toFixed(3)}).`,
    )
    console.groupEnd()

    const ledMaterial = nodes.get('Status_LED')?.material ?? null
    const seamMaterial = nodes.get('Seam_Accent')?.material ?? null
    onReady({
      axis: axis.localDirection,
      hierarchy,
      lighting: lightingApi.current,
      materials: {
        led: ledMaterial,
        seam: seamMaterial,
        ledIntensity: ledMaterial?.emissiveIntensity ?? 1,
        seamIntensity: seamMaterial?.emissiveIntensity ?? 1,
      },
      missing,
      nodes,
      originals,
      presentation: presentation.current,
      root,
      rootOriginalPosition: root.position.clone(),
      rootOriginalRotation: root.rotation.clone(),
      scene,
    })
  }, [lightingApi, nodes, onReady, scene])

  return (
    <group
      ref={presentation}
      scale={profile.initialScale}
      rotation={[0, -0.2, 0]}
      position={[0, 0.02, 0]}
    >
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(GLB_PATH)
