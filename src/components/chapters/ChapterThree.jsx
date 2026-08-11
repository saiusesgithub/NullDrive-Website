import { useLayoutEffect, useRef } from 'react'
import { createChapterThreeTimeline } from '../../animation/chapterThreeTimeline.js'
import { CHAPTER_THREE_SCROLL_VH } from '../../animation/sceneConfig.js'
import { ArchitectureDiagram } from '../architecture/ArchitectureDiagram.jsx'

export function ChapterThree({ debug, reducedMotion, sceneApi }) {
  const chapter = useRef()
  const stage = useRef()
  const debugProgress = useRef()

  useLayoutEffect(() => {
    if (!chapter.current || !stage.current) return undefined
    return createChapterThreeTimeline({
      debug,
      reducedMotion,
      refs: {
        chapter: chapter.current,
        debugProgress: debugProgress.current,
        stage: stage.current,
      },
      sceneApi,
    })
  }, [debug, reducedMotion, sceneApi])

  return (
    <section
      ref={chapter}
      className={`chapter-three${reducedMotion ? ' chapter-three--reduced' : ''}`}
      style={{ '--chapter-three-scroll': `${CHAPTER_THREE_SCROLL_VH}vh` }}
      aria-label="NullDrive and host compute architecture"
    >
      <div ref={stage} className="chapter-three-stage">
        <ArchitectureDiagram />

        <div className="architecture-copy architecture-copy--carry">
          <span>PORTABLE STATE</span>
          <strong>WHAT YOU CARRY.</strong>
          <p>YOUR STATE MOVES WITH YOU.</p>
        </div>

        <div className="architecture-copy architecture-copy--host">
          <span>HOST COMPUTE</span>
          <strong>WHAT YOUR MACHINE PROVIDES.</strong>
        </div>

        <div className="architecture-final-copy">
          <p><span>YOUR DATA.</span><span>YOUR MACHINE.</span><span>YOUR MODEL.</span></p>
          <strong>NO CLOUD REQUIRED.</strong>
        </div>

        <div className="architecture-status v9-final-status" aria-hidden="true">
          <span>HOST READY</span>
          <span>LOCAL MODEL AVAILABLE</span>
          <span>STATE MOUNTED</span>
        </div>

        <div className="architecture-chapter-index" aria-hidden="true">
          <span>CHAPTER 03</span>
          <span>ENTER THE MACHINE</span>
        </div>

        <div className="sr-only">
          NullDrive carries identity, memory, workspace, conversations and configuration. Data travels locally over USB-C. The host machine provides CPU, GPU and RAM, allowing a local model to execute on the host.
        </div>

        {debug && (
          <aside className="debug-hud debug-hud--v9">
            <span>CHAPTER 03</span>
            <strong ref={debugProgress}>0%</strong>
            <span>ARCHITECTURE</span>
          </aside>
        )}
      </div>
    </section>
  )
}
