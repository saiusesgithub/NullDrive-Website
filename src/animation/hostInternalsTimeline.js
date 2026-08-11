import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INTERNALS_CAMERA_PROFILES } from './sceneConfig.js'

gsap.registerPlugin(ScrollTrigger)

function vectorTween(target, values, duration = 0.9) {
  return { x: values[0], y: values[1], z: values[2], duration, ease: 'power2.inOut' }
}

function prepareSvgPaths(paths) {
  paths.forEach((path) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
  })
}

export function createHostInternalsTimeline({ debug, profileKey, reducedMotion, refs, sceneApi }) {
  const { chapter, debugProgress, stage } = refs
  const select = gsap.utils.selector(chapter)
  const profile = INTERNALS_CAMERA_PROFILES[profileKey]
  const {
    camera,
    cameraTarget,
    host,
    internals,
    presentation,
  } = sceneApi
  const {
    activeTraceMaterials,
    curves,
    group,
    lights,
    materials,
    pulse,
  } = internals
  let internalsActive = false

  if (debugProgress) {
    debugProgress.dataset.hostInternalsStats = JSON.stringify(internals.stats)
  }

  const showInternals = () => {
    if (internalsActive) return
    group.visible = true
    pulse.visible = true
    host.group.visible = false
    presentation.visible = false
    sceneApi.setFrameloop?.('demand')
    sceneApi.invalidate?.()
    internalsActive = true
  }

  const showExterior = () => {
    if (!internalsActive) return
    group.visible = false
    host.group.visible = true
    presentation.visible = true
    sceneApi.setFrameloop?.('always')
    internalsActive = false
  }

  const context = gsap.context(() => {
    const abstractPaths = select('.internals-abstract-traces path')
    prepareSvgPaths(abstractPaths)
    gsap.set(select('.internals-entry-veil'), { autoAlpha: 1 })
    gsap.set(select('.internals-entry-signal'), { autoAlpha: 0, scale: 0.4 })
    gsap.set(select('.internals-copy, .hardware-label, .internals-software-layer, .internals-transition-copy'), { autoAlpha: 0, y: 14 })
    gsap.set(select('.internals-abstract-overlay'), { autoAlpha: 0 })
    gsap.set(select('.internals-abstract-nodes'), { autoAlpha: 0 })
    Object.values(activeTraceMaterials).forEach((material) => { material.opacity = 0 })
    materials.usbActive.emissiveIntensity = 0
    materials.cpuActive.emissiveIntensity = 0
    materials.gpuActive.emissiveIntensity = 0
    materials.nvmeActive.emissiveIntensity = 0
    materials.ramIndicators.forEach((material) => { material.emissiveIntensity = 0 })
    lights.key.intensity = 0.08
    lights.signal.intensity = 0

    const setCamera = (position, target) => {
      camera.position.set(...position)
      cameraTarget.x = target[0]
      cameraTarget.y = target[1]
      cameraTarget.z = target[2]
    }

    if (reducedMotion) {
      showInternals()
      setCamera(profile.wide, profile.wideTarget)
      lights.key.intensity = 1.15
      materials.usbActive.emissiveIntensity = 0.16
      materials.cpuActive.emissiveIntensity = 0.18
      materials.gpuActive.emissiveIntensity = 0.16
      materials.nvmeActive.emissiveIntensity = 0.13
      materials.ramIndicators.forEach((material) => { material.emissiveIntensity = 0.16 })
      Object.values(activeTraceMaterials).forEach((material) => { material.opacity = 0.18 })
      gsap.set(select('.internals-entry-veil'), { autoAlpha: 0 })
      gsap.set(select('.hardware-label, .internals-software-layer'), { autoAlpha: 1, y: 0 })

      const reducedTrigger = ScrollTrigger.create({
        trigger: chapter,
        start: 'top 70%',
        onEnter: showInternals,
        onEnterBack: showInternals,
        onLeaveBack: showExterior,
      })
      return () => reducedTrigger.kill()
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => sceneApi.invalidate?.(),
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
          if (debugProgress) debugProgress.textContent = `${Math.round(progress * 100)}%`
          if (progress > 0.012) showInternals()
          else showExterior()
        },
        onLeaveBack: showExterior,
      },
    })

    const connectionCamera = sceneApi.connectionTransforms?.portCamera ?? camera.position
    const connectionTarget = sceneApi.connectionTransforms?.portTarget ?? cameraTarget
    timeline
      .fromTo(camera.position, {
        x: connectionCamera.x,
        y: connectionCamera.y,
        z: connectionCamera.z,
      }, {
        ...vectorTween(camera.position, profile.entry, 0.72),
        immediateRender: false,
      }, 0)
      .fromTo(cameraTarget, {
        x: connectionTarget.x,
        y: connectionTarget.y,
        z: connectionTarget.z,
      }, {
        ...vectorTween(cameraTarget, profile.entryTarget, 0.72),
        immediateRender: false,
      }, 0)
      .to(select('.internals-entry-signal'), { autoAlpha: 1, scale: 1, duration: 0.4 }, 0.08)
      .to(select('.internals-entry-veil'), { autoAlpha: 0, duration: 0.52, ease: 'none' }, 0.36)
      .to(lights.signal, { intensity: 0.045, duration: 0.34 }, 0.34)
      .to(lights.key, { intensity: 0.24, duration: 0.7 }, 0.38)

    const animatePulse = (curveName, at, duration) => {
      const state = { progress: 0 }
      const curve = curves[curveName]
      const activeMaterial = activeTraceMaterials[curveName]
      timeline
        .fromTo(state, { progress: 0 }, {
          progress: 1,
          duration,
          ease: 'power1.inOut',
          immediateRender: false,
          onUpdate: () => pulse.position.copy(curve.getPointAt(state.progress)),
        }, at)
        .to(activeMaterial, { opacity: 0.44, duration: duration * 0.32 }, at)
        .to(activeMaterial, { opacity: 0.07, duration: duration * 0.34 }, at + duration * 0.72)
    }

    animatePulse('entry', 0.38, 0.72)
    timeline
      .to(materials.usbActive, { emissiveIntensity: 0.3, duration: 0.24 }, 0.96)
      .to(materials.usbActive, { emissiveIntensity: 0.1, duration: 0.42 }, 1.2)
      .to(select('[data-hardware="usb"]'), { autoAlpha: 1, y: 0, duration: 0.38 }, 0.92)
      .to(select('.internals-copy--detected'), { autoAlpha: 1, y: 0, duration: 0.4 }, 1.02)
      .to(camera.position, vectorTween(camera.position, profile.controller, 0.9), 0.95)
      .to(cameraTarget, vectorTween(cameraTarget, profile.controllerTarget, 0.9), 0.95)

    animatePulse('bus', 1.42, 0.82)
    timeline
      .to(lights.key, { intensity: 0.82, duration: 0.9 }, 1.72)
      .to(camera.position, vectorTween(camera.position, profile.reveal, 1.08), 1.82)
      .to(cameraTarget, vectorTween(cameraTarget, profile.revealTarget, 1.08), 1.82)
      .to(select('.internals-copy--detected'), { autoAlpha: 0, y: -12, duration: 0.38 }, 2.0)
      .to(select('.internals-copy--resources'), { autoAlpha: 1, y: 0, duration: 0.42 }, 2.42)

    animatePulse('cpu', 3.12, 0.92)
    timeline
      .to(camera.position, vectorTween(camera.position, profile.cpu, 0.88), 3.0)
      .to(cameraTarget, vectorTween(cameraTarget, profile.cpuTarget, 0.88), 3.0)
      .to(select('[data-hardware="cpu"]'), { autoAlpha: 1, y: 0, duration: 0.38 }, 3.34)
      .to(materials.cpuActive, { emissiveIntensity: 0.25, duration: 0.24 }, 3.88)
      .to(materials.cpuActive, { emissiveIntensity: 0.09, duration: 0.25 }, 4.12)
      .to(materials.cpuActive, { emissiveIntensity: 0.18, duration: 0.18 }, 4.37)
      .to(materials.cpuActive, { emissiveIntensity: 0.12, duration: 0.34 }, 4.55)

    animatePulse('ram', 4.55, 1.0)
    timeline
      .to(camera.position, vectorTween(camera.position, profile.ram, 0.92), 4.48)
      .to(cameraTarget, vectorTween(cameraTarget, profile.ramTarget, 0.92), 4.48)
      .to(select('[data-hardware="ram"]'), { autoAlpha: 1, y: 0, duration: 0.36 }, 4.72)
      .to(materials.ramIndicators, { emissiveIntensity: 0.26, stagger: 0.105, duration: 0.2 }, 5.15)
      .to(materials.ramIndicators, { emissiveIntensity: 0.09, stagger: 0.08, duration: 0.28 }, 5.78)

    animatePulse('gpu', 5.9, 0.92)
    timeline
      .to(camera.position, vectorTween(camera.position, profile.gpu, 0.9), 5.84)
      .to(cameraTarget, vectorTween(cameraTarget, profile.gpuTarget, 0.9), 5.84)
      .to(select('[data-hardware="gpu"]'), { autoAlpha: 1, y: 0, duration: 0.36 }, 6.04)
      .to(materials.gpuActive, { emissiveIntensity: 0.26, duration: 0.34 }, 6.55)
      .to(materials.gpuActive, { emissiveIntensity: 0.09, duration: 0.46 }, 6.88)

    animatePulse('nvme', 6.82, 0.72)
    timeline
      .to(select('[data-hardware="nvme"]'), { autoAlpha: 1, y: 0, duration: 0.34 }, 6.95)
      .to(materials.nvmeActive, { emissiveIntensity: 0.25, duration: 0.24 }, 7.22)
      .to(materials.nvmeActive, { emissiveIntensity: 0.09, duration: 0.36 }, 7.46)
      .to(camera.position, vectorTween(camera.position, profile.wide, 1.02), 7.22)
      .to(cameraTarget, vectorTween(cameraTarget, profile.wideTarget, 1.02), 7.22)
      .to(lights.key, { intensity: 1.12, duration: 0.8 }, 7.2)

      .to(select('.internals-copy--resources'), { autoAlpha: 0, y: -12, duration: 0.38 }, 7.36)
      .to(select('.hardware-label'), { autoAlpha: 0, y: -8, duration: 0.48 }, 7.56)
      .to(select('.internals-software-layer'), { autoAlpha: 1, y: 0, duration: 0.62 }, 7.62)
      .to(select('.internals-copy--execution'), { autoAlpha: 1, y: 0, duration: 0.42 }, 7.78)
      .to(camera.position, vectorTween(camera.position, profile.abstract, 1.02), 8.38)
      .to(cameraTarget, vectorTween(cameraTarget, profile.abstractTarget, 1.02), 8.38)
      .to(select('.internals-copy--execution'), { autoAlpha: 0, y: -12, duration: 0.42 }, 8.62)
      .to(select('.internals-software-layer'), { autoAlpha: 0.18, duration: 0.48 }, 8.66)

      .to(select('.internals-abstract-overlay'), { autoAlpha: 1, duration: 0.5 }, 8.62)
      .to(abstractPaths, { strokeDashoffset: 0, stagger: 0.08, duration: 0.76 }, 8.78)
      .to(select('.internals-abstract-nodes'), { autoAlpha: 1, duration: 0.52 }, 9.0)
      .to(select('.internals-transition-copy'), { autoAlpha: 1, y: 0, duration: 0.46 }, 9.08)
      .to(lights.key, { intensity: 0.08, duration: 0.8 }, 9.12)
      .to(lights.signal, { intensity: 0.02, duration: 0.7 }, 9.12)
      .to(select('.internals-entry-veil'), { autoAlpha: 0.9, duration: 0.7, ease: 'none' }, 9.28)
      .to(select('.internals-transition-copy'), { autoAlpha: 0.3, duration: 0.4 }, 9.72)
      .to({}, { duration: 0.4 }, 9.82)

    ScrollTrigger.refresh()
  }, chapter)

  return () => {
    context.revert()
    lights.key.intensity = 0.08
    lights.signal.intensity = 0
    Object.values(activeTraceMaterials).forEach((material) => { material.opacity = 0 })
    materials.ramIndicators.forEach((material) => { material.emissiveIntensity = 0 })
    showExterior()
  }
}
