import './cachebust.js';   // (first: every asset request of a release gets ?v=<build> - src/cachebust.js)
import { load, save, maxPresetFor, PRESET_ORDER, PRESETS, RISKY, menuPreset } from './graphics.js';
import { TOUCH, CAN_FULLSCREEN, LITE, LAST_LOAD_DIED, IN_APP_BROWSER, requestLandscape } from './device.js';
import { quipCycle } from './loadquips.js';
import { sendIfCrashed, startRecording, blackBox } from './blackbox.js';   // (the phone black box: crash reports to the AI server)
import { LoadCrumb } from './loadcrumb.js';   // (the per-tab load crumb)
import './analytics.js';   // (anonymous play stats, public build only: the launch funnel - src/analytics.js)
import { detectInApp, mountInAppBar } from './inapp.js';     // TikTok / Instagram / Facebook / Messenger / Snapchat's browsers
import { mountCommunityLinks } from './links.js';           // the Discord link (src/links.js): on the title while the city loads, and in the pause menu
const quality = document.getElementById('launch-quality');
// (phones: High and Ultra say they may crash an older iPhone; an in-app browser runs Low at most - src/graphics.js
//  DEVICE_MAX; a phone whose last visit died starts one preset lighter, saved - the first load of the page, here, before
//  src/main.js reads it)
export const DEVICE = { touch: TOUCH, lite: LITE, inApp: IN_APP_BROWSER };
const GFX0 = load(undefined, globalThis, { ...DEVICE, died: !!LAST_LOAD_DIED && (TOUCH || LITE) });
{
  const max = maxPresetFor(DEVICE);
  for (const o of quality.options) {
    if (max && PRESET_ORDER.indexOf(o.value) > PRESET_ORDER.indexOf(max)) { o.disabled = true; o.textContent = `${PRESETS[o.value].label} (open in Safari / Chrome)`; }
    else if ((TOUCH || LITE) && RISKY.includes(o.value)) o.textContent = `${PRESETS[o.value].label} (uses more memory)`;
  }
}
quality.value = menuPreset(GFX0.preset);
document.getElementById('launch-apply').addEventListener('click', () => {
  const settings = { ...load(), preset: quality.value, gtao: null, bloom: null };
  if (save(settings)) location.reload();
  else document.getElementById('launch-device').textContent = 'Your browser could not save settings. Allow site storage, then try again.';
});
// phones and tablets: on-screen controls (src/touch.js); the game plays sideways whichever way the phone is held
if (TOUCH) {
  // Play: full screen and a landscape lock where the browser has them (Android), inside the tap - the only time a page
  // may ask. An iPhone has neither: held upright, the game turns itself (src/device.js view, #stage).
  document.getElementById('startBtn').addEventListener('click', () => { requestLandscape().catch(() => {}); });
}
// In-app browsers (TikTok, Instagram, Facebook, Messenger, Snapchat): a small bar on the title screen saying how to open
// the game in Safari / Chrome, with Copy link (src/inapp.js). Play still works there; the bar never blocks it.
const IN_APP = detectInApp();
try { mountInAppBar({ info: IN_APP }); } catch (err) { console.warn('in-app bar', err); }
// the Full screen button only where there is one (not on iPhone; not in an app's web view either: Android's report the
// API but the apps don't implement it, so the button would do nothing)
if (!CAN_FULLSCREEN || IN_APP) document.getElementById('launch-fullscreen').hidden = true;
try { mountCommunityLinks(document); } catch (err) { console.warn('community links', err); }
// the pause menu's Controls: the same key list the title's "How to play" shows (keyboard on PCs, the buttons on phones)
try {
  const host = document.querySelector('[data-controls-host]');
  for (const g of document.querySelectorAll('#title .controls-grid')) if (host) host.appendChild(g.cloneNode(true));
} catch (err) { console.warn('controls help', err); }
// Privacy: the anonymous play stats box (src/analytics.js: window.__analytics, when it's on the page)
{
  const box = document.getElementById('stats-optin');
  const A = () => window.__analytics || null;
  // (Do Not Track / Global Privacy Control on: nothing is sent whatever the box says - shown off and disabled, with why)
  const sync = () => {
    try {
      const a = A(); if (!box || !a) return;
      const signal = !!a.signalOff?.();
      const off = a.isOptedOut ? a.isOptedOut() : a.optedOut ? a.optedOut() : false;
      box.checked = !off && !signal; box.disabled = signal;
      const dim = box.closest('.stats-row')?.querySelector('.dim');
      if (dim && signal && !dim.dataset.signal) { dim.dataset.signal = '1'; dim.textContent = 'Off: your browser asks sites not to track (Do Not Track / Global Privacy Control), so no play stats or crash reports are sent.'; }
    } catch { /* analytics optional */ }
  };
  // (the same box covers the automatic crash reports: src/blackbox.js reads the opt-out before every send)
  box?.addEventListener('change', () => { try { A()?.optOut?.(!box.checked); } catch { /* analytics optional */ } try { blackBox.consentChanged(); } catch { /* optional */ } });
  box?.closest('details')?.addEventListener('toggle', sync);
  sync(); setTimeout(sync, 0);
}

document.getElementById("launch-retry").addEventListener("click", () => location.reload());

const start = document.getElementById('startBtn');
const stage = document.getElementById('launch-stage');
// the loading bar follows the stages main.js writes on the Play button (src/main.js, src/osm/index.js phases): a known
// stage sets its share, an unknown one creeps forward; it never goes backwards, and fills when Play is ready
const bar = document.querySelector('#launch-loading progress');
const STAGES = [[/brisbane map/i, 0.04], [/models/i, 0.16], [/pavers/i, 0.3], [/laying the streets/i, 0.4], [/traffic lights/i, 0.48],
  [/trees and street/i, 0.56], [/towers/i, 0.66], [/signals/i, 0.74], [/merging/i, 0.8], [/filling the streets/i, 0.86], [/shaders/i, 0.93], [/^(play|continue|recover)/i, 1]];
// (the ready button reads Play, or Continue / Recover saved game when there is a save - src/saveflow.js)
const READY = /^(play|continue|recover)/i;
let done = 0.02;
if (bar) { bar.max = 1; bar.value = done; }
// what the player reads meanwhile: a fun local line every ~2.4 s (src/loadquips.js), not the stage names; a failure or
// the finished load shows the real text
const nextQuip = quipCycle();
const showQuip = () => { stage.classList.remove('quip-in'); void stage.offsetWidth; stage.textContent = nextQuip(); stage.classList.add('quip-in'); };
showQuip();
let quipTimer = setInterval(showQuip, 2400);
const stopQuips = () => { clearInterval(quipTimer); quipTimer = 0; };
// the load safety net (src/device.js): the stage reached is kept until Play is ready; if this tab dies first (a phone
// out of memory), the next visit sees it, goes Lite, and says where it stopped
const crumb = v => { if (v) LoadCrumb.set(v); else LoadCrumb.clear(); };   // (per tab: src/loadcrumb.js)
if (LAST_LOAD_DIED) {
  const note = document.getElementById('launch-device');
  if (note) note.textContent = "The game didn't close cleanly last time, so lighter graphics are on." + (GFX0.lowered ? ` Quality lowered to ${PRESETS[GFX0.preset].label}.` : '');
}
sendIfCrashed();                               // (before the new crumbs overwrite the last visit's)
crumb('Preparing Brisbane');
start.addEventListener('click', () => { if (!start.disabled) startRecording(); }, { once: true });
// (and the first half-minute of play: the city's first frames on the GPU are the other moment a phone runs out)
// (src/main.js writes the play-time crumbs and clears them on pagehide: a normal close is not a crash)
new MutationObserver(() => {
  window.BrisbaneDiagnostics?.stage(start.textContent);
  const t = start.textContent, hit = STAGES.find(([re]) => re.test(t));
  crumb(READY.test(t) || /could not load/i.test(t) ? '' : t);
  if (/could not load/i.test(t)) { stopQuips(); stage.textContent = t; document.getElementById('title').classList.add('load-failed'); return; }   // (style.css: no bar, no "building" line)
  if (READY.test(t)) { stopQuips(); stage.textContent = 'Brisbane is ready. Off you go.'; }
  if (!bar) return;
  done = Math.max(done, hit ? hit[1] : Math.min(0.95, done + (0.95 - done) * 0.15));
  bar.value = done;
}).observe(start, { childList: true, subtree: true });
document.getElementById('launch-fullscreen').addEventListener('click', async () => {
  try {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) await (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else await (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
  } catch { document.getElementById('launch-device').textContent = 'Full screen is not available in this browser.'; }
});
// the bottom links: one panel open at a time, and a tap anywhere else closes it
const menus = [...document.querySelectorAll('.launch-bottom details')];
for (const d of menus) d.addEventListener('toggle', () => { if (d.open) for (const o of menus) if (o !== d) o.open = false; });
document.addEventListener('pointerdown', e => { if (!e.target.closest?.('.launch-bottom')) for (const d of menus) d.open = false; });
// Title music (assets/sounds/title_music.mp3, "This Heavy Metal" by MrClaps_, Pixabay Content License - assets/sounds/
// CREDITS.md). On by default: it tries to start as the page opens, and where the browser blocks sound until the visitor
// interacts (iPhone Safari always, most browsers on a first visit) it starts on the first tap, click or key anywhere.
// Every new page starts with music enabled. Muting lasts for this visit only.
// Browser-blocked autoplay is shown as waiting for a tap, not as the player choosing Off.
// It streams through an <audio> element into a WebAudio gain (iOS ignores <audio>.volume) at 25 %, and fades out over
// 1.2 s when Play is pressed, then lets everything go.
{
  // (iOS: the page is a media player - the silent switch doesn't mute it. Set once at load, before any sound: switching it
  //  right before a play() leaves WebKit's context 'interrupted' and the music doesn't start. main.js sets it again at Play)
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* older Safari */ }
  const btn = document.getElementById('launch-sound');
  // (off by default on localhost and staging - the owner's rule - for automated test browsers (navigator.webdriver) and
  //  with ?music=0; on for players on the main site. The Music button still turns it on for the visit.)
  const devHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /^staging\./.test(location.hostname);
  let audio = null, ctx = null, gain = null, on = false, gone = false, waiting = false, tries = 0;
  let enabled = !devHost && !navigator.webdriver && !/[?&]music=0\b/.test(location.search);
  const show = () => {
    btn.textContent = !enabled ? '🔇 Music: Off' : on ? '🔊 Music: On' : '🔊 Music: On · tap to start';
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  };
  function make() {
    audio = new Audio('assets/sounds/title_music.mp3');
    audio.loop = true; audio.preload = 'auto';
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC(); gain = ctx.createGain(); gain.gain.value = 0.25;
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
    } catch { ctx = null; gain = null; audio.volume = 0.25; }
  }
  /** -> Promise<bool>: playing and audible (a suspended AudioContext would play it silently: that counts as blocked) */
  async function start() {
    if (gone || !enabled) return false;
    if (!audio) make();
    const my = ++tries;   // (a tap is pointerdown - not a sound-unlocking gesture - then touchend / click, which is:
                          //  only the latest attempt may decide, or the first one's failure pauses the second's success)
    try { ctx?.resume?.().catch(() => {}); await audio.play(); } catch { /* blocked until a gesture */ }
    if (my !== tries || gone || !audio) return on;
    on = !audio.paused && (!ctx || ctx.state === 'running');
    if (!on && ctx && !audio.paused) { try { await ctx.resume(); } catch { /* still blocked */ } on = ctx.state === 'running'; }
    if (my !== tries) return on;
    if (!on) audio?.pause();
    show();
    return on;
  }
  function stop() { ++tries; on = false; audio?.pause(); show(); }
  function release() {
    gone = true; btn.hidden = true; unwait();
    if (!audio) return;
    const a = audio, c = ctx, g = gain; audio = ctx = gain = null;
    const end = () => { a.pause(); a.removeAttribute('src'); a.load(); c?.close?.().catch(() => {}); };
    if (g && c && !a.paused) { g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0, c.currentTime + 1.2); setTimeout(end, 1300); }
    else end();
  }
  // the first gesture anywhere (not the music button itself, not Play) starts it
  const GESTURES = ['pointerdown', 'touchend', 'click', 'keydown'];
  function onGesture(e) {
    if (e.target?.closest?.('#launch-sound, #startBtn')) return;
    start().then(ok => { if (ok) unwait(); });
  }
  function wait() { if (waiting || gone || !enabled) return; waiting = true; for (const t of GESTURES) addEventListener(t, onGesture, { capture: true, passive: true }); }
  function unwait() { if (!waiting) return; waiting = false; for (const t of GESTURES) removeEventListener(t, onGesture, { capture: true }); }
  if (btn) {
    show();
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (enabled) { enabled = false; stop(); unwait(); }
      else { enabled = true; show(); start().then(ok => { if (!ok) wait(); }); }
    });
    document.getElementById('startBtn').addEventListener('click', release, { once: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden && audio && on) audio.pause(); else if (!document.hidden && audio && on) audio.play().catch(() => {}); });
    start().then(ok => { if (!ok) wait(); });
  }
}
