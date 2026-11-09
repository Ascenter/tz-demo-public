import PawLoader56 from '../assets/icons/loader_paw_56.svg?react'

/**
 * Gradient spinner (Figma "FFSpinner / Dark mode=False", 20 pt). The exported SVG paints its angular
 * gradient through a foreignObject, so the same ring is drawn here with a CSS conic gradient and mask.
 */
export function Spinner({ size = 20 }: { size?: number }) {
  const ring = `radial-gradient(farthest-side, transparent calc(100% - ${(size * 2.5) / 20.5}px), #000 calc(100% - ${(size * 2.5) / 20.5}px))`
  return (
    <span
      role="progressbar"
      aria-busy="true"
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: 'conic-gradient(from 90deg, #84a5fe 0deg, #ffc889 1.4deg, #fe8eec 180deg, #84a5fe 270deg, transparent 270deg)',
        WebkitMask: ring,
        mask: ring,
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}

/** Paw loader (Figma "loader & spinners / Color=Gradient", 56 pt white circle with a shadow): QR check, backend waits. */
export function PawLoader() {
  return (
    <span className="relative grid size-[88px] place-items-center" style={{ animation: 'paw-pulse 1.1s ease-in-out infinite' }}>
      <PawLoader56 width={88} height={88} aria-hidden="true" />
    </span>
  )
}
