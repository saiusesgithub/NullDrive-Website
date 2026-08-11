export const GLB_PATH = '/models/null-drive-nd01-web.glb'

export const REQUIRED_NODES = [
  'NullDrive_Root',
  'Shell_Top',
  'Upper_Shield',
  'PCB_Main',
  'Internal_Frame',
  'Lower_Shield',
  'Shell_Bottom',
  'Connector_Housing',
  'USB_C_Connector',
  'USB_C_Tongue',
  'Status_LED',
  'Seam_Accent',
  'Brand_NULLDRIVE',
  'Brand_ND01',
  'Controller_IC',
  'NAND_01',
  'NAND_02',
  'Power_Management',
  'ESD_Protection',
  'Passive_Components',
  'PCB_Traces',
  'LED_Assembly',
]

export const EXPLODED_OFFSETS = {
  Shell_Top: 0.028,
  Upper_Shield: 0.017,
  PCB_Main: 0.007,
  Connector_Housing: 0.007,
  USB_C_Connector: 0.007,
  Internal_Frame: -0.007,
  Lower_Shield: -0.017,
  Shell_Bottom: -0.028,
}

export const SCENE_ORIENTATIONS = {
  initial: { x: 0.22, y: -1.08, z: -0.055 },
  hero: { x: 0.12, y: -0.36, z: -0.025 },
  preExplosion: { x: 0.24, y: -0.55, z: 0.018 },
  exploded: { x: 0.08, y: 0.24, z: -0.025 },
}

export const SCENE_PROFILES = {
  desktop: {
    camera: [2.7, 1.65, 3.25],
    initialScale: 16,
    heroScale: 25,
    preExplosionScale: 23,
    explodedScale: 21.5,
    heroPosition: [0.08, 0.01, 0],
    preExplosionPosition: [0, 0.03, 0],
    explodedPosition: [0.16, 0.015, 0],
  },
  laptop: {
    camera: [2.85, 1.7, 3.45],
    initialScale: 14.5,
    heroScale: 22,
    preExplosionScale: 20.5,
    explodedScale: 19,
    heroPosition: [0.04, 0.02, 0],
    preExplosionPosition: [0, 0.03, 0],
    explodedPosition: [0.1, 0.015, 0],
  },
  tablet: {
    camera: [2.95, 1.8, 3.65],
    initialScale: 12.5,
    heroScale: 18,
    preExplosionScale: 17,
    explodedScale: 16,
    heroPosition: [0, 0.03, 0],
    preExplosionPosition: [0, 0.04, 0],
    explodedPosition: [0, 0.015, 0],
  },
  mobile: {
    camera: [3.05, 1.9, 3.9],
    initialScale: 9,
    heroScale: 13.5,
    preExplosionScale: 12.6,
    explodedScale: 12.2,
    heroPosition: [0, 0.04, 0],
    preExplosionPosition: [0, 0.04, 0],
    explodedPosition: [0, 0.015, 0],
  },
}

export const LIGHTING_STATES = {
  initial: { environment: 0.025, ambient: 0.01, key: 0.025, rim: 0.11, fill: 0.01, underside: 0 },
  hero: { environment: 0.72, ambient: 0.22, key: 2.75, rim: 1.7, fill: 0.55, underside: 0.2 },
  exploded: { environment: 0.82, ambient: 0.27, key: 3.1, rim: 2.05, fill: 0.92, underside: 0.48 },
  sealed: { environment: 0.68, ambient: 0.19, key: 2.45, rim: 1.82, fill: 0.58, underside: 0.18, host: 0.18 },
  connected: { environment: 0.54, ambient: 0.14, key: 1.95, rim: 1.48, fill: 0.42, underside: 0.08, host: 0.72 },
  port: { environment: 0.08, ambient: 0.02, key: 0.12, rim: 0.24, fill: 0.05, underside: 0, host: 0.34 },
}

export const CHAPTER_SCROLL_VH = 640
export const CHAPTER_TWO_SCROLL_VH = 520
export const CHAPTER_THREE_SCROLL_VH = 620
export const CHAPTER_INTERNALS_SCROLL_VH = 520

export const INTERNALS_CAMERA_PROFILES = {
  desktop: {
    entry: [-2.34, 0.22, 0.48],
    entryTarget: [-1.48, 0.08, 0.42],
    controller: [-1.62, 0.52, 1.14],
    controllerTarget: [-1.12, 0.06, 0.4],
    reveal: [-0.3, 1.42, 2.55],
    revealTarget: [-0.05, 0, 0],
    cpu: [-0.12, 0.7, 1.08],
    cpuTarget: [0, 0.08, 0],
    ram: [1.28, 0.64, 0.06],
    ramTarget: [0.68, 0.06, -0.5],
    gpu: [1.35, 0.68, 1.28],
    gpuTarget: [0.68, 0.08, 0.5],
    wide: [0, 1.88, 2.92],
    wideTarget: [0, 0, 0],
    abstract: [0, 2.18, 3.38],
    abstractTarget: [0, 0, 0],
  },
  laptop: {
    entry: [-2.42, 0.28, 0.62],
    entryTarget: [-1.48, 0.08, 0.42],
    controller: [-1.72, 0.58, 1.28],
    controllerTarget: [-1.12, 0.06, 0.4],
    reveal: [-0.2, 1.58, 2.9],
    revealTarget: [0, 0, 0],
    cpu: [-0.1, 0.8, 1.3],
    cpuTarget: [0, 0.08, 0],
    ram: [1.38, 0.72, 0.15],
    ramTarget: [0.68, 0.06, -0.5],
    gpu: [1.45, 0.78, 1.42],
    gpuTarget: [0.68, 0.08, 0.5],
    wide: [0, 2.05, 3.35],
    wideTarget: [0, 0, 0],
    abstract: [0, 2.35, 3.8],
    abstractTarget: [0, 0, 0],
  },
  tablet: {
    entry: [-2.55, 0.42, 0.92],
    entryTarget: [-1.45, 0.08, 0.42],
    controller: [-1.82, 0.72, 1.55],
    controllerTarget: [-1.08, 0.06, 0.38],
    reveal: [0, 2.15, 4.15],
    revealTarget: [0, 0, 0],
    cpu: [0, 1.05, 1.85],
    cpuTarget: [0, 0.08, 0],
    ram: [1.55, 0.95, 0.34],
    ramTarget: [0.68, 0.06, -0.5],
    gpu: [1.62, 1.02, 1.8],
    gpuTarget: [0.68, 0.08, 0.5],
    wide: [0, 2.9, 5.3],
    wideTarget: [0, 0, 0],
    abstract: [0, 3.25, 5.8],
    abstractTarget: [0, 0, 0],
  },
  mobile: {
    entry: [-2.72, 0.62, 1.3],
    entryTarget: [-1.42, 0.08, 0.42],
    controller: [-1.9, 0.9, 1.82],
    controllerTarget: [-1.08, 0.06, 0.38],
    reveal: [0, 3.55, 6.75],
    revealTarget: [0, 0, 0],
    cpu: [0, 1.4, 2.85],
    cpuTarget: [0, 0.08, 0],
    ram: [1.78, 1.2, 0.65],
    ramTarget: [0.68, 0.06, -0.5],
    gpu: [1.92, 1.28, 2.45],
    gpuTarget: [0.68, 0.08, 0.5],
    wide: [0, 4.3, 7.9],
    wideTarget: [0, 0, 0],
    abstract: [0, 4.75, 8.55],
    abstractTarget: [0, 0, 0],
  },
}

export const CONNECTION_PROFILES = {
  desktop: {
    productScale: 8,
    productPosition: [0, 0, 0],
    hostScale: 8,
    hostHiddenPosition: [4.15, -0.55, -0.55],
    hostVisiblePosition: [0.55, -0.55, -0.55],
    hostRotation: [0, 1.05, 0],
    approachDistance: 0.025,
    alignedGap: 0.0008,
    fullSeatClearance: 0.0002,
    portCameraDistance: 0.72,
  },
  laptop: {
    productScale: 7.5,
    productPosition: [0, 0, 0],
    hostScale: 7.5,
    hostHiddenPosition: [3.75, -0.5, -0.5],
    hostVisiblePosition: [0.52, -0.5, -0.5],
    hostRotation: [0, 1.05, 0],
    approachDistance: 0.023,
    alignedGap: 0.0008,
    fullSeatClearance: 0.0002,
    portCameraDistance: 0.66,
  },
  tablet: {
    productScale: 6.3,
    productPosition: [0, 0.02, 0],
    hostScale: 6.3,
    hostHiddenPosition: [3, -0.4, -0.42],
    hostVisiblePosition: [0.42, -0.4, -0.42],
    hostRotation: [0, 1.05, 0],
    approachDistance: 0.021,
    alignedGap: 0.0008,
    fullSeatClearance: 0.0002,
    portCameraDistance: 0.56,
  },
  mobile: {
    productScale: 3.6,
    productPosition: [0, 0.04, 0],
    hostScale: 3.6,
    hostHiddenPosition: [1.8, -0.23, -0.24],
    hostVisiblePosition: [0.12, -0.23, -0.24],
    hostRotation: [0, 1.05, 0],
    approachDistance: 0.018,
    alignedGap: 0.0008,
    fullSeatClearance: 0.0002,
    portCameraDistance: 0.34,
  },
}

export function profileForWidth(width) {
  if (width < 560) return 'mobile'
  if (width < 860) return 'tablet'
  if (width < 1200) return 'laptop'
  return 'desktop'
}
