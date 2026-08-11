import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const RAM_POSITIONS = [
  [0.42, 0.082, -0.63],
  [0.66, 0.082, -0.63],
  [0.9, 0.082, -0.63],
  [0.42, 0.082, -0.39],
  [0.66, 0.082, -0.39],
  [0.9, 0.082, -0.39],
]

const PASSIVE_POSITIONS = [
  [-1.25, 0.07, 0.16], [-1.08, 0.07, 0.12], [-0.92, 0.07, 0.08],
  [-0.62, 0.07, 0.62], [-0.44, 0.07, 0.66], [-0.25, 0.07, 0.64],
  [0.15, 0.07, 0.67], [0.3, 0.07, 0.7], [0.48, 0.07, 0.72],
  [1.13, 0.07, 0.15], [1.28, 0.07, 0.12], [1.4, 0.07, 0.08],
  [-1.32, 0.07, -0.22], [-1.12, 0.07, -0.26], [-0.9, 0.07, -0.3],
  [-0.82, 0.07, -0.72], [-0.66, 0.07, -0.76], [0.06, 0.07, -0.76],
  [1.15, 0.07, -0.78], [1.31, 0.07, -0.72], [1.43, 0.07, -0.64],
  [0.2, 0.07, 0.34], [0.3, 0.07, 0.3], [0.4, 0.07, 0.26],
]

function makeCurve(points) {
  return new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, 'centripetal')
}

function makeTube(curve, radius = 0.008) {
  return new THREE.TubeGeometry(curve, 36, radius, 5, false)
}

function boardGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-1.66, -0.94)
  shape.lineTo(1.38, -0.94)
  shape.lineTo(1.65, -0.7)
  shape.lineTo(1.65, 0.72)
  shape.lineTo(1.42, 0.96)
  shape.lineTo(0.34, 0.96)
  shape.lineTo(0.16, 0.82)
  shape.lineTo(-0.72, 0.82)
  shape.lineTo(-0.9, 0.96)
  shape.lineTo(-1.66, 0.96)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.018,
    bevelThickness: 0.012,
    curveSegments: 1,
  })
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, 0.01, 0)
  return geometry
}

function HeatPipe({ geometry, material, name }) {
  return <mesh geometry={geometry} material={material} name={name} />
}

export function HostInternals({ onReady }) {
  const root = useRef()
  const pulse = useRef()
  const keyLight = useRef()
  const signalLight = useRef()
  const passives = useRef()

  const asset = useMemo(() => {
    const materials = {
      pcb: new THREE.MeshStandardMaterial({ color: '#07100f', metalness: 0.18, roughness: 0.72 }),
      chip: new THREE.MeshStandardMaterial({ color: '#080b0c', metalness: 0.3, roughness: 0.48 }),
      chipTop: new THREE.MeshStandardMaterial({ color: '#171d1f', metalness: 0.78, roughness: 0.34 }),
      structure: new THREE.MeshStandardMaterial({ color: '#151b1d', metalness: 0.82, roughness: 0.42 }),
      copper: new THREE.MeshStandardMaterial({ color: '#6e4933', metalness: 0.88, roughness: 0.34 }),
      contact: new THREE.MeshStandardMaterial({ color: '#9f7b42', metalness: 0.9, roughness: 0.28 }),
      passive: new THREE.MeshStandardMaterial({ color: '#273033', metalness: 0.4, roughness: 0.55 }),
      trace: new THREE.MeshStandardMaterial({ color: '#263b3d', metalness: 0.58, roughness: 0.48 }),
      usbActive: new THREE.MeshStandardMaterial({ color: '#102426', emissive: '#55d7d3', emissiveIntensity: 0, metalness: 0.5, roughness: 0.35 }),
      cpuActive: new THREE.MeshStandardMaterial({ color: '#182124', emissive: '#55d7d3', emissiveIntensity: 0, metalness: 0.75, roughness: 0.28 }),
      gpuActive: new THREE.MeshStandardMaterial({ color: '#102022', emissive: '#55d7d3', emissiveIntensity: 0, metalness: 0.58, roughness: 0.35 }),
      nvmeActive: new THREE.MeshStandardMaterial({ color: '#102022', emissive: '#55d7d3', emissiveIntensity: 0, metalness: 0.5, roughness: 0.4 }),
      pulse: new THREE.MeshBasicMaterial({ color: '#91fffb', toneMapped: false }),
    }
    materials.ramIndicators = RAM_POSITIONS.map(() => new THREE.MeshStandardMaterial({
      color: '#142326',
      emissive: '#55d7d3',
      emissiveIntensity: 0,
      metalness: 0.48,
      roughness: 0.42,
    }))

    const curves = {
      entry: makeCurve([[-1.75, 0.095, 0.42], [-1.48, 0.09, 0.42], [-1.18, 0.085, 0.42]]),
      bus: makeCurve([[-1.18, 0.085, 0.42], [-0.86, 0.078, 0.34], [-0.48, 0.072, 0.18]]),
      cpu: makeCurve([[-0.48, 0.072, 0.18], [-0.26, 0.078, 0.1], [0, 0.09, 0]]),
      ram: makeCurve([[-0.48, 0.072, 0.18], [-0.08, 0.07, -0.2], [0.56, 0.075, -0.48]]),
      gpu: makeCurve([[-0.48, 0.072, 0.18], [0.08, 0.074, 0.32], [0.68, 0.085, 0.5]]),
      nvme: makeCurve([[-0.48, 0.072, 0.18], [-0.6, 0.073, -0.28], [-0.55, 0.08, -0.7]]),
    }

    const activeTraceMaterials = Object.fromEntries(Object.keys(curves).map((name) => [name, new THREE.MeshBasicMaterial({
      color: '#55d7d3',
      opacity: 0,
      transparent: true,
      toneMapped: false,
    })]))

    const heatPipeA = makeTube(makeCurve([[-0.05, 0.19, 0.02], [0.35, 0.2, 0.28], [0.75, 0.19, 0.5]]), 0.035)
    const heatPipeB = makeTube(makeCurve([[0.03, 0.18, -0.02], [0.32, 0.2, -0.16], [0.88, 0.18, -0.1]]), 0.028)

    return {
      activeTraceMaterials,
      board: boardGeometry(),
      chipGeometry: new THREE.BoxGeometry(0.24, 0.065, 0.2),
      contactGeometry: new THREE.BoxGeometry(0.035, 0.012, 0.16),
      curves,
      heatPipeA,
      heatPipeB,
      materials,
      mountingGeometry: new THREE.CylinderGeometry(0.045, 0.045, 0.018, 16),
      passiveGeometry: new THREE.BoxGeometry(0.07, 0.035, 0.035),
      pulseGeometry: new THREE.SphereGeometry(0.015, 12, 8),
      traceGeometries: Object.fromEntries(Object.entries(curves).map(([name, curve]) => [name, makeTube(curve)])),
    }
  }, [])

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4()
    PASSIVE_POSITIONS.forEach((position, index) => {
      matrix.compose(
        new THREE.Vector3(...position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (index % 3) * Math.PI * 0.5, 0)),
        new THREE.Vector3(1, 1, 1),
      )
      passives.current.setMatrixAt(index, matrix)
    })
    passives.current.instanceMatrix.needsUpdate = true

    root.current.visible = false
    pulse.current.position.copy(asset.curves.entry.getPointAt(0))
    const materialSet = new Set()
    let meshes = 0
    let triangles = 0
    root.current.traverse((object) => {
      if (!object.isMesh && !object.isInstancedMesh) return
      meshes += 1
      const geometry = object.geometry
      const count = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
      triangles += count * (object.isInstancedMesh ? object.count : 1)
      const entries = Array.isArray(object.material) ? object.material : [object.material]
      entries.filter(Boolean).forEach((material) => materialSet.add(material.uuid))
    })

    onReady({
      activeTraceMaterials: asset.activeTraceMaterials,
      curves: asset.curves,
      group: root.current,
      lights: { key: keyLight.current, signal: signalLight.current },
      materials: asset.materials,
      pulse: pulse.current,
      stats: { materials: materialSet.size, meshObjects: meshes, triangles: Math.round(triangles) },
    })
  }, [asset, onReady])

  return (
    <group ref={root} name="HostInternals_Root" position={[0, -0.06, 0]}>
      <group name="Motherboard">
        <mesh geometry={asset.board} material={asset.materials.pcb} />
        {[[-1.48, 0.058, -0.74], [1.4, 0.058, -0.7], [-1.42, 0.058, 0.72], [1.38, 0.058, 0.7]].map((position, index) => (
          <mesh key={index} geometry={asset.mountingGeometry} material={asset.materials.contact} position={position} />
        ))}
        <instancedMesh ref={passives} args={[asset.passiveGeometry, asset.materials.passive, PASSIVE_POSITIONS.length]} name="Passive_Components" />
      </group>

      <group name="USB_Controller" position={[-1.18, 0.105, 0.42]}>
        <mesh geometry={asset.chipGeometry} material={asset.materials.chip} scale={[1.15, 1, 1]} />
        <mesh geometry={asset.contactGeometry} material={asset.materials.usbActive} position={[-0.16, 0.015, 0]} />
        <mesh geometry={asset.contactGeometry} material={asset.materials.usbActive} position={[0.16, 0.015, 0]} />
      </group>

      <group name="CPU" position={[0, 0.125, 0]}>
        <mesh material={asset.materials.chip} scale={[1.55, 1, 1.45]} geometry={asset.chipGeometry} />
        <mesh material={asset.materials.chipTop} position={[0, 0.06, 0]} scale={[1.3, 0.35, 1.18]} geometry={asset.chipGeometry} />
        {[-0.075, -0.025, 0.025, 0.075].map((z) => (
          <mesh key={z} material={asset.materials.cpuActive} position={[0, 0.075, z]} scale={[7, 0.65, 0.045]} geometry={asset.contactGeometry} />
        ))}
      </group>

      <group name="RAM">
        {RAM_POSITIONS.map((position, index) => (
          <group position={position} key={index}>
            <mesh geometry={asset.chipGeometry} material={asset.materials.chip} scale={[0.86, 0.72, 0.72]} />
            <mesh geometry={asset.contactGeometry} material={asset.materials.ramIndicators[index]} position={[0, 0.03, 0.09]} scale={[4.1, 0.7, 0.08]} />
          </group>
        ))}
      </group>

      <group name="GPU" position={[0.68, 0.115, 0.5]}>
        <mesh geometry={asset.chipGeometry} material={asset.materials.chip} scale={[1.6, 0.92, 1.35]} />
        {[-0.11, -0.055, 0, 0.055, 0.11].map((z, index) => (
          <mesh key={index} geometry={asset.contactGeometry} material={asset.materials.gpuActive} position={[0, 0.055, z]} scale={[6.2, 0.45, 0.05]} />
        ))}
      </group>

      <group name="NVMe_SSD" position={[-0.55, 0.095, -0.7]}>
        <mesh material={asset.materials.chip} geometry={asset.chipGeometry} scale={[2.4, 0.65, 0.78]} />
        <mesh material={asset.materials.nvmeActive} geometry={asset.contactGeometry} position={[0.13, 0.035, 0]} scale={[5.5, 0.5, 0.08]} />
        <mesh material={asset.materials.contact} geometry={asset.contactGeometry} position={[-0.28, 0, 0]} scale={[0.25, 1, 1.1]} />
      </group>

      <group name="PowerSection" position={[1.25, 0.09, -0.68]}>
        {[-0.18, 0, 0.18].map((x) => (
          <mesh key={x} geometry={asset.chipGeometry} material={asset.materials.structure} position={[x, 0, 0]} scale={[0.62, 0.74, 0.7]} />
        ))}
      </group>

      <group name="Thermal_System">
        <HeatPipe geometry={asset.heatPipeA} material={asset.materials.copper} name="HeatPipe_A" />
        <HeatPipe geometry={asset.heatPipeB} material={asset.materials.copper} name="HeatPipe_B" />
      </group>

      <group name="TraceNetwork">
        {Object.entries(asset.traceGeometries).flatMap(([name, geometry]) => [
          <mesh key={`${name}-base`} geometry={geometry} material={asset.materials.trace} name={`Trace_${name}`} />,
          <mesh key={`${name}-active`} geometry={geometry} material={asset.activeTraceMaterials[name]} name={`Trace_${name}_Active`} />,
        ])}
      </group>

      <group name="SignalPulseSystem">
        <mesh ref={pulse} geometry={asset.pulseGeometry} material={asset.materials.pulse} name="Signal_Pulse">
          <pointLight ref={signalLight} color="#55d7d3" intensity={0} distance={0.2} decay={2.6} />
        </mesh>
      </group>

      <ambientLight intensity={0.025} />
      <directionalLight ref={keyLight} color="#9db4b7" intensity={0.08} position={[-1.2, 2.4, 2.2]} />
      <pointLight color="#41646a" intensity={0.16} distance={4.8} position={[1.4, 1.4, -0.8]} />
    </group>
  )
}
