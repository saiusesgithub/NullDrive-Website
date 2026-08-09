import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EXPLODED_OFFSETS, LIGHTING_STATES, SCENE_ORIENTATIONS } from './sceneConfig.js'

gsap.registerPlugin(ScrollTrigger)

function vectorTarget(original, axis, amount) {
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

function setProductState(sceneApi, profile, stateName) {
  const orientation = SCENE_ORIENTATIONS[stateName]
  const rootOriginal = sceneApi.rootOriginalRotation
  sceneApi.root.rotation.set(
    rootOriginal.x + orientation.x,
    rootOriginal.y + orientation.y,
    rootOriginal.z + orientation.z,
  )
  const scale = stateName === 'hero' ? profile.heroScale : profile.preExplosionScale
  const position = stateName === 'hero' ? profile.heroPosition : profile.preExplosionPosition
  sceneApi.presentation.scale.setScalar(scale)
  sceneApi.presentation.position.set(...position)
}

export function createChapterOneTimeline({ debug, profile, reducedMotion, refs, sceneApi }) {
  const context = gsap.context(() => {
    const {
      chapter,
      stage,
      intro,
      heroPrivate,
      heroAny,
      heroSecondary,
      preLabel,
      endAi,
      endIdentity,
      scrollCue,
      debugProgress,
    } = refs
    const { root, rootOriginalRotation, presentation, lighting, materials, nodes, originals, axis } = sceneApi

    gsap.set([heroPrivate, heroAny], { autoAlpha: 0, yPercent: 112, clipPath: 'inset(100% 0 0 0)' })
    gsap.set(heroSecondary, { autoAlpha: 0, y: 18 })
    gsap.set(preLabel, { autoAlpha: 0, y: 12 })
    gsap.set([endAi, endIdentity], { autoAlpha: 0, y: 32, clipPath: 'inset(100% 0 0 0)' })
    gsap.set(intro, { autoAlpha: 0.72 })
    gsap.set(scrollCue, { autoAlpha: 0 })

    Object.entries(EXPLODED_OFFSETS).forEach(([name]) => {
      const object = nodes.get(name)
      const original = originals.get(name)
      if (object && original) object.position.copy(original.position)
    })

    const initial = SCENE_ORIENTATIONS.initial
    root.rotation.set(
      rootOriginalRotation.x + initial.x,
      rootOriginalRotation.y + initial.y,
      rootOriginalRotation.z + initial.z,
    )
    presentation.scale.setScalar(profile.initialScale)
    presentation.position.set(0, 0.02, 0)
    Object.entries(LIGHTING_STATES.initial).forEach(([name, intensity]) => {
      if (lighting[name]) lighting[name].intensity = intensity
    })
    if (materials.led) materials.led.emissiveIntensity = Math.min(materials.ledIntensity, 0.18)
    if (materials.seam) materials.seam.emissiveIntensity = Math.min(materials.seamIntensity, 0.12)

    if (reducedMotion) {
      setProductState(sceneApi, profile, 'hero')
      Object.entries(LIGHTING_STATES.hero).forEach(([name, intensity]) => {
        if (lighting[name]) lighting[name].intensity = intensity
      })
      gsap.set([heroPrivate, heroAny, heroSecondary, endAi, endIdentity], {
        autoAlpha: 1,
        y: 0,
        yPercent: 0,
        clipPath: 'inset(0% 0 0 0)',
      })
      gsap.set(intro, { autoAlpha: 0.45 })
      return
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
          if (debugProgress) debugProgress.textContent = `${Math.round(progress * 100)}%`
        },
      },
    })

    const hero = SCENE_ORIENTATIONS.hero
    timeline
      .to(intro, { autoAlpha: 1, duration: 0.35 }, 0)
      .to(intro, { autoAlpha: 0, y: -10, duration: 0.7 }, 0.85)
      .to(heroPrivate, { autoAlpha: 1, yPercent: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.9 }, 0.42)
      .to(heroAny, { autoAlpha: 1, yPercent: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.9 }, 0.68)
      .to(heroSecondary, { autoAlpha: 0.68, y: 0, duration: 0.65 }, 1.1)
      .to(scrollCue, { autoAlpha: 0.6, duration: 0.45 }, 1.45)
      .to(root.rotation, {
        x: rootOriginalRotation.x + hero.x,
        y: rootOriginalRotation.y + hero.y,
        z: rootOriginalRotation.z + hero.z,
        duration: 1.65,
      }, 0.2)
      .to(presentation.scale, { x: profile.heroScale, y: profile.heroScale, z: profile.heroScale, duration: 1.65 }, 0.2)
      .to(presentation.position, {
        x: profile.heroPosition[0], y: profile.heroPosition[1], z: profile.heroPosition[2], duration: 1.65,
      }, 0.2)

    addLightState(timeline, lighting, LIGHTING_STATES.hero, 0.2, 1.7)
    if (materials.led) timeline.to(materials.led, { emissiveIntensity: Math.max(materials.ledIntensity, 0.7), duration: 1.1 }, 0.8)

    const pre = SCENE_ORIENTATIONS.preExplosion
    timeline
      .to(heroPrivate, { autoAlpha: 0, xPercent: -18, clipPath: 'inset(0 100% 0 0)', duration: 0.8 }, 2.75)
      .to(heroAny, { autoAlpha: 0, xPercent: 18, clipPath: 'inset(0 0 0 100%)', duration: 0.8 }, 2.85)
      .to(heroSecondary, { autoAlpha: 0, y: 18, duration: 0.55 }, 2.75)
      .to(scrollCue, { autoAlpha: 0, duration: 0.4 }, 2.7)
      .to(root.rotation, {
        x: rootOriginalRotation.x + pre.x,
        y: rootOriginalRotation.y + pre.y,
        z: rootOriginalRotation.z + pre.z,
        duration: 1.25,
      }, 2.75)
      .to(presentation.scale, {
        x: profile.preExplosionScale, y: profile.preExplosionScale, z: profile.preExplosionScale, duration: 1.25,
      }, 2.75)
      .to(presentation.position, {
        x: profile.preExplosionPosition[0],
        y: profile.preExplosionPosition[1],
        z: profile.preExplosionPosition[2],
        duration: 1.25,
      }, 2.75)
      .to(preLabel, { autoAlpha: 0.78, y: 0, duration: 0.55 }, 3.35)
      .to(preLabel, { autoAlpha: 0, y: -8, duration: 0.5 }, 4.45)

    if (materials.seam) timeline.to(materials.seam, { emissiveIntensity: Math.max(materials.seamIntensity, 0.65), duration: 0.75 }, 3.25)
    if (materials.led) timeline.to(materials.led, { emissiveIntensity: Math.max(materials.ledIntensity, 1.05), duration: 0.75 }, 3.25)

    const exploded = SCENE_ORIENTATIONS.exploded
    timeline
      .to(root.rotation, {
        x: rootOriginalRotation.x + exploded.x,
        y: rootOriginalRotation.y + exploded.y,
        z: rootOriginalRotation.z + exploded.z,
        duration: 2.45,
      }, 4.5)
      .to(presentation.scale, {
        x: profile.explodedScale, y: profile.explodedScale, z: profile.explodedScale, duration: 2.25,
      }, 4.65)
      .to(presentation.position, {
        x: profile.explodedPosition[0],
        y: profile.explodedPosition[1],
        z: profile.explodedPosition[2],
        duration: 2.1,
      }, 4.65)

    const animateLayer = (name, at, duration) => {
      const object = nodes.get(name)
      const original = originals.get(name)
      if (!object || !original) return
      timeline.to(object.position, { ...vectorTarget(original, axis, EXPLODED_OFFSETS[name]), duration, ease: 'power2.inOut' }, at)
    }

    animateLayer('Shell_Top', 4.62, 1.25)
    animateLayer('Shell_Bottom', 4.92, 1.25)
    animateLayer('Upper_Shield', 5.18, 1.15)
    animateLayer('Lower_Shield', 5.48, 1.15)
    animateLayer('PCB_Main', 5.78, 1.05)
    animateLayer('Connector_Housing', 5.78, 1.05)
    animateLayer('USB_C_Connector', 5.78, 1.05)
    animateLayer('Internal_Frame', 6.05, 1.05)
    addLightState(timeline, lighting, LIGHTING_STATES.exploded, 5.0, 1.9)

    timeline
      .to(endAi, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.8 }, 7.25)
      .to(endIdentity, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.8 }, 7.48)
      .to({}, { duration: 1.7 }, 8.3)

    ScrollTrigger.refresh()
  }, refs.chapter)

  return () => context.revert()
}
