import { useLayoutEffect, useMemo, useRef } from 'react'
import { createChapterOneTimeline } from '../../animation/chapterOneTimeline.js'
import { CHAPTER_SCROLL_VH } from '../../animation/sceneConfig.js'

export function ChapterOne({ debug, profile, reducedMotion, sceneApi }) {
  const chapter = useRef()
  const stage = useRef()
  const intro = useRef()
  const heroPrivate = useRef()
  const heroAny = useRef()
  const heroSecondary = useRef()
  const preLabel = useRef()
  const endAi = useRef()
  const endIdentity = useRef()
  const scrollCue = useRef()
  const debugProgress = useRef()

  const refs = useMemo(() => ({
    chapter: chapter.current,
    stage: stage.current,
    intro: intro.current,
    heroPrivate: heroPrivate.current,
    heroAny: heroAny.current,
    heroSecondary: heroSecondary.current,
    preLabel: preLabel.current,
    endAi: endAi.current,
    endIdentity: endIdentity.current,
    scrollCue: scrollCue.current,
    debugProgress: debugProgress.current,
  }), [sceneApi])

  useLayoutEffect(() => {
    if (!sceneApi || !chapter.current || !stage.current) return undefined
    const currentRefs = {
      chapter: chapter.current,
      stage: stage.current,
      intro: intro.current,
      heroPrivate: heroPrivate.current,
      heroAny: heroAny.current,
      heroSecondary: heroSecondary.current,
      preLabel: preLabel.current,
      endAi: endAi.current,
      endIdentity: endIdentity.current,
      scrollCue: scrollCue.current,
      debugProgress: debugProgress.current,
    }
    return createChapterOneTimeline({ debug, profile, reducedMotion, refs: currentRefs, sceneApi })
  }, [debug, profile, reducedMotion, sceneApi, refs])

  return (
    <section
      ref={chapter}
      className={`chapter-one${reducedMotion ? ' chapter-one--reduced' : ''}`}
      style={{ '--chapter-scroll': `${CHAPTER_SCROLL_VH}vh` }}
      aria-label="NullDrive introduction and exploded product story"
    >
      <div ref={stage} className="chapter-stage">
        <div ref={intro} className="intro-detail" aria-label="NullDrive local private system">
          <span>ND-01</span>
          <span>PRIVATE SYSTEM</span>
          <i />
          <span>LOCAL / PORTABLE</span>
        </div>

        <div className="hero-copy" aria-label="Private AI. Any machine.">
          <div className="hero-line-mask hero-line-mask--private">
            <h1 ref={heroPrivate}>PRIVATE AI.</h1>
          </div>
          <div className="hero-line-mask hero-line-mask--machine">
            <h2 ref={heroAny}>ANY MACHINE.</h2>
          </div>
          <p ref={heroSecondary} className="hero-secondary">
            Carry your workspace, memory and identity.<br />Let the host provide the compute.
          </p>
        </div>

        <div ref={preLabel} className="pre-explosion-label">
          <span>01 / ARCHITECTURE</span>
          <strong>WHAT YOU CARRY</strong>
        </div>

        <div className="chapter-end-copy" aria-label="Your AI doesn't live here. Your identity does.">
          <p ref={endAi} className="end-statement end-statement--ai">
            YOUR AI DOESN'T<br />LIVE HERE.
          </p>
          <p ref={endIdentity} className="end-statement end-statement--identity">
            YOUR IDENTITY<br /><em>DOES.</em>
          </p>
        </div>

        <div ref={scrollCue} className="scroll-cue">
          <span>SCROLL TO INSPECT</span>
          <i />
        </div>

        <div className="chapter-index" aria-hidden="true">
          <span>CHAPTER 01</span>
          <span>THE OBJECT</span>
        </div>

        {debug && (
          <aside className="debug-hud">
            <span>CHAPTER 01</span>
            <strong ref={debugProgress}>0%</strong>
            <span>{profile === undefined ? 'UNKNOWN' : 'SCROLLTRIGGER'}</span>
          </aside>
        )}
      </div>
    </section>
  )
}
