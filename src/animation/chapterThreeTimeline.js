import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function prepareDrawPaths(paths) {
  paths.forEach((path) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
  })
}

export function createChapterThreeTimeline({ debug, reducedMotion, refs, sceneApi }) {
  const { chapter, debugProgress, stage } = refs
  const select = gsap.utils.selector(chapter)
  const webglLayer = document.querySelector('.webgl-layer')
  let webglPaused = false

  const pauseWebgl = () => {
    if (webglPaused) return
    sceneApi?.setFrameloop?.('demand')
    sceneApi?.invalidate?.()
    webglPaused = true
  }

  const resumeWebgl = () => {
    if (!webglPaused) return
    sceneApi?.setFrameloop?.('always')
    webglPaused = false
  }

  const context = gsap.context(() => {
    const entryPaths = select('.v9-entry-path')
    const nullPaths = select('.v9-null-path, .v9-null-bus')
    const transportPaths = select('.v9-transport-path')
    const hostPaths = select('.v9-host-path')
    const modelPaths = select('.v9-model-path')
    const allDrawPaths = [...entryPaths, ...nullPaths, ...transportPaths, ...hostPaths, ...modelPaths]

    prepareDrawPaths(allDrawPaths)
    gsap.set(select('.v9-entry-signal'), { autoAlpha: 0 })
    gsap.set(select('.v9-null-frame, .v9-host-frame'), { autoAlpha: 0 })
    gsap.set(select('.v9-null-node, .v9-host-interface, .v9-hardware-node, .v9-local-model'), { autoAlpha: 0, y: 10 })
    gsap.set(select('.v9-transport, .v9-metadata, .v9-final-status'), { autoAlpha: 0 })
    gsap.set(select('.architecture-copy, .architecture-final-copy'), { autoAlpha: 0, y: 18 })
    gsap.set(select('.architecture-final-copy span'), { yPercent: 110 })
    gsap.set(select('.v9-transport-packet'), { autoAlpha: 0 })
    gsap.set(select('.architecture-camera--desktop'), { scale: 1.42, x: 0, y: 0, svgOrigin: '720 450' })
    gsap.set(select('.architecture-camera--mobile'), { scale: 1.24, x: 0, y: 330, svgOrigin: '195 74' })

    if (reducedMotion) {
      gsap.set(allDrawPaths, { strokeDashoffset: 0 })
      gsap.set(select('.v9-entry-signal, .v9-null-frame, .v9-host-frame, .v9-null-node, .v9-host-interface, .v9-hardware-node, .v9-local-model, .v9-transport, .v9-metadata, .v9-final-status'), { autoAlpha: 1, y: 0 })
      gsap.set(select('.architecture-camera'), { clearProps: 'transform' })
      gsap.set(select('.architecture-final-copy'), { autoAlpha: 1, y: 0 })
      gsap.set(select('.architecture-final-copy span'), { yPercent: 0 })
      if (webglLayer) gsap.set(webglLayer, { autoAlpha: 0 })
      pauseWebgl()

      const reducedTrigger = ScrollTrigger.create({
        trigger: chapter,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: pauseWebgl,
        onEnterBack: pauseWebgl,
        onLeaveBack: () => {
          resumeWebgl()
          if (webglLayer) gsap.set(webglLayer, { autoAlpha: 1 })
        },
      })

      return () => reducedTrigger.kill()
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
          if (progress > 0.07) pauseWebgl()
          else resumeWebgl()
        },
        onLeaveBack: resumeWebgl,
      },
    })

    if (webglLayer) timeline.to(webglLayer, { autoAlpha: 0, duration: 0.55, ease: 'none' }, 0)
    timeline
      .to(select('.v9-entry-signal'), { autoAlpha: 1, duration: 0.28 }, 0.05)
      .to(select('.v9-signal-point'), { opacity: 1, duration: 0.28 }, 0.12)
      .to(entryPaths, { strokeDashoffset: 0, duration: 0.72, ease: 'power1.inOut' }, 0.24)
      .to(select('.architecture-camera--desktop'), { scale: 1.12, x: 118, y: 0, duration: 1.1 }, 0.75)
      .to(select('.architecture-camera--mobile'), { scale: 1.04, x: 0, y: 82, duration: 1.1 }, 0.75)

      .to(select('.v9-null-frame'), { autoAlpha: 1, duration: 0.65 }, 1.05)
      .to(select('.v9-null-node'), { autoAlpha: 1, y: 0, stagger: 0.11, duration: 0.42 }, 1.28)
      .to(nullPaths, { strokeDashoffset: 0, stagger: 0.08, duration: 0.62 }, 1.62)
      .to(select('.architecture-copy--carry'), { autoAlpha: 1, y: 0, duration: 0.5 }, 1.42)
      .to(select('.architecture-copy--carry'), { autoAlpha: 0, y: -14, duration: 0.44 }, 2.62)

      .to(select('.v9-transport'), { autoAlpha: 1, duration: 0.3 }, 2.55)
      .to(transportPaths, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, 2.72)
      .set(select('.v9-transport-packet'), { autoAlpha: 1 }, 2.9)
      .to(select('.v9-transport-packet--desktop'), { cx: 828, stagger: 0.19, duration: 0.92, ease: 'power1.inOut' }, 2.94)
      .to(select('.v9-transport-packet--mobile'), { cy: 582, stagger: 0.19, duration: 0.92, ease: 'power1.inOut' }, 2.94)
      .to(select('.v9-transport-packet'), { autoAlpha: 0, duration: 0.24 }, 3.76)

      .to(select('.architecture-camera--desktop'), { scale: 1.12, x: -112, y: 0, duration: 1.05 }, 3.48)
      .to(select('.architecture-camera--mobile'), { scale: 1.04, x: 0, y: -250, duration: 1.05 }, 3.48)
      .to(select('.v9-host-frame'), { autoAlpha: 1, duration: 0.62 }, 3.8)
      .to(select('.v9-host-interface'), { autoAlpha: 1, y: 0, duration: 0.44 }, 4.05)
      .to(hostPaths, { strokeDashoffset: 0, stagger: 0.1, duration: 0.62 }, 4.22)
      .to(select('.architecture-copy--host'), { autoAlpha: 1, y: 0, duration: 0.46 }, 4.02)
      .to(select('.v9-hardware-node[data-node="cpu"]'), { autoAlpha: 1, y: 0, duration: 0.5 }, 4.55)
      .to(select('.v9-hardware-node[data-node="ram"]'), { autoAlpha: 1, y: 0, duration: 0.5 }, 4.95)
      .to(select('.v9-hardware-node[data-node="gpu"]'), { autoAlpha: 1, y: 0, duration: 0.5 }, 5.35)
      .to(select('.architecture-copy--host'), { autoAlpha: 0, y: -14, duration: 0.42 }, 5.5)

      .to(modelPaths, { strokeDashoffset: 0, stagger: 0.08, duration: 0.62 }, 5.72)
      .to(select('.v9-local-model'), { autoAlpha: 1, y: 0, duration: 0.62 }, 5.94)
      .to(select('.v9-metadata'), { autoAlpha: 1, duration: 0.55 }, 6.1)
      .to(select('.architecture-camera--desktop'), { scale: 1, x: 0, y: 0, duration: 1.05 }, 6.2)
      .to(select('.architecture-camera--mobile'), { scale: 1, x: 0, y: 0, duration: 1.05 }, 6.2)

      .to(select('.architecture-final-copy'), { autoAlpha: 1, y: 0, duration: 0.3 }, 7.0)
      .to(select('.architecture-final-copy span'), { yPercent: 0, stagger: 0.22, duration: 0.62 }, 7.08)
      .to(select('.architecture-final-copy strong'), { autoAlpha: 1, duration: 0.48 }, 7.74)
      .to(select('.v9-final-status'), { autoAlpha: 1, duration: 0.52 }, 8.18)
      .to({}, { duration: 1.25 }, 8.7)

    ScrollTrigger.refresh()
  }, chapter)

  return () => {
    resumeWebgl()
    context.revert()
  }
}
