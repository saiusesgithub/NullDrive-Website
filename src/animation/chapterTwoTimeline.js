import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { EXPLODED_OFFSETS, LIGHTING_STATES, SCENE_ORIENTATIONS } from './sceneConfig.js'

gsap.registerPlugin(ScrollTrigger)

function explodedPosition(original, axis, amount) {
  return {
    x: original.position.x + axis.x * amount,
    y: original.position.y + axis.y * amount,
    z: original.position.z + axis.z * amount,
  }
}

function addLightState(timeline, lights, state, at, duration = 1) {
  Object.entries(state).forEach(([name, intensity]) => {
    if (lights[name]) timeline.to(lights[name], { intensity, duration, ease: 'power2.inOut' }, at)
  })
}

function geometryCenterWorld(object) {
  object.geometry.computeBoundingBox()
  return object.localToWorld(object.geometry.boundingBox.getCenter(new THREE.Vector3()))
}

function geometryCornersWorld(object) {
  object.geometry.computeBoundingBox()
  const { min, max } = object.geometry.boundingBox
  const corners = []
  for (const x of [min.x, max.x]) {
    for (const y of [min.y, max.y]) {
      for (const z of [min.z, max.z]) corners.push(object.localToWorld(new THREE.Vector3(x, y, z)))
    }
  }
  return corners
}

function connectorExtent(connector, direction) {
  const center = geometryCenterWorld(connector)
  const centerProjection = center.dot(direction)
  const projections = geometryCornersWorld(connector).map((point) => point.dot(direction))
  const min = Math.min(...projections)
  const max = Math.max(...projections)
  return {
    center,
    length: max - min,
    tip: center.clone().addScaledVector(direction, max - centerProjection),
  }
}

function objectLocalAxisInRoot(object, root, axisIndex) {
  const relative = root.matrixWorld.clone().invert().multiply(object.matrixWorld)
  const axis = axisIndex === 0
    ? new THREE.Vector3(1, 0, 0)
    : axisIndex === 1
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1)
  return axis.transformDirection(relative)
}

function calculateConnectionTransforms(sceneApi, connectionProfile) {
  const {
    host,
    nodes,
    presentation,
    root,
    rootOriginalPosition,
    rootOriginalRotation,
  } = sceneApi
  const connector = nodes.get('USB_C_Connector')
  const saved = {
    hostPosition: host.group.position.clone(),
    hostRotation: host.group.rotation.clone(),
    hostScale: host.group.scale.clone(),
    presentationPosition: presentation.position.clone(),
    presentationScale: presentation.scale.clone(),
    rootPosition: root.position.clone(),
    rootRotation: root.rotation.clone(),
  }

  presentation.position.set(...connectionProfile.productPosition)
  presentation.scale.setScalar(connectionProfile.productScale)
  root.position.copy(rootOriginalPosition)
  root.rotation.copy(rootOriginalRotation)
  host.group.position.set(...connectionProfile.hostVisiblePosition)
  host.group.rotation.set(...connectionProfile.hostRotation)
  host.group.scale.setScalar(connectionProfile.hostScale)
  presentation.updateWorldMatrix(true, true)
  host.group.updateWorldMatrix(true, true)

  const port = host.port.anchor.getWorldPosition(new THREE.Vector3())
  const insertionAxis = host.port.insertionDirectionLocal.clone()
    .transformDirection(host.port.anchor.matrixWorld)
    .normalize()
  const portHeight = new THREE.Vector3(0, 1, 0)
    .transformDirection(host.port.anchor.matrixWorld)
    .normalize()

  const connectorCenter = geometryCenterWorld(connector)
  const forwardLocal = root.worldToLocal(connectorCenter.clone()).normalize()
  connector.geometry.computeBoundingBox()
  const connectorSize = connector.geometry.boundingBox.getSize(new THREE.Vector3())
  const sizeValues = [connectorSize.x, connectorSize.y, connectorSize.z]
  const heightIndex = sizeValues.indexOf(Math.min(...sizeValues))
  const connectorHeightLocal = objectLocalAxisInRoot(connector, root, heightIndex)
    .addScaledVector(forwardLocal, -objectLocalAxisInRoot(connector, root, heightIndex).dot(forwardLocal))
    .normalize()
  const connectorWidthLocal = forwardLocal.clone().cross(connectorHeightLocal).normalize()

  const parentQuaternion = presentation.getWorldQuaternion(new THREE.Quaternion())
  const inverseParentQuaternion = parentQuaternion.clone().invert()
  const insertionParent = insertionAxis.clone().applyQuaternion(inverseParentQuaternion).normalize()
  const heightParent = portHeight.clone().applyQuaternion(inverseParentQuaternion)
    .addScaledVector(insertionParent, -portHeight.dot(insertionAxis))
    .normalize()
  const widthParent = insertionParent.clone().cross(heightParent).normalize()
  const sourceBasis = new THREE.Matrix4().makeBasis(forwardLocal, connectorHeightLocal, connectorWidthLocal)
  const targetBasis = new THREE.Matrix4().makeBasis(insertionParent, heightParent, widthParent)
  const rotationQuaternion = new THREE.Quaternion().setFromRotationMatrix(
    targetBasis.multiply(sourceBasis.invert()),
  )
  const rotation = new THREE.Euler().setFromQuaternion(rotationQuaternion, root.rotation.order)
  root.quaternion.copy(rotationQuaternion)
  presentation.updateWorldMatrix(true, true)

  const extent = connectorExtent(connector, insertionAxis)
  const sceneScale = connectionProfile.hostScale
  const cavityDepth = host.port.cavityDepth * sceneScale
  const seatDepth = Math.max(0, Math.min(extent.length, cavityDepth * 0.92) - connectionProfile.fullSeatClearance * sceneScale)
  const targets = {
    approach: port.clone().addScaledVector(insertionAxis, -connectionProfile.approachDistance * sceneScale),
    aligned: port.clone().addScaledVector(insertionAxis, -connectionProfile.alignedGap * sceneScale),
    half: port.clone().addScaledVector(insertionAxis, seatDepth * 0.5),
    inserted: port.clone().addScaledVector(insertionAxis, seatDepth),
  }

  const rootPositionForTarget = (target) => {
    root.position.copy(rootOriginalPosition)
    presentation.updateWorldMatrix(true, true)
    const tip = connectorExtent(connector, insertionAxis).tip
    const inverseParent = root.parent.matrixWorld.clone().invert()
    const tipParent = tip.clone().applyMatrix4(inverseParent)
    const targetParent = target.clone().applyMatrix4(inverseParent)
    const parentDelta = targetParent.sub(tipParent)
    return rootOriginalPosition.clone().add(parentDelta)
  }

  const start = rootPositionForTarget(targets.approach)
  const aligned = rootPositionForTarget(targets.aligned)
  const half = rootPositionForTarget(targets.half)
  const inserted = rootPositionForTarget(targets.inserted)
  root.position.copy(inserted)
  presentation.updateWorldMatrix(true, true)
  host.group.updateWorldMatrix(true, true)

  const outward = insertionAxis.clone().negate()
  const tangent = insertionAxis.clone().cross(portHeight).normalize()
  if (tangent.dot(sceneApi.camera.position.clone().sub(port)) < 0) tangent.negate()
  const distance = connectionProfile.portCameraDistance
  const portCameraMid = port.clone()
    .addScaledVector(outward, distance * 1.7)
    .addScaledVector(tangent, distance * 0.8)
    .addScaledVector(portHeight, distance * 0.64)
  const portCamera = port.clone()
    .addScaledVector(outward, distance)
    .addScaledVector(tangent, distance * 0.32)
    .addScaledVector(portHeight, distance * 0.18)
  const portTarget = port.clone().addScaledVector(insertionAxis, seatDepth * 0.55)

  presentation.position.copy(saved.presentationPosition)
  presentation.scale.copy(saved.presentationScale)
  root.position.copy(saved.rootPosition)
  root.rotation.copy(saved.rootRotation)
  host.group.position.copy(saved.hostPosition)
  host.group.rotation.copy(saved.hostRotation)
  host.group.scale.copy(saved.hostScale)
  presentation.updateWorldMatrix(true, true)
  host.group.updateWorldMatrix(true, true)

  const connectionStates = {
    CONNECTION_APPROACH: { position: start, target: targets.approach },
    CONNECTION_ALIGNED: { position: aligned, target: targets.aligned },
    CONNECTION_HALF_INSERTED: { position: half, target: targets.half },
    CONNECTION_FULLY_INSERTED: { position: inserted, target: targets.inserted },
  }

  return {
    aligned,
    connectionStates,
    half,
    inserted,
    insertionAxis,
    port,
    portCamera,
    portCameraMid,
    portTarget,
    rotation,
    seatDepth,
    start,
    targets,
  }
}

function applyExploded(sceneApi, profile) {
  const { axis, nodes, originals, presentation, root, rootOriginalPosition, rootOriginalRotation } = sceneApi
  const orientation = SCENE_ORIENTATIONS.exploded
  root.position.copy(rootOriginalPosition)
  root.rotation.set(
    rootOriginalRotation.x + orientation.x,
    rootOriginalRotation.y + orientation.y,
    rootOriginalRotation.z + orientation.z,
  )
  presentation.position.set(...profile.explodedPosition)
  presentation.scale.setScalar(profile.explodedScale)
  Object.entries(EXPLODED_OFFSETS).forEach(([name, amount]) => {
    const object = nodes.get(name)
    const original = originals.get(name)
    if (object && original) object.position.set(...Object.values(explodedPosition(original, axis, amount)))
  })
}

export function createChapterTwoTimeline({ connectionProfile, debug, profile, reducedMotion, refs, sceneApi }) {
  let debugFrame = 0
  const context = gsap.context(() => {
    const {
      alignmentLabel,
      chapter,
      connectedLabel,
      debugProgress,
      handoffLine,
      inspectionLabel,
      powerCopy,
      portVeil,
      stage,
    } = refs
    const {
      axis,
      camera,
      cameraTarget,
      host,
      lighting,
      materials,
      nodes,
      originals,
      presentation,
      root,
      rootOriginalPosition,
      rootOriginalRotation,
    } = sceneApi
    const transforms = calculateConnectionTransforms(sceneApi, connectionProfile)
    sceneApi.connectionTransforms = transforms

    gsap.set([inspectionLabel, alignmentLabel, connectedLabel, powerCopy], { autoAlpha: 0, y: 16 })
    gsap.set(handoffLine, { autoAlpha: 0, scaleX: 0 })
    gsap.set(portVeil, { autoAlpha: 0 })
    if (host.portLight) host.portLight.intensity = 0

    const assemblyError = () => Math.max(...Object.keys(EXPLODED_OFFSETS).map((name) => {
      const object = nodes.get(name)
      const original = originals.get(name)
      return object && original ? object.position.distanceTo(original.position) : 0
    }))
    const connectionError = (stateName) => {
      presentation.updateWorldMatrix(true, true)
      host.group.updateWorldMatrix(true, true)
      const tip = connectorExtent(nodes.get('USB_C_Connector'), transforms.insertionAxis).tip
      return tip.distanceTo(transforms.targets[stateName])
    }

    if (debug) {
      debugProgress.dataset.start = transforms.start.toArray().join(',')
      debugProgress.dataset.aligned = transforms.aligned.toArray().join(',')
      debugProgress.dataset.half = transforms.half.toArray().join(',')
      debugProgress.dataset.inserted = transforms.inserted.toArray().join(',')
      debugProgress.dataset.hostStats = JSON.stringify(host.stats)
      debugProgress.dataset.insertionAxis = transforms.insertionAxis.toArray().join(',')
      debugProgress.dataset.seatDepth = transforms.seatDepth.toFixed(6)
      debugProgress.dataset.connectionStates = JSON.stringify(Object.fromEntries(
        Object.entries(transforms.connectionStates).map(([name, state]) => [name, state.position.toArray()]),
      ))
      console.info(`[ND-01] V8 connection transforms ${JSON.stringify({
        aligned: transforms.aligned.toArray(),
        half: transforms.half.toArray(),
        inserted: transforms.inserted.toArray(),
        insertionAxis: transforms.insertionAxis.toArray(),
        port: transforms.port.toArray(),
        rotation: transforms.rotation.toArray(),
        seatDepth: transforms.seatDepth,
        start: transforms.start.toArray(),
      })}`)
      console.info(`[ND-01] V8 host geometry ${JSON.stringify(host.stats)}`)
      const updateDebugMetrics = () => {
        debugProgress.dataset.assemblyError = assemblyError().toExponential(3)
        debugProgress.dataset.alignedError = connectionError('aligned').toExponential(3)
        debugProgress.dataset.halfError = connectionError('half').toExponential(3)
        debugProgress.dataset.insertedError = connectionError('inserted').toExponential(3)
        debugProgress.dataset.hostPosition = host.group.position.toArray().join(',')
        debugProgress.dataset.hostScale = host.group.scale.toArray().join(',')
        debugProgress.dataset.presentationPosition = presentation.position.toArray().join(',')
        debugProgress.dataset.presentationScale = presentation.scale.toArray().join(',')
        debugProgress.dataset.rootPosition = root.position.toArray().join(',')
        debugFrame = requestAnimationFrame(updateDebugMetrics)
      }
      updateDebugMetrics()
    }

    if (reducedMotion) {
      const showConnected = () => {
        Object.entries(EXPLODED_OFFSETS).forEach(([name]) => {
          const object = nodes.get(name)
          const original = originals.get(name)
          if (object && original) object.position.copy(original.position)
        })
        root.rotation.copy(transforms.rotation)
        root.position.copy(transforms.inserted)
        presentation.position.set(...connectionProfile.productPosition)
        presentation.scale.setScalar(connectionProfile.productScale)
        host.group.position.set(...connectionProfile.hostVisiblePosition)
        host.group.rotation.set(...connectionProfile.hostRotation)
        host.group.scale.setScalar(connectionProfile.hostScale)
        gsap.set([connectedLabel, powerCopy], { autoAlpha: 1, y: 0 })
        if (materials.led) materials.led.emissiveIntensity = Math.max(materials.ledIntensity, 0.9)
      }
      const restoreExploded = () => {
        applyExploded(sceneApi, profile)
        host.group.position.set(...connectionProfile.hostHiddenPosition)
        gsap.set([connectedLabel, powerCopy], { autoAlpha: 0 })
      }
      const trigger = ScrollTrigger.create({
        trigger: chapter,
        start: 'top 70%',
        onEnter: showConnected,
        onEnterBack: showConnected,
        onLeaveBack: restoreExploded,
      })
      return () => trigger.kill()
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: chapter,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.05,
        pin: stage,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        markers: debug,
        onUpdate: ({ progress }) => {
          if (debugProgress) {
            debugProgress.textContent = `${Math.round(progress * 100)}%`
          }
        },
      },
    })

    timeline
      .to(inspectionLabel, { autoAlpha: 0.7, y: 0, duration: 0.35 }, 0.12)
      .to(inspectionLabel, { autoAlpha: 0, y: -10, duration: 0.45 }, 0.72)

    const reassemble = (name, at, duration) => {
      const object = nodes.get(name)
      const original = originals.get(name)
      const amount = EXPLODED_OFFSETS[name]
      if (!object || !original || amount === undefined) return
      timeline.fromTo(
        object.position,
        { ...explodedPosition(original, axis, amount) },
        { x: original.position.x, y: original.position.y, z: original.position.z, duration, ease: 'power2.inOut', immediateRender: false },
        at,
      )
    }

    reassemble('Shell_Bottom', 0.95, 1.05)
    reassemble('Lower_Shield', 1.18, 1.02)
    reassemble('Internal_Frame', 1.42, 0.96)
    reassemble('PCB_Main', 1.62, 0.92)
    reassemble('Connector_Housing', 1.62, 0.92)
    reassemble('USB_C_Connector', 1.62, 0.92)
    reassemble('Upper_Shield', 1.88, 0.92)
    reassemble('Shell_Top', 2.12, 1.02)

    if (materials.seam) {
      timeline
        .to(materials.seam, { emissiveIntensity: Math.max(materials.seamIntensity, 0.96), duration: 0.28 }, 2.82)
        .to(materials.seam, { emissiveIntensity: Math.max(materials.seamIntensity, 0.32), duration: 0.45 }, 3.1)
    }
    if (materials.led) {
      timeline
        .to(materials.led, { emissiveIntensity: Math.max(materials.ledIntensity, 1.12), duration: 0.28 }, 2.84)
        .to(materials.led, { emissiveIntensity: Math.max(materials.ledIntensity, 0.68), duration: 0.48 }, 3.12)
    }

    timeline
      .to(root.rotation, {
        x: transforms.rotation.x,
        y: transforms.rotation.y,
        z: transforms.rotation.z,
        duration: 1.18,
      }, 3.18)
      .to(root.position, { x: transforms.start.x, y: transforms.start.y, z: transforms.start.z, duration: 1.18 }, 3.18)
      .to(presentation.scale, {
        x: connectionProfile.productScale,
        y: connectionProfile.productScale,
        z: connectionProfile.productScale,
        duration: 1.18,
      }, 3.18)
      .to(presentation.position, {
        x: connectionProfile.productPosition[0],
        y: connectionProfile.productPosition[1],
        z: connectionProfile.productPosition[2],
        duration: 1.18,
      }, 3.18)

    addLightState(timeline, lighting, LIGHTING_STATES.sealed, 3.12, 1.25)

    timeline.fromTo(
      host.group.position,
      {
        x: connectionProfile.hostHiddenPosition[0],
        y: connectionProfile.hostHiddenPosition[1],
        z: connectionProfile.hostHiddenPosition[2],
      },
      {
        x: connectionProfile.hostVisiblePosition[0],
        y: connectionProfile.hostVisiblePosition[1],
        z: connectionProfile.hostVisiblePosition[2],
        duration: 1.35,
        ease: 'power2.out',
        immediateRender: false,
      },
      4.42,
    )
    timeline
      .to(host.group.scale, {
        x: connectionProfile.hostScale,
        y: connectionProfile.hostScale,
        z: connectionProfile.hostScale,
        duration: 0.01,
      }, 4.4)
      .to(host.group.rotation, {
        x: connectionProfile.hostRotation[0],
        y: connectionProfile.hostRotation[1],
        z: connectionProfile.hostRotation[2],
        duration: 0.01,
      }, 4.4)
    timeline.to(root.position, {
      x: transforms.aligned.x,
      y: transforms.aligned.y,
      z: transforms.aligned.z,
      duration: 0.62,
      ease: 'power1.inOut',
    }, 5.62)
    timeline
      .to(alignmentLabel, { autoAlpha: 0.72, y: 0, duration: 0.42 }, 5.55)
      .to(alignmentLabel, { autoAlpha: 0, y: -8, duration: 0.42 }, 6.42)

    timeline.to(root.position, {
      x: transforms.half.x,
      y: transforms.half.y,
      z: transforms.half.z,
      duration: 0.73,
      ease: 'power2.inOut',
    }, 6.62)

    timeline.to(root.position, {
      x: transforms.inserted.x,
      y: transforms.inserted.y,
      z: transforms.inserted.z,
      duration: 0.73,
      ease: 'power2.inOut',
    }, 7.35)

    addLightState(timeline, lighting, LIGHTING_STATES.connected, 6.9, 1.25)
    if (host.portLight) {
      timeline
        .to(host.portLight, { intensity: 0.2, duration: 0.22 }, 7.95)
        .to(host.portLight, { intensity: 0.055, duration: 0.55 }, 8.17)
    }
    if (materials.led) timeline.to(materials.led, { emissiveIntensity: Math.max(materials.ledIntensity, 1.28), duration: 0.35 }, 7.95)
    if (materials.seam) {
      timeline
        .to(materials.seam, { emissiveIntensity: Math.max(materials.seamIntensity, 0.84), duration: 0.25 }, 7.95)
        .to(materials.seam, { emissiveIntensity: Math.max(materials.seamIntensity, 0.28), duration: 0.52 }, 8.2)
    }

    timeline
      .to(connectedLabel, { autoAlpha: 0.82, y: 0, duration: 0.46 }, 8.08)
      .to(powerCopy, { autoAlpha: 1, y: 0, duration: 0.58 }, 8.28)
      .to([connectedLabel, powerCopy], { autoAlpha: 0, y: -14, duration: 0.55 }, 9.12)
      .to(host.portLight, { intensity: 0.015, duration: 0.5 }, 9.02)
      .fromTo(camera.position, {
        x: profile.camera[0], y: profile.camera[1], z: profile.camera[2],
      }, {
        x: transforms.portCameraMid.x,
        y: transforms.portCameraMid.y,
        z: transforms.portCameraMid.z,
        duration: 0.72,
        ease: 'power2.inOut',
        immediateRender: false,
      }, 9.02)
      .to(camera.position, {
        x: transforms.portCamera.x,
        y: transforms.portCamera.y,
        z: transforms.portCamera.z,
        duration: 0.7,
        ease: 'power2.inOut',
      }, 9.72)
      .to(cameraTarget, {
        x: transforms.portTarget.x,
        y: transforms.portTarget.y,
        z: transforms.portTarget.z,
        duration: 1.42,
      }, 9.02)
      .to(portVeil, { autoAlpha: 0.94, duration: 0.72 }, 9.72)
      .to(handoffLine, { autoAlpha: 0.72, scaleX: 1, duration: 0.62 }, 9.78)
      .to(portVeil, { autoAlpha: 1, duration: 0.38 }, 10.34)
      .to(handoffLine, { autoAlpha: 0.26, scaleX: 0.24, duration: 0.62 }, 10.3)
      .to({}, { duration: 0.48 }, 10.72)

    addLightState(timeline, lighting, LIGHTING_STATES.port, 9.12, 1.18)
    timeline.eventCallback('onUpdate', () => {
      const time = timeline.time()
      if (time >= 3.14) {
        Object.keys(EXPLODED_OFFSETS).forEach((name) => {
          const object = nodes.get(name)
          const original = originals.get(name)
          if (object && original) object.position.copy(original.position)
        })
      }
      if (time >= 4.38) {
        presentation.position.set(...connectionProfile.productPosition)
        presentation.scale.setScalar(connectionProfile.productScale)
        root.rotation.copy(transforms.rotation)
      }
    })
    ScrollTrigger.refresh()
  }, refs.chapter)

  return () => {
    cancelAnimationFrame(debugFrame)
    context.revert()
  }
}
