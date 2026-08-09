import { useLayoutEffect, useRef } from 'react'
import { createChapterTwoTimeline } from '../../animation/chapterTwoTimeline.js'
import { CHAPTER_TWO_SCROLL_VH } from '../../animation/sceneConfig.js'

export function ChapterTwo({ connectionProfile, debug, profile, reducedMotion, sceneApi }) {
  const chapter = useRef()
  const stage = useRef()
  const inspectionLabel = useRef()
  const alignmentLabel = useRef()
  const connectedLabel = useRef()
  const powerCopy = useRef()
  const handoffLine = useRef()
  const portVeil = useRef()
  const debugProgress = useRef()

  useLayoutEffect(() => {
    if (!sceneApi || !chapter.current || !stage.current) return undefined
    return createChapterTwoTimeline({
      connectionProfile,
      debug,
      profile,
      reducedMotion,
      refs: {
        alignmentLabel: alignmentLabel.current,
        chapter: chapter.current,
        connectedLabel: connectedLabel.current,
        debugProgress: debugProgress.current,
        handoffLine: handoffLine.current,
        inspectionLabel: inspectionLabel.current,
        powerCopy: powerCopy.current,
        portVeil: portVeil.current,
        stage: stage.current,
      },
      sceneApi,
    })
  }, [connectionProfile, debug, profile, reducedMotion, sceneApi])

  return (
    <section
      ref={chapter}
      className={`chapter-two${reducedMotion ? ' chapter-two--reduced' : ''}`}
      style={{ '--chapter-two-scroll': `${CHAPTER_TWO_SCROLL_VH}vh` }}
      aria-label="NullDrive reassembly and host connection"
    >
      <div ref={stage} className="chapter-two-stage">
        <div ref={inspectionLabel} className="inspection-complete">
          <span>01 / INSPECTION</span>
          <strong>COMPLETE</strong>
        </div>

        <div ref={alignmentLabel} className="alignment-label">
          <span>HOST INTERFACE</span>
          <strong>USB-C / ALIGNED</strong>
        </div>

        <p ref={connectedLabel} className="connected-label">HOST CONNECTED.</p>
        <p ref={powerCopy} className="power-copy">YOUR MACHINE.<br /><em>YOUR COMPUTE.</em></p>
        <div ref={portVeil} className="port-veil" aria-hidden="true" />
        <i ref={handoffLine} className="handoff-signal" aria-hidden="true" />

        <div className="chapter-two-index" aria-hidden="true">
          <span>CHAPTER 02</span>
          <span>THE HOST</span>
        </div>

        {debug && (
          <aside className="debug-hud debug-hud--v8">
            <span>CHAPTER 02</span>
            <strong ref={debugProgress}>0%</strong>
            <span>PORT TRANSITION</span>
          </aside>
        )}
      </div>
    </section>
  )
}
