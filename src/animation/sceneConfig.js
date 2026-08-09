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
