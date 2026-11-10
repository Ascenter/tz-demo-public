// Runs before the store loads. parent BR-13 in the web build: `?reset=1` on launch restores the seed.
import { STORE_KEY_RAW } from './storeKey'

const params = new URLSearchParams(location.search)
if (params.has('reset')) {
  try {
    localStorage.removeItem(STORE_KEY_RAW)
  } catch {
    /* storage blocked */
  }
  params.delete('reset') // keep the other flags (?device, ?bare, ?e2e)
  const rest = params.toString()
  history.replaceState(null, '', location.pathname + (rest ? `?${rest}` : ''))
}

// Installed PWA or a phone browser: no device frame, real safe areas.
const standalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true
const phoneSized = Math.min(window.innerWidth, window.innerHeight) < 500 && window.matchMedia('(pointer: coarse)').matches
if (standalone || phoneSized) document.documentElement.classList.add('standalone')
export const IS_FULLSCREEN = standalone || phoneSized

// Installed PWA on iOS: `position: fixed; inset: 0` (and 100 %) stop short of the home-indicator area, which leaves
// a strip of page background under the tab bar. The installed app always owns the whole screen, so size it to
// the screen itself (portrait only, manifest `orientation: portrait`); CSS falls back to 100lvh.
if (standalone) {
  const root = document.documentElement
  root.classList.add('installed')
  const fit = () => {
    const h = Math.max(window.screen.height, window.screen.width)
    root.style.setProperty('--app-height', `${h}px`)
  }
  fit()
  window.addEventListener('resize', fit)
}
