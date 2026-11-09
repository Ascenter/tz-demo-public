// Device profiles for the desktop rehearsal frame and the design checks.
// The demo runs on an iPhone 15 Plus (430 × 932 pt, @3x, Dynamic Island: safe areas 59 / 34).
// The Figma frames are 402 × 874 pt with a 44 pt status bar; design:check renders that profile
// so Figma coordinates and PNGs line up 1:1 (`?device=figma`).
export interface Device {
  id: 'iphone15plus' | 'figma'
  width: number
  height: number
  safeTop: number
  safeBottom: number
}

export const DEVICES: Record<Device['id'], Device> = {
  iphone15plus: { id: 'iphone15plus', width: 430, height: 932, safeTop: 59, safeBottom: 34 },
  figma: { id: 'figma', width: 402, height: 874, safeTop: 44, safeBottom: 34 },
}

const params = new URLSearchParams(location.search)

/** `?device=figma` picks the Figma frame; default is the iPhone 15 Plus. */
export const DEVICE: Device = DEVICES[(params.get('device') as Device['id']) ?? 'iphone15plus'] ?? DEVICES.iphone15plus

/** `?bare=1`: no frame or page padding, the phone screen fills the viewport (screenshots, design:check). */
export const BARE = params.has('bare')
