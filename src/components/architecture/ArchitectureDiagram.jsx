const DATA_DOMAINS = ['IDENTITY', 'MEMORY', 'WORKSPACE', 'CONVERSATIONS', 'CONFIGURATION']

function CpuDetail({ x, y }) {
  return (
    <g className="architecture-node-detail">
      {[0, 1, 2].flatMap((row) => [0, 1, 2].map((column) => (
        <rect key={`${row}-${column}`} x={x + column * 16} y={y + row * 16} width="8" height="8" />
      )))}
    </g>
  )
}

function GpuDetail({ x, y }) {
  return (
    <g className="architecture-node-detail">
      {[0, 1, 2, 3, 4].map((index) => (
        <line key={index} x1={x} y1={y + index * 10} x2={x + 72} y2={y + index * 10} />
      ))}
    </g>
  )
}

function RamDetail({ x, y }) {
  return (
    <g className="architecture-node-detail">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <rect key={index} x={x + index * 17} y={y} width="11" height="20" />
      ))}
    </g>
  )
}

function DesktopArchitecture() {
  const domainRows = [286, 354, 422, 490, 558]

  return (
    <g className="architecture-layout architecture-layout--desktop">
      <g className="architecture-camera architecture-camera--desktop">
        <g className="v9-entry-signal">
          <path className="architecture-path architecture-path--active v9-entry-path" d="M720 450H612" />
          <circle className="architecture-signal-point v9-signal-point" cx="720" cy="450" r="3" />
        </g>

        <g className="v9-null-frame">
          <path className="architecture-frame" d="M108 206H536V622H108Z" />
          <path className="architecture-corner" d="M108 232V206H134M510 206H536V232M108 596V622H134M510 622H536V596" />
          <text className="architecture-kicker" x="132" y="244">NULL//DRIVE</text>
          <text className="architecture-title" x="132" y="272">PORTABLE STATE</text>
          <text className="architecture-index" x="490" y="244">ND / 01</text>

          {DATA_DOMAINS.map((label, index) => {
            const y = domainRows[index]
            return (
              <g className="architecture-data-node v9-null-node" key={label}>
                <rect x="132" y={y} width="198" height="45" />
                <circle cx="151" cy={y + 22.5} r="2" />
                <text x="170" y={y + 27}>{label}</text>
                <text className="architecture-node-id" x="302" y={y + 27}>0{index + 1}</text>
              </g>
            )
          })}

          {domainRows.map((y, index) => (
            <path
              className="architecture-path v9-null-path"
              d={`M330 ${y + 22.5}H404V450H536`}
              key={index}
            />
          ))}
          <path className="architecture-path architecture-path--active v9-null-bus" d="M536 450H612" />
          <text className="architecture-microcopy" x="444" y="436">PERSISTENT STATE BUS</text>
        </g>

        <g className="v9-transport">
          <path className="architecture-path architecture-path--inactive" d="M612 438H828" />
          <path className="architecture-path architecture-path--inactive" d="M612 462H828" />
          <path className="architecture-path architecture-path--active v9-transport-path" d="M612 450H828" />
          <rect className="architecture-interface" x="679" y="420" width="82" height="60" rx="8" />
          <text className="architecture-interface-label" x="720" y="444">USB-C</text>
          <text className="architecture-interface-meta" x="720" y="464">LOCAL TRANSPORT</text>
          <circle className="architecture-signal-packet v9-transport-packet v9-transport-packet--desktop" cx="612" cy="450" r="3" />
          <circle className="architecture-signal-packet v9-transport-packet v9-transport-packet--desktop" cx="612" cy="450" r="2" />
          <text className="architecture-microcopy v9-transport-meta" x="652" y="502">NO NETWORK REQUIRED</text>
        </g>

        <g className="v9-host-frame">
          <path className="architecture-frame" d="M828 150H1332V694H828Z" />
          <path className="architecture-corner" d="M828 176V150H854M1306 150H1332V176M828 668V694H854M1306 694H1332V668" />
          <text className="architecture-kicker" x="858" y="192">HOST MACHINE</text>
          <text className="architecture-title" x="858" y="220">COMPUTE</text>
          <text className="architecture-index" x="1277" y="192">LOCAL / 01</text>

          <g className="architecture-host-interface v9-host-interface">
            <rect x="858" y="412" width="122" height="76" />
            <circle cx="880" cy="450" r="3" />
            <text x="900" y="444">HOST</text>
            <text className="architecture-node-id" x="900" y="462">INTERFACE</text>
          </g>
          <path className="architecture-path architecture-path--active v9-host-path" d="M828 450H858" />
          <path className="architecture-path v9-host-path" d="M980 450H1020V304H1060" />
          <path className="architecture-path v9-host-path" d="M980 450H1060" />
          <path className="architecture-path v9-host-path" d="M980 450H1020V572H1060" />

          <g className="architecture-hardware-node architecture-hardware-node--cpu v9-hardware-node" data-node="cpu">
            <rect x="1060" y="248" width="122" height="112" />
            <text x="1080" y="278">CPU</text>
            <text className="architecture-node-id" x="1152" y="278">P / 01</text>
            <CpuDetail x={1090} y={298} />
          </g>

          <g className="architecture-hardware-node architecture-hardware-node--ram v9-hardware-node" data-node="ram">
            <rect x="1060" y="408" width="214" height="84" />
            <text x="1080" y="438">RAM</text>
            <text className="architecture-node-id" x="1237" y="438">M / 01</text>
            <RamDetail x={1090} y={454} />
          </g>

          <g className="architecture-hardware-node architecture-hardware-node--gpu v9-hardware-node" data-node="gpu">
            <rect x="1060" y="528" width="184" height="96" />
            <text x="1080" y="558">GPU</text>
            <text className="architecture-node-id" x="1208" y="558">P / 02</text>
            <GpuDetail x={1090} y={576} />
          </g>

          <path className="architecture-path v9-model-path" d="M1182 304H1292V730H1118" />
          <path className="architecture-path v9-model-path" d="M1274 450H1292" />
          <path className="architecture-path v9-model-path" d="M1244 576H1292" />
        </g>

        <g className="architecture-local-model v9-local-model">
          <rect x="938" y="710" width="354" height="92" />
          <path d="M958 730H978M958 738H970" />
          <text className="architecture-kicker" x="998" y="746">SOFTWARE RUNTIME</text>
          <text className="architecture-title" x="998" y="776">LOCAL MODEL</text>
          <text className="architecture-node-id" x="1193" y="776">EXECUTES ON HOST</text>
        </g>

        <g className="architecture-ambient v9-metadata">
          <text x="108" y="676">STATE://MOUNTED</text>
          <text x="108" y="698">BUS 03 / LOCAL</text>
          <text x="1234" y="116">SYS 0x4E44</text>
          <path d="M78 118H196M78 124H132M1260 748H1360" />
        </g>
      </g>
    </g>
  )
}

function MobileArchitecture() {
  const domainRows = [208, 258, 308, 358, 408]

  return (
    <g className="architecture-layout architecture-layout--mobile">
      <g className="architecture-camera architecture-camera--mobile">
        <g className="v9-entry-signal">
          <path className="architecture-path architecture-path--active v9-entry-path" d="M195 74V128" />
          <circle className="architecture-signal-point v9-signal-point" cx="195" cy="74" r="2.5" />
        </g>

        <g className="v9-null-frame">
          <path className="architecture-frame" d="M40 128H350V448H40Z" />
          <path className="architecture-corner" d="M40 150V128H62M328 128H350V150M40 426V448H62M328 448H350V426" />
          <text className="architecture-kicker" x="62" y="160">NULL//DRIVE</text>
          <text className="architecture-title" x="62" y="184">PORTABLE STATE</text>
          {DATA_DOMAINS.map((label, index) => {
            const y = domainRows[index]
            return (
              <g className="architecture-data-node v9-null-node" key={label}>
                <rect x="62" y={y} width="176" height="34" />
                <circle cx="76" cy={y + 17} r="1.6" />
                <text x="91" y={y + 21}>{label}</text>
              </g>
            )
          })}
          {domainRows.map((y, index) => (
            <path className="architecture-path v9-null-path" d={`M238 ${y + 17}H286V448`} key={index} />
          ))}
        </g>

        <g className="v9-transport">
          <path className="architecture-path architecture-path--active v9-null-bus" d="M286 448V488H195" />
          <path className="architecture-path architecture-path--inactive" d="M183 488V582" />
          <path className="architecture-path architecture-path--inactive" d="M207 488V582" />
          <path className="architecture-path architecture-path--active v9-transport-path" d="M195 488V582" />
          <rect className="architecture-interface" x="151" y="505" width="88" height="54" rx="8" />
          <text className="architecture-interface-label" x="195" y="528">USB-C</text>
          <text className="architecture-interface-meta" x="195" y="545">LOCAL</text>
          <circle className="architecture-signal-packet v9-transport-packet v9-transport-packet--mobile" cx="195" cy="488" r="2.7" />
          <circle className="architecture-signal-packet v9-transport-packet v9-transport-packet--mobile" cx="195" cy="488" r="1.8" />
        </g>

        <g className="v9-host-frame">
          <path className="architecture-frame" d="M40 582H350V896H40Z" />
          <path className="architecture-corner" d="M40 604V582H62M328 582H350V604M40 874V896H62M328 896H350V874" />
          <text className="architecture-kicker" x="62" y="616">HOST MACHINE</text>
          <text className="architecture-title" x="62" y="640">COMPUTE</text>
          <g className="architecture-host-interface v9-host-interface">
            <rect x="62" y="660" width="100" height="52" />
            <text x="78" y="684">HOST</text>
            <text className="architecture-node-id" x="78" y="699">INTERFACE</text>
          </g>
          <path className="architecture-path architecture-path--active v9-host-path" d="M195 582V646H112V660" />
          <path className="architecture-path v9-host-path" d="M162 686H188V750H210" />
          <path className="architecture-path v9-host-path" d="M188 750V810H210" />
          <path className="architecture-path v9-host-path" d="M188 750V864H210" />

          <g className="architecture-hardware-node architecture-hardware-node--cpu v9-hardware-node" data-node="cpu">
            <rect x="210" y="710" width="96" height="72" />
            <text x="224" y="734">CPU</text>
            <CpuDetail x={240} y={744} />
          </g>
          <g className="architecture-hardware-node architecture-hardware-node--ram v9-hardware-node" data-node="ram">
            <rect x="210" y="798" width="116" height="50" />
            <text x="224" y="820">RAM</text>
            <RamDetail x={222} y={813} />
          </g>
          <g className="architecture-hardware-node architecture-hardware-node--gpu v9-hardware-node" data-node="gpu">
            <rect x="210" y="860" width="116" height="58" />
            <text x="224" y="884">GPU</text>
            <GpuDetail x={244} y={879} />
          </g>
        </g>

        <g className="architecture-local-model v9-local-model">
          <rect x="62" y="936" width="264" height="76" />
          <text className="architecture-kicker" x="82" y="964">SOFTWARE RUNTIME</text>
          <text className="architecture-title" x="82" y="990">LOCAL MODEL</text>
          <text className="architecture-node-id" x="245" y="990">ON HOST</text>
          <path className="architecture-path v9-model-path" d="M268 918V936" />
        </g>

        <g className="architecture-ambient v9-metadata">
          <text x="40" y="1050">STATE MOUNTED / HOST READY / MODEL AVAILABLE</text>
          <path d="M40 1066H350" />
        </g>
      </g>
    </g>
  )
}

export function ArchitectureDiagram() {
  return (
    <div className="architecture-diagram" aria-hidden="true">
      <svg className="architecture-svg architecture-svg--desktop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="nd-grid-desktop" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" className="architecture-grid-line" />
          </pattern>
          <filter id="nd-signal-glow-desktop" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect className="architecture-grid" width="1440" height="900" fill="url(#nd-grid-desktop)" />
        <DesktopArchitecture />
      </svg>

      <svg className="architecture-svg architecture-svg--mobile" viewBox="0 0 390 1100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="nd-grid-mobile" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" className="architecture-grid-line" />
          </pattern>
        </defs>
        <rect className="architecture-grid" width="390" height="1100" fill="url(#nd-grid-mobile)" />
        <MobileArchitecture />
      </svg>
    </div>
  )
}
