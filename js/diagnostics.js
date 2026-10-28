// Runs before game modules. Local-only, bounded breadcrumbs survive a tab termination.
// "Report a problem" (index.html: the title screen's bottom row and the pause menu): View shows this report, Save / share
// hands it over as a file (the share sheet on a phone, a download elsewhere). Nothing here is sent anywhere by itself;
// the report also carries what the crash black box holds (src/blackbox.js window.__blackbox: pending crash reports and
// this tab's recording), so a report that could not be uploaded can still be saved by hand.
// A session that never reached pagehide is marked "interrupted (unconfirmed)" at the next visit: mobile browsers don't
// reliably fire pagehide (MDN), so it may have been a crash, a reload or a swipe-away - not proof of running out of memory.
(() => {
  'use strict';
  const key = 'bs.diagnostics.v1', version = '2026-10-10-report-1';
  let sessions = [], storageAvailable = true, lastSample = 0;
  try {
    const raw = localStorage.getItem(key);
    if (raw && raw.length < 200000) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) sessions = parsed.slice(-2);
    }
  } catch { storageAvailable = false; }
  for (const s of sessions) if (s && s.status === 'open') s.status = 'interrupted (unconfirmed)';
  let build = '';
  try { build = document.querySelector('meta[name="build"]')?.content || 'dev'; } catch { build = ''; }
  const session = { version, build, started: new Date().toISOString(), status: 'open',
    device: { agent: navigator.userAgent, width: screen.width, height: screen.height,
      dpr: devicePixelRatio }, events: [] };
  sessions.push(session);
  const clean = value => String(value || '').replace(/https?:\/\/[^\s)]+/g, url => {
    try { const u = new URL(url); return u.origin + u.pathname; } catch { return '[url]'; }
  }).slice(0, 600);
  function persist() {
    session.saved = new Date().toISOString();
    try { localStorage.setItem(key, JSON.stringify(sessions)); storageAvailable = true; }
    catch { storageAvailable = false; }
  }
  function record(type, data = {}) {
    session.events.push({ time: new Date().toISOString(), type, ...data });
    if (session.events.length > 90) session.events.splice(1, session.events.length - 90);
    persist();
  }
  function report() {
    persist();
    let crash = null;
    try { crash = window.__blackbox?.exportable?.() || null; } catch { crash = null; }
    return JSON.stringify({
      note: 'Brisbane Streets diagnostics, from this device only. A session marked "interrupted (unconfirmed)" stopped without a clean exit: a crash, a reload or a closed tab - not proof of an out-of-memory error. textures / geometries / programs are counts of live renderer objects, not memory sizes. fps / p50 / p95 / worst count frames the game actually rendered (frame times in ms).',
      build, storageAvailable, sessions, crashReports: crash }, null, 2);
  }
  window.BrisbaneDiagnostics = {
    stage: label => record('stage', { label: clean(label) }),
    sample: data => {
      const now = Date.now();
      if (now - lastSample < 10000) return;
      lastSample = now;
      const numbers = {};
      for (const [k, v] of Object.entries(data)) if (typeof v === 'number' && Number.isFinite(v)) numbers[k] = Math.round(v * 100) / 100;
      // (rendered frames over the last 10 s, from the game's render(): src/blackbox.js frameStats)
      try {
        const f = window.__frameStats?.summary?.(10000);
        if (f) for (const k of ['frames', 'fps', 'p50', 'p95', 'worst']) if (Number.isFinite(f[k])) numbers[k === 'frames' ? 'renderedFrames' : k === 'fps' ? 'renderedFps' : 'frame' + k.toUpperCase().replace('WORST', 'Worst')] = f[k];
      } catch { /* optional */ }
      record('frame-checkpoint', numbers);
    },
    report
  };
  addEventListener('error', e => {
    if (e.target !== window) {
      const path = e.target?.src || e.target?.href;
      if (path) record('resource-error', { path: clean(path) });
      return;
    }
    record('javascript-error', { message: clean(e.message), file: clean(e.filename), line: e.lineno, column: e.colno });
  }, true);
  addEventListener('unhandledrejection', e => record('promise-error', {
    message: clean(e.reason instanceof Error ? e.reason.name + ': ' + e.reason.message : 'Non-Error rejection')
  }));
  document.addEventListener('webglcontextlost', () => record('graphics-context-lost'), true);
  document.addEventListener('webglcontextrestored', () => record('graphics-context-restored'), true);
  document.addEventListener('visibilitychange', () => record('visibility', { state: document.visibilityState }));
  addEventListener('pagehide', e => { session.status = 'pagehide'; record('pagehide', { cached: e.persisted }); });
  addEventListener('pageshow', () => { session.status = 'open'; record('pageshow'); });
  record('boot');
  // This remains usable even when the main game module fails to start. Every "Report a problem" panel
  // ([data-diag-panel]) has a View button ([data-diag="view"]), a Save / share button ([data-diag="save"]) and a
  // read-only text box for the report; the title screen's are #diagnostic-view / -save / -report.
  async function save(output) {
    const file = new File([output.value], 'brisbane-diagnostics.json', { type: 'application/json' });
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Brisbane Streets report' }); return 'shared'; }
    } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
    const url = URL.createObjectURL(file), a = document.createElement('a');
    a.href = url; a.download = file.name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return 'saved';
  }
  document.addEventListener('DOMContentLoaded', () => {
    for (const panel of document.querySelectorAll('[data-diag-panel]')) {
      const output = panel.querySelector('textarea'), status = panel.querySelector('[data-diag-status]');
      if (!output) continue;
      const say = t => { if (status) status.textContent = t; };
      const show = () => { output.hidden = false; output.value = report(); };
      panel.querySelector('[data-diag="view"]')?.addEventListener('click', () => { show(); say('This is everything the report holds. Nothing has been sent.'); });
      panel.querySelector('[data-diag="save"]')?.addEventListener('click', async () => {
        show();
        const how = await save(output);
        say(how === 'shared' ? 'Shared.' : how === 'cancelled' ? '' : 'Saved as brisbane-diagnostics.json.');
      });
    }
  });
})();
