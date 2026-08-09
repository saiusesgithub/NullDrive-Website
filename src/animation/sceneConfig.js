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
}

export const CHAPTER_SCROLL_VH = 640

export function profileForWidth(width) {
  if (width < 560) return 'mobile'
  if (width < 860) return 'tablet'
  if (width < 1200) return 'laptop'
  return 'desktop'
}
