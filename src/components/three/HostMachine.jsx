import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const HOST_GLB_PATH = '/models/host-laptop-web.glb'

const EXPECTED_HOST_NODES = [
  'HostLaptop_Root',
  'Laptop_Base',
  'Laptop_Display',
  'Laptop_Keyboard',
  'Laptop_Trackpad',
  'USB_C_Port',
  'USB_C_Port_Interior',
]

function geometryCenterWorld(object, target = new THREE.Vector3()) {
  object.geometry.computeBoundingBox()
  object.geometry.boundingBox.getCenter(target)
  return object.localToWorld(target)
}

function localAxis(index) {
  if (index === 0) return new THREE.Vector3(1, 0, 0)
  if (index === 1) return new THREE.Vector3(0, 1, 0)
  return new THREE.Vector3(0, 0, 1)
}

function textureCount(materials) {
  const textures = new Set()
  materials.forEach((entry) => {
    Object.values(entry).forEach((value) => {
      if (value?.isTexture) textures.add(value.uuid)
    })
  })
  return textures.size
}

export function HostMachine({ connectionProfile, debug, onReady }) {
  const { scene } = useGLTF(HOST_GLB_PATH)
  const group = useRef()
  const portLight = useRef()

  const asset = useMemo(() => {
    const nodes = new Map()
    const materials = new Map()
    let meshObjects = 0
    let triangles = 0

    scene.traverse((object) => {
      nodes.set(object.name, object)
      if (!object.isMesh) return
      meshObjects += 1
      const geometry = object.geometry
      triangles += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
      const entries = Array.isArray(object.material) ? object.material : [object.material]
      entries.filter(Boolean).forEach((entry) => materials.set(entry.uuid, entry))
    })

    return { materials, meshObjects, nodes, triangles: Math.round(triangles) }
  }, [scene])

  useLayoutEffect(() => {
    const sceneRoot = group.current
    const assetRoot = asset.nodes.get('HostLaptop_Root')
    const port = asset.nodes.get('USB_C_Port')
    const interior = asset.nodes.get('USB_C_Port_Interior')
    if (!sceneRoot || !assetRoot || !port || !interior) return undefined

    sceneRoot.updateWorldMatrix(true, true)
    const portCenter = geometryCenterWorld(port)
    const interiorCenter = geometryCenterWorld(interior)
    const insertionWorld = interiorCenter.clone().sub(portCenter).normalize()

    port.geometry.computeBoundingBox()
    interior.geometry.computeBoundingBox()
    const portSize = port.geometry.boundingBox.getSize(new THREE.Vector3())
    const interiorSize = interior.geometry.boundingBox.getSize(new THREE.Vector3())
    const dimensions = [portSize.x, portSize.y, portSize.z]
    const depthAxis = [interiorSize.x, interiorSize.y, interiorSize.z]
      .indexOf(Math.max(interiorSize.x, interiorSize.y, interiorSize.z))
    const crossAxes = [0, 1, 2].filter((index) => index !== depthAxis)
    const heightAxis = crossAxes.sort((a, b) => dimensions[a] - dimensions[b])[0]
    const heightWorld = localAxis(heightAxis).transformDirection(port.matrixWorld)
    if (heightWorld.y < 0) heightWorld.negate()

    const rootQuaternion = assetRoot.getWorldQuaternion(new THREE.Quaternion())
    const inverseRootQuaternion = rootQuaternion.clone().invert()
    const insertionLocal = insertionWorld.clone().applyQuaternion(inverseRootQuaternion).normalize()
    const heightLocal = heightWorld.clone().applyQuaternion(inverseRootQuaternion)
      .addScaledVector(insertionLocal, -heightWorld.dot(insertionWorld))
      .normalize()
    const widthLocal = insertionLocal.clone().cross(heightLocal).normalize()

    const usbPortAnchor = new THREE.Object3D()
    usbPortAnchor.name = 'usbPortAnchor'
    usbPortAnchor.position.copy(assetRoot.worldToLocal(portCenter.clone()))
    usbPortAnchor.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(insertionLocal, heightLocal, widthLocal),
    )
    assetRoot.add(usbPortAnchor)
    assetRoot.updateWorldMatrix(true, true)

    const debugObjects = []
    if (debug) {
      const axes = new THREE.AxesHelper(0.022)
      axes.name = 'USB_Port_Axes_Debug'
      usbPortAnchor.add(axes)
      const direction = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(),
        0.035,
        0x55d7d3,
        0.007,
        0.004,
      )
      direction.name = 'USB_Insertion_Direction_Debug'
      usbPortAnchor.add(direction)
      debugObjects.push(axes, direction)
    }

    portLight.current.position.copy(sceneRoot.worldToLocal(portCenter.clone()))

    const hierarchy = EXPECTED_HOST_NODES.map((name) => {
      const object = asset.nodes.get(name)
      return { name, found: Boolean(object), parent: object?.parent?.name ?? null }
    })
    const missing = hierarchy.filter((entry) => !entry.found).map((entry) => entry.name)
    const materialList = [...asset.materials.values()]
    const display = asset.nodes.get('Laptop_Display')
    const displayMaterials = (Array.isArray(display?.material) ? display.material : [display?.material])
      .filter(Boolean)

    console.groupCollapsed('[ND-01] Production host asset validation')
    console.table(hierarchy)
    if (missing.length) console.error(`[ND-01] Missing host nodes: ${missing.join(', ')}`)
    else console.info(`[ND-01] All ${EXPECTED_HOST_NODES.length} host nodes ready.`)
    console.info(`[ND-01] USB-C insertion axis: (${insertionWorld.x.toFixed(4)}, ${insertionWorld.y.toFixed(4)}, ${insertionWorld.z.toFixed(4)})`)
    console.info(`[ND-01] Display materials: ${displayMaterials.map((entry) => entry.name).join(', ')}`)
    console.groupEnd()

    onReady({
      assetRoot,
      display,
      displayMaterials,
      group: sceneRoot,
      hierarchy,
      materials: {
        all: materialList,
        portInterior: asset.nodes.get('USB_C_Port_Interior')?.material ?? null,
        portMetal: asset.nodes.get('USB_C_Port')?.material ?? null,
      },
      missing,
      nodes: asset.nodes,
      port: {
        anchor: usbPortAnchor,
        cavityDepth: Math.max(interiorSize.x, interiorSize.y, interiorSize.z),
        insertionDirectionLocal: new THREE.Vector3(1, 0, 0),
        opening: { height: dimensions[heightAxis], width: dimensions[crossAxes.find((axis) => axis !== heightAxis)] },
      },
      portLight: portLight.current,
      stats: {
        materials: materialList.length,
        meshObjects: asset.meshObjects,
        textures: textureCount(materialList),
        triangles: asset.triangles,
      },
    })

    return () => {
      debugObjects.forEach((object) => object.removeFromParent())
      usbPortAnchor.removeFromParent()
    }
  }, [asset, debug, onReady])

  return (
    <group
      ref={group}
      name="HostLaptopSceneRoot"
      position={connectionProfile.hostHiddenPosition}
      rotation={connectionProfile.hostRotation}
      scale={connectionProfile.hostScale}
    >
      <primitive object={scene} />
      <pointLight ref={portLight} color="#55d7d3" intensity={0} distance={0.42} decay={2.2} />
    </group>
  )
}

useGLTF.preload(HOST_GLB_PATH)
