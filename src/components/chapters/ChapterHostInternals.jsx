import { useLayoutEffect, useRef } from 'react'
import { createHostInternalsTimeline } from '../../animation/hostInternalsTimeline.js'
import { CHAPTER_INTERNALS_SCROLL_VH } from '../../animation/sceneConfig.js'

export function ChapterHostInternals({ debug, profileKey, reducedMotion, sceneApi }) {
  const chapter = useRef()
  const stage = useRef()
  const debugProgress = useRef()

  useLayoutEffect(() => {
    if (!chapter.current || !stage.current || !sceneApi?.internals) return undefined
    return createHostInternalsTimeline({
      debug,
      profileKey,
      reducedMotion,
      refs: {
        chapter: chapter.current,
        debugProgress: debugProgress.current,
        stage: stage.current,
      },
      sceneApi,
    })
  }, [debug, profileKey, reducedMotion, sceneApi])

  return (
    <section
      ref={chapter}
      className={`chapter-internals${reducedMotion ? ' chapter-internals--reduced' : ''}`}
      style={{ '--chapter-internals-scroll': `${CHAPTER_INTERNALS_SCROLL_VH}vh` }}
      aria-label="Inside the host machine"
    >
      <div ref={stage} className="chapter-internals-stage">
        <div className="internals-entry-veil" aria-hidden="true" />
        <div className="internals-entry-signal" aria-hidden="true"><i /></div>

        <div className="internals-copy internals-copy--detected">
          <span>HOST INTERFACE</span>
          <strong>HOST DETECTED.</strong>
        </div>
        <div className="internals-copy internals-copy--resources">
          <span>CAPABILITY MAP</span>
          <strong>RESOURCES AVAILABLE.</strong>
        </div>
        <div className="internals-copy internals-copy--execution">
          <span>SOFTWARE RUNTIME</span>
          <strong>MODEL EXECUTES HERE.</strong>
        </div>

        <div className="hardware-label hardware-label--usb" data-hardware="usb">
          <i /><span>USB CONTROLLER</span><small>HOST INTERFACE</small>
        </div>
        <div className="hardware-label hardware-label--cpu" data-hardware="cpu">
          <i /><span>CPU</span><small>GENERAL COMPUTE</small>
        </div>
        <div className="hardware-label hardware-label--ram" data-hardware="ram">
          <i /><span>RAM</span><small>ACTIVE MEMORY</small>
        </div>
        <div className="hardware-label hardware-label--gpu" data-hardware="gpu">
          <i /><span>GPU</span><small>ACCELERATION AVAILABLE</small>
        </div>
        <div className="hardware-label hardware-label--nvme" data-hardware="nvme">
          <i /><span>NVMe</span><small>LOCAL STORAGE</small>
        </div>

        <div className="internals-software-layer">
          <span>SOFTWARE RUNTIME / HOST</span>
          <strong>LOCAL MODEL</strong>
          <small>EXECUTING ON HOST</small>
          <i className="software-link software-link--a" />
          <i className="software-link software-link--b" />
          <i className="software-link software-link--c" />
        </div>

        <svg className="internals-abstract-overlay" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
          <g className="internals-abstract-grid">
            <path d="M0 180H1440M0 450H1440M0 720H1440M240 0V900M720 0V900M1200 0V900" />
          </g>
          <g className="internals-abstract-traces">
            <path d="M130 450H350L480 390H700" />
            <path d="M700 390H860V280H1050" />
            <path d="M700 390H920V520H1110" />
            <path d="M700 390H880V650H1030" />
            <path d="M480 390V650H610" />
          </g>
          <g className="internals-abstract-nodes">
            <rect x="310" y="410" width="128" height="80" />
            <rect x="650" y="340" width="142" height="100" />
            <rect x="1015" y="230" width="150" height="100" />
            <rect x="1070" y="478" width="190" height="84" />
            <rect x="990" y="610" width="180" height="92" />
            <rect x="550" y="615" width="168" height="76" />
          </g>
        </svg>

        <div className="internals-transition-copy">
          <span>PHYSICAL SYSTEM</span>
          <i />
          <span>LOGICAL ARCHITECTURE</span>
        </div>

        <div className="internals-chapter-index" aria-hidden="true">
          <span>CHAPTER 03A</span>
          <span>INSIDE THE HOST</span>
        </div>

        <div className="sr-only">
          A signal enters through USB-C, reaches the host USB controller and activates CPU, RAM, GPU and NVMe hardware. A local model then executes as software using those host resources.
        </div>

        {debug && (
          <aside className="debug-hud debug-hud--internals">
            <span>CHAPTER 03A</span>
            <strong ref={debugProgress}>0%</strong>
            <span>HOST INTERNALS</span>
          </aside>
        )}
      </div>
    </section>
  )
}
