import './cachebust.js';   // (first: every asset request of a release gets ?v=<build> - src/cachebust.js)
import { createMemoryLab } from './memorylab.js';
import { createRoadObstacles } from './traffic-obstacles.js';
const memoryLab = createMemoryLab(location.search);
const roadObstacles = createRoadObstacles();
import * as THREE from 'three';
import { startRenderer } from './renderer-start.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import * as LY from './layout.js';
import { Human, Ibises, addLocals, mat, randomLook, PLAYER_GAIT } from './people.js';
import { playerLook, cycleOutfit, crackheadLook, currentOutfit, applyOutfit, outfitHooks, OUTFIT_IDS } from './clothes.js';   // Queensland clothes; the player's wardrobe (C: team jerseys)
import { createSaveFlow } from './saveflow.js';   // the player's save: Continue, autosave, New game, export / import (src/savegame.js)
import { MISSIONS } from './missions/registry.js';   // (the save validates mission ids against the registry)
import { makeVehicleMesh } from './vehicles.js';
import { setMetroRenderer } from './metro/model.js';   // (the Brisbane Metro's programs built before one is drawn)
import { createMetroUnlock } from './metro/unlock.js';   // (the Brisbane Metro: a code-giver at King George Square)
import { makeScooter } from './scooter.js';
import { LimeRide, LIME_TOP } from './limeride.js';
import { createWheelie } from './wheelie.js';   // wheelies on the e-bikes, manuals on a Lime (Space / the WHEELIE button, held)
import { BIKE_DRIFT } from './drift.js';           // (a skid on two wheels: the car's tyre marks / smoke / squeal, src/crime.js drift)
import { Sfx } from './audio.js';
import { rnd, pick, setDecorDetail, singlePass } from './kit.js';
import * as P from './props.js';
import { loadAssets, A, setBusDoors, vehicleMats, setCarLights, hasVehicle, disposeVehicle, animateVehicleWheels } from './assets.js';
import * as ASSETS from './assets.js';                    // (the bus destination display, when the vehicle art has one)
import { setKTX2Renderer } from './ktx2.js';
import { createVehicleLights } from './vehicle-lights.js';   // every vehicle's lamps, drawn from its light state
import { createFarCars } from './farcars.js';                // distant cars: one instanced draw per model (phones)
import { lightsOf, lightsOff } from './vehicle-light-state.js';
import { busDisplay } from './bus-routes.js';
import { createBusService } from './busservice.js';     // people on and off the buses at their stops
import { LOD } from './people.js';
import { crowdCtx } from './people.js';   // (Phase 6A: the markets' stallholders)
import { createCrime } from './crime.js';
import { createBusjack, scream as busScream } from './busjack.js';
import { createVehicleDamage } from './vehicle-damage.js';
import { engineNote, CRASH_TALK } from './vehicle-physics.js';
import { createBusRiders } from './busriders.js';
import { createHelmet } from './helmet.js';
import { footprintRing, addVehicleCollider } from './vehicle-contact.js';
import { createSwat } from './swat.js';
import { createRadio } from './radio.js';
import { createKnock, KINDS as KNOCK_KINDS, readdCollider } from './knock.js';
import { knockKeep } from './sim/knockrules.js';
import { createDelivery } from './delivery.js';
import { createNpcAI } from './npcai.js';
import { MIC } from './cityai.js';                 // the cone you're heard in when you talk out loud
import { Ragdolls, upAndFlee } from './ragdoll.js';
import { createSplash } from './splash.js';
import { createTaxis } from './taxis.js';
import { createCharacters2026 } from './characters2026_world.js';   // the 2026 characters: kebab shops, rideshare, tourists, students...
import { createCalorieGuy } from './calorieguy.js';   // Calories Guy at his table of donuts by the kebab shop (solo only)
import { createWater } from './water/index.js';   // swimming, bull sharks, jet skis, cars into the river (Phase 4)
import { createFerries } from './ferry/index.js';  // the CityCat service, boarding, taking the helm (Phase 5)
import { createRiver } from './river/index.js';     // kayaks, paddleboards, a rowing eight, tinnies and cruisers on the river
import { loadWorld, CAR_TYPES } from './osm/data.js';
import { buildOSMCity } from './osm/index.js';
import { Traffic } from './osm/traffic.js';
import { Pedestrians, PERSONAL } from './osm/peds.js';
import { loadSkyHDRI, makeSkyMaterial, captureSkyEnv } from './envmap.js';
import { createMissions } from './missions/index.js';
import { Voices } from './voices.js';
import { Variety, varyText } from './variety.js';   // (the most-repeated lines: recorded versions, shuffle-bags)
import { Reactions } from './reactions.js';
import { FOOT, moveVector, footVelocity, moveBody, footWalkable as simFootWalkable, deckFloor as simDeckFloor, standable as simStandable } from './sim/foot.js';   // (the player's on-foot step: the same arithmetic in the solo game, the online mode's prediction and the game server, 2026-10-26)   // many short reactions per situation, no repeats (data/reactions.json)
import { turnstileSource } from './aisession.js';   // (the online mode's session: the same Turnstile widget as the AI's)
import { TIER as BAKE_TIER } from './stream/mode.js';   // (which bake this device streams: the online mode loads the room's d40 collision unless it is on d40 already)
import { driveVehicle as simDriveVehicle, vehicleProfile as simVehicleProfile } from './sim/drive.js';   // (the online mode's car prediction)
import { qAxis, dqAxis, RIDE_V, moveFlags, TICK } from './sim/net.js';   // (online: inputs quantised as the wire carries them; RIDE_V: the ride speed's full scale)
import { poseVehicle } from './busjack.js';   // (the online mode poses the other players' cars with it)
import { CONFIG } from './config.js';
import { StreetLines } from './streetlines.js';   // what people say by what happened x who they are (data/street_lines.json)
import { Speech, PRIO, createLineGate } from './speech.js';
import { createOverheard } from './overheard.js';   // phone calls and muttering as you walk past (data/reactions.json heard_*)
import { createMoments } from './moments.js';       // bin chickens, magpies, a hat in the wind
import { Sequences } from './sequences.js';         // ordered conversation sequences (data/sequences.json, 2026 dialogue)
import { createWildlife, WILDLIFE_ON } from './wildlife/index.js';   // magpies, crows, gulls, ibises, possums (?wildlife=0: off)
import { Features } from './features.js';   // runtime switches for in-session A/B (__game.features.set('wildlife', false))
import { createMissionAudio } from './missions/audio.js';
import { simSteps, damp, paceFrame, refreshMeter, capPeriod, createPausedDrawGate } from './frameclock.js';
import { LoadCrumb } from './loadcrumb.js';   // the per-tab load crumb (src/device.js LAST_LOAD_DIED)
import { budget } from './budget.js';           // the phone memory budget (src/budget.js, docs/PHONE_MEMORY.md)
import { startDiag } from './diag.js';         // ?diag=1: the diagnostic samples (src/diag.js)
import { createShaderWatch } from './shaderwatch.js';   // programs for what play adds, built before it's first drawn
import { Perf, SYS } from './perf.js';              // development-only frame recorder (?perf or __game.perf.start())
import { desktopPixels, createGraphics, load as loadGraphics, save as saveGraphics, PRESETS, MENU_PRESETS, menuPreset, TARGET_FPS, populationFor, crowdPopulationFor, clampPreset, maxPresetFor, RISKY } from './graphics.js';   // quality presets
import { createSunShadow } from './shadows.js';       // the sun's shadow follows you on whole texels (no shimmer)
import { createAdaptiveResolution } from './adaptive.js';   // the resolution steps down under load (Esc menu: off by default)
import { createEshays } from './eshays.js';
import { createCombat, GETUP } from './combat.js';
import { createWeapons } from './weapons.js';
import { FOOD } from './wildlife/food.js';   // (the food's names for the weapon wheel's food slot)
import { createHitReact } from './hit_react.js';   // everyone's reaction to a street weapon hit (their own lines, the people about)   // your thongs / shoes, a cricket bat, a boomerang: Tab the wheel, 1 / LMB use, 2 drop (src/weapons.js)
import { createBodies } from './bodies.js';
import { createColView } from './colview.js';
import { createDestinations } from './npc/destinations.js';
import { createSocial } from './npc/social.js';
import { createNpcActivities } from './npc/activities.js';
import { snapshot as npcSnapshot, restore as npcRestore, saveToStorage, loadFromStorage } from './npc/persist.js';
import { createNpcDemo } from './npc/demo.js';
import { createFaults } from './faults.js';   // K (or F8): report a map fault (screenshot + pin + note -> faults/); Shift+K the list
import { AudioLog } from './audiolog.js';     // the audio play log: what was played the most (-> logs/audio_plays.jsonl)
import { createAudioLogOverlay } from './audiolog_overlay.js';   // F9: the top 20, live
import { createStreetLife, STREETLIFE_ON } from './streetlife/index.js';   // Lime riders, kids on e-bikes, kid takeovers, buskers, crashes (?streetlife=0: off)
import { fxLightsShow, fxLightsUpdate, fxLightsSetup, fxLightsAllow } from './fxlights.js';
import { watchMissions } from './analytics.js';               // (anonymous play stats: a passed mission -> mission_done)
import { TOUCH, LITE, view, IN_APP_BROWSER } from './device.js';             // a phone / tablet: the on-screen controls, the phone budget; view: the game's size (turned on a phone held upright)
import { createTouchControls, unlockAudio } from './touch.js';
import { createHudTidy } from './hudtidy.js';
import { createClipMode } from './clipmode.js';         // ?clip=1 / Shift+F10: no HUD, a cinematic camera, a 9:16 guide (docs/launch/CLIP_MODE.md)
import { createFirstMinute } from './firstminute.js';   // the First Ride welcome on a first Play; the share card after a passed mission
import { NewPlayer } from './newplayer.js';   // new-player protection: nobody starts on a newcomer for a grace period (src/newplayer.js)
import { stageEl } from './device.js';
import { sight, lanesOutOfSight } from './sight.js';                 // what the player can see now: spawns and removals out of it (pop-in pass)
import { createPopulation, rigBudget, PRIO as PRIO_RIG } from './population.js';   // the resident-rig budget (every body alive, whoever made it)
import { createCrowd, crowdAssetFor, pedImportant, CROWDLOD } from './crowd/index.js';   // the three-level crowd: rigs near, the GPU crowd mid / far (phones)
import { SIMLOD } from './simlod.js';                                // (the phones' traffic: SIMLOD.carPhone)
import { ebikeGeometry } from './streetlife/vehicles.js';   // (another player's e-bike, drawn under them online)
let _ebikeMat = null;
import { rideCam, vehicleCameraZoom } from './drivecam.js';                             // a Lime's camera: look round, it holds, swings back (as in a car)
import { phoneTextures, freeStaticGeometry, uploadStatic, uploadStaticChunked, freeUploadedTextures, setGpuReadback } from './phonemem.js';      // phones: desktop-size textures halved before upload   // the effect lights: counted only while one is lit
let faults = null;                              // (made at the end, after window.__game)
window.__boot?.mark('main');                    // (the boot supervisor, index.html: every import loaded and ran; 'main-ready' at the end)

// ------------------------------------------------------------------ renderer / scene
// The effect lights (SERT searchlight and muzzle flash, the fireworks flash, the crash flash) stay in the scene from the
// start at intensity 0 - a light added later recompiles every lit shader (src/swat.js addLights). three.js still ran the
// whole lighting model for each of them in every lit pixel (~1 ms of GPU a frame). Now a light that is off (its colour
// uniform black: intensity 0) is skipped outright - a uniform branch, the same for every pixel - and one that is on
// skips the pixels it doesn't reach (out of range, outside the cone). Same picture: such a light adds exactly nothing.
// (src/fxlights.js leaves the set out of the count altogether while all of them are dark; this covers the stretches
// they are counted - an explosion, a fireworks show, the SERT. Patched before anything compiles: every lit program.)
THREE.ShaderChunk.lights_fragment_begin = THREE.ShaderChunk.lights_fragment_begin
  .replace(/get(Point|Spot)LightInfo\( (point|spot)Light, geometryPosition, directLight \);/g,
    'directLight.visible = false; directLight.color = vec3( 0.0 );\n\t\tif ( $2Light.color != vec3( 0.0 ) ) get$1LightInfo( $2Light, geometryPosition, directLight );')
  .replace(/(\n\t\tRE_Direct\( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight \);\n\t\}\n\t#pragma unroll_loop_end\n#endif\n#if \( NUM_(?:SPOT|SUN)_LIGHTS)/g,
    '\n\t\tif ( directLight.visible )$1');
if ((THREE.ShaderChunk.lights_fragment_begin.match(/if \( directLight\.visible \)/g) || []).length !== 2) console.warn('lights_fragment_begin: the effect-light skip did not apply (three.js changed?)');
// A skinned mesh's bounding sphere (culling, and three's depth sort of every object - clothes and kits that are never
// culled too) was worked out on the CPU the first time each one was drawn, every vertex skinned: 1-20 ms a mesh, so a
// group of eshays coming into view cost a 50 ms frame (tools/perf/hitch_bench.mjs --sk). The geometry's bind-pose
// sphere, padded to twice its size (2 m at least: a lying, reaching or kicking body stays inside), at no cost.
// A person's bone texture went up to the GPU every frame they were drawn, posed that frame or not: a seated local or
// someone standing still between their (rationed) poses re-sent the same matrices 30 times a second. Now only when
// they changed: the same pixels on screen, a fraction of the uploads (2026-10-18: Safari's page memory grew with the
// WebGL data a page sends). ?boneskip=0: three.js's own, to compare.
if (!/[?&]boneskip=0/.test(location.search)) {
  const update0 = THREE.Skeleton.prototype.update;
  THREE.Skeleton.prototype.update = function () {
    const t = this.boneTexture;
    if (!t) return update0.call(this);
    const v = t.version, sv = t.source.version;
    update0.call(this);
    const m = this.boneMatrices, prev = this._sent;
    if (prev && prev.length === m.length && t === this._sentTex) {
      let same = true;
      for (let i = 0, n = m.length; i < n; i++) if (m[i] !== prev[i]) { same = false; break; }
      if (same) { t.version = v; t.source.version = sv; return; }
      prev.set(m);
    } else { this._sent = new Float32Array(m); this._sentTex = t; }
  };
}
THREE.SkinnedMesh.prototype.computeBoundingSphere = function () {
  const g = this.geometry;
  if (!g.boundingSphere) g.computeBoundingSphere();
  (this.boundingSphere ||= new THREE.Sphere()).copy(g.boundingSphere);
  this.boundingSphere.radius = Math.max(this.boundingSphere.radius * 2, 2);
};
let graphicsLost = false;
const canvas = document.getElementById('c');
canvas.addEventListener('webglcontextlost', e => {
  e.preventDefault(); graphicsLost = true;
  try { localStorage.setItem('bs.lite', '1'); } catch {}
  const title = document.getElementById('title');
  title.classList.remove('hidden'); title.classList.remove('city-ready');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('startBtn').disabled = true;
  document.getElementById('startBtn').textContent = 'Brisbane could not load.';
  document.getElementById('launch-device').textContent = 'Your browser reset the graphics. Reload to restart with the lighter settings.';
  document.getElementById('launch-retry').classList.remove('hidden');
});
// (a browser that refuses the WebGL 2 context - blocklisted GPU, too many contexts, a driver fault - throws here: the boot
//  supervisor in index.html says so with Reload, instead of a loading screen that never ends)
const renderer = startRenderer(THREE, canvas, (TOUCH || LITE) ? 'default' : 'high-performance', window.__boot);
setKTX2Renderer(renderer);   // (KTX2 textures transcode to what this GPU reads compressed: src/ktx2.js)
setGpuReadback(renderer);    // (iPhones: model vertices kept on the GPU only, read back when a dent needs them: src/phonemem.js)
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight, false);   // (CSS sizes the canvas; src/graphics.js sets the real resolution below)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;   // (r186 dropped PCFSoftShadowMap and warns; PCF is what it fell back to)
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
// The opaque pass in three.js's order (render order, then material), except that people (skinned meshes) come after the
// rest grouped by shader program. Every person has their own body material, and the photo-skinned crowd's hair has a
// program of its own (alpha-tested), so in material order the crowd switched programs body / hair / kit at almost every
// draw (~40 more switches a frame: ~0.5 ms of CPU and GPU). Opaque, depth-tested draws: the picture is the same; nothing
// else changes order (coplanar surfaces of the world keep their material order).
// (the program id is kept on the render item - three.js reuses them frame to frame - and looked up again when the frame
//  or the item's material changes: a material's program can change)
function progKey(it) {
  const f = renderer.info.render.frame;
  if (it.pkFrame !== f || it.pkMat !== it.material) { it.pkFrame = f; it.pkMat = it.material; it.pk = renderer.properties.get(it.material).currentProgram?.id ?? 0; }
  return it.pk;
}
function opaqueSort(a, b) {
  if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
  if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
  const sa = a.materialVariant & 1, sb = b.materialVariant & 1;     // (three.js: bit 1 = a skinned mesh)
  if (sa !== sb) return sa - sb;
  if (sa) { const pa = progKey(a), pb = progKey(b); if (pa !== pb) return pa - pb; }
  if (a.material.id !== b.material.id) return a.material.id - b.material.id;
  if (a.materialVariant !== b.materialVariant) return a.materialVariant - b.materialVariant;
  if (a.z !== b.z) return a.z - b.z;
  return a.id - b.id;
}
renderer.setOpaqueSort(opaqueSort);
// The sun's shadow pass draws every caster with ONE shared depth material, so its shader program flipped between the
// plain, instanced (street furniture, the street-life Limes and e-bikes, debris) and skinned (people) variants many
// times a frame, each flip a full program re-resolve in three.js. Instanced and skinned casters now default to a depth
// material of their own kind (same depth shader, so the same shadow); alpha-tested ones (the MakeHuman hair) keep
// three.js's per-material copies, which carry the cut-outs. (Object3D's constructor assigns customDepthMaterial, so
// the setter below takes an explicit one as before.)
{
  const DEPTH = {};
  const depthFor = o => {
    const m = o.material;
    if (!m || Array.isArray(m) || ((m.map || m.alphaMap) && m.alphaTest > 0) || m.alphaToCoverage || m.displacementMap || m.clippingPlanes?.length) return undefined;
    const k = (o.isInstancedMesh ? (o.instanceColor ? 'ic' : 'i') + (o.morphTexture ? 'm' : '') : '') + (o.isSkinnedMesh ? 's' : '');
    return k ? (DEPTH[k] ||= new THREE.MeshDepthMaterial()) : undefined;
  };
  for (const C of [THREE.InstancedMesh, THREE.SkinnedMesh]) {
    Object.defineProperty(C.prototype, 'customDepthMaterial', {
      get() { return this._customDepth !== undefined ? this._customDepth : depthFor(this); },
      set(v) { this._customDepth = v; },
      configurable: true,
    });
  }
}
const scene = new THREE.Scene();
// Phones see ~800 m (the haze closes in from 250 m) instead of 3.4 km: what lies wholly beyond the fog is not drawn at
// all (farCull below) - from King George Square ~200 of ~680 draw calls were city chunks and ground more than 800 m
// off, behind the buildings or faint in the haze (tools/perf/results/phone-baseline-2026-10-08.md). ?viewfar=<m> tries
// another distance (0: the desktop's).
const VIEW_FAR = (() => { const q = /[?&]viewfar=(\d+)/.exec(location.search); return q ? +q[1] || null : (TOUCH || LITE) ? 1400 : null; })();   // (phones: 1400 m since 2026-10-08 - the far city is one cheap baked ring)
// The simulation LOD for the walkers and the traffic (src/simlod.js): far-off ones run their steps batched. Phones (the
// crowd's AI and movement were half the simulation time on an emulated phone); ?simlod=1 / 0 forces it either way.
// (desktops too since the desktop parity pass, 2026-10-10: tools/perf/results/desktop-2026-10-10.md - a desktop keeps the
//  desktop car profile, SIMLOD.car: anything you can see within 200 m runs every step)
const SIM_LOD = (() => { const q = /[?&]simlod=([01])\b/.exec(location.search); return q ? q[1] === '1' : true; })();
// The three-level crowd (src/crowd): people within ~40 m on their own rigs, everyone further off drawn by the GPU crowd
// (one draw for all of them), so phones get the preset's full crowd back. Phones; ?crowd=1 / 0 forces it either way
// (off: exactly the old way, the phones' ~60% / 40% crowd included). On only when the bake fits the rig (crowdAssetFor).
// (desktops too since 2026-10-10, with a wider rig ring - DESKTOP_CROWD below)
const CROWD_WANT = (() => { const q = /[?&]crowd=([01])\b/.exec(location.search); return q ? q[1] === '1' : true; })();
// A desktop's crowd: people keep their own rigs out to ~55 m (the phones' ~40 m: a desktop screen is bigger and sharper,
// so the swap to the GPU crowd stays further off) - tools/perf/results/desktop-2026-10-10.md
const DESKTOP_CROWD = Object.freeze({ nearIn: 50, nearOut: 60 });
scene.fog = VIEW_FAR ? new THREE.Fog(0xc9dcea, Math.round(VIEW_FAR * 0.31), VIEW_FAR) : new THREE.Fog(0xc9dcea, 600, 3400);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 5000);
// Distant cars drawn instanced, one draw per model, buses swapped to a far version (src/farcars.js): phones; ?farcars=1 / 0
// forces it either way.
// (desktops too since 2026-10-10)
const farCars = (() => { const q = /[?&]farcars=([01])\b/.exec(location.search); return (q ? q[1] === '1' : true) ? createFarCars({ scene, camera }) : null; })();
// post: MSAA HDR target -> bloom (night lights) -> ACES tone map + sRGB
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: (TOUCH || LITE) ? 0 : 4 }));
composer.addPass(new RenderPass(scene, camera));
// ground-truth ambient occlusion: contact shadows where walls meet footpaths, under awnings, around kerbs
const gtao = new GTAOPass(scene, camera, 1, 1);
gtao.updateGtaoMaterial({ radius: 1.6, distanceExponent: 1.6, thickness: 2, scale: 1.2, samples: 8, screenSpaceRadius: false });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 8 });
gtao.blendIntensity = 0.85;
{ // AO at half resolution: most of the look for a fraction of the cost
  const full = gtao.setSize.bind(gtao);
  gtao.setSize = (w, h) => full(Math.ceil(w / 2), Math.ceil(h / 2));
  gtao.setSize(1, 1);
}
gtao.enabled = false; // K toggles (costs ~2x frame time)
composer.addPass(gtao);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.4, 0.92);
{ // night glow at half resolution (its blur chain starts at a quarter of the screen): same look, ~half the cost
  const full = bloom.setSize.bind(bloom);
  bloom.setSize = (w, h) => full(Math.ceil(w / 2), Math.ceil(h / 2));
  bloom.setSize(1, 1);
}
bloom.enabled = false;
// (a pixel that isn't a finite number - a few the scene's half-float render makes at night, e.g. a highlight past the
//  format's 65504 - went into the glow's blur chain and spread to its smallest level, so the whole frame came out black:
//  ~1 frame in 6 when turning on the spot at night with night glow on (Medium / High), 0 with it off; a recorded clip
//  repeated a black frame for seconds, 2026-10-17. Such a pixel counts as black in the glow, and on screen.)
const FINITE_TEXEL = 'vec4 texel = texture2D( tDiffuse, vUv ); if ( ! all( lessThan( abs( texel ), vec4( 65000.0 ) ) ) ) texel = vec4( 0.0 );';
bloom.materialHighPassFilter.fragmentShader = bloom.materialHighPassFilter.fragmentShader.replace('vec4 texel = texture2D( tDiffuse, vUv );', FINITE_TEXEL);
composer.addPass(bloom);
const outputPass = new OutputPass();
outputPass.material.fragmentShader = outputPass.material.fragmentShader.replace('gl_FragColor = texture2D( tDiffuse, vUv );', 'gl_FragColor = texture2D( tDiffuse, vUv ); if ( ! all( lessThan( abs( gl_FragColor ), vec4( 65000.0 ) ) ) ) gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );');
composer.addPass(outputPass);
// Straight to the (MSAA) canvas when no post effect is on, i.e. all day: the renderer tone-maps and sRGB-encodes the
// same way OutputPass does, and it skips the half-float MSAA target, its resolve and the extra full-screen pass.
// (the sun's shadow map: on Low / Medium re-rendered every 2nd frame, but every frame while you drive or ride fast)
// (sprinting on foot too: with the shadow re-rendered every 2nd frame, your own shadow trailed you a frame at a time)
const movingFast = () => Math.abs(player.driving?.v || 0) > 4 || (player.riding?.v || 0) > 4 || (!player.driving && !player.riding && player.speed > 4);
// first-person view state (POV: see povApply by the camera below)
const POV_EYE = 1.62, POV_PITCH_MIN = -1.1;   // (eye height over the feet; look up to ~63 degrees in first person)
const pov = {
  on: (() => { try { return localStorage.getItem('bs.pov') === '1'; } catch { return false; } })(),   // (the player's choice)
  active: false,     // applied this frame (on, and nothing has the camera)
  hide: false,       // your own body out of the draw
  savedPitch: 0.12,  // the follow camera's pitch when POV took over: given back when it lets go
};
let povHid = null;   // (the body renderNow has out of this draw: the sun's shadow pass puts it back for itself - below)
let frameStatsPaused;
function render() { if (memoryLab?.mode === 'present') return; if (frameStatsPaused !== paused) { window.__frameStats?.reset(); frameStatsPaused = paused; } window.__frameStats?.mark(); sunShadow.beforeRender(movingFast()); poseToGpu(pHuman); Perf.render(renderNow); }
// The player's bones reach the GPU every rendered frame. three.js updates a skeleton once per info.render.frame, but
// bumps that counter between the main pass and the shadow pass: on a frame the sun's shadow is re-rendered the shadow
// pass takes the update, and the NEXT frame's main pass skips it as already done. With the shadow every 2nd frame
// (Performance / Balanced, walking - running forces it every frame) every skinned body was drawn at half its pose
// rate: the player's walk stepped (2026-10-24, tools/test_player_anim.mjs). Posed here, before the render, the player
// is always current (one rig; the crowd keeps that saving). The bone-skip wrapper above re-sends only real changes.
const _skels = [];
const _addSkel = o => { if (o.isSkinnedMesh && o.skeleton && !_skels.includes(o.skeleton)) _skels.push(o.skeleton); };
function poseToGpu(h) {
  if (!h?.root?.visible || h.disposed) return;
  h.root.updateMatrixWorld();
  _skels.length = 0; h.root.traverse(_addSkel);
  for (const s of _skels) s.update();
}       // (Perf: draw calls / CPU submit / GPU time when it's recording)
function renderNow() {
  // (first person, POV below: your own body is left out of this frame's draw only - root.visible stays the game's, which
  //  crime.js / respawn / the bodies read. The sun's shadow pass shows it again for itself (the shadow wrapper, by
  //  cullPeople): you see your own shadow, as in most first-person games. Out too while a map-fault view taken in first
  //  person is held - src/faults.js holdingPov: that camera is at your eyes, inside your head)
  const root = (pov.hide || faults?.api?.holdingPov) && pHuman?.root?.visible ? pHuman.root : null;
  if (root) { root.visible = false; povHid = root; }
  try {
    if (bloom.enabled || gtao.enabled) composer.render();
    else renderer.render(scene, camera);
  } finally { if (root) { root.visible = true; povHid = null; } }
}
// Hidden top-level objects (people / cars / scooters out of range or out of view) skip the per-frame matrix update of
// their whole subtree: ~250 hidden rigs x ~36 bones + meshes cost ~5 ms of updateMatrixWorld a frame. A root that is
// shown again is recomputed on that frame (matrixAutoUpdate -> updateMatrix() flags matrixWorldNeedsUpdate, which forces
// its children). Anything that reads a hidden object's world matrix goes through getWorldPosition / updateWorldMatrix,
// which update on demand.
// (The scene itself never moves: with matrixAutoUpdate on it would flag itself dirty every frame and force the whole
// graph, visible or not.)
scene.matrixAutoUpdate = false;
scene.updateMatrixWorld = function (force) {
  if (this.matrixWorldNeedsUpdate || force) { this.matrixWorld.copy(this.matrix); this.matrixWorldNeedsUpdate = false; }
  const ch = this.children;
  for (let i = 0, l = ch.length; i < l; i++) { const c = ch[i]; if (c.visible) c.updateMatrixWorld(force); }
};
// requestPointerLock() returns a promise in current Chrome; a refused lock (no user gesture, embedded view) must not
// surface as an uncaught error
function lockPointer() { if (TOUCH) return; try { const r = canvas.requestPointerLock?.(); if (r && r.catch) r.catch(() => {}); } catch { /* not allowed here */ } }
// (src/graphics.js owns the render size; the view, src/device.js: the window - or, on a phone held upright, the stage
//  turned a quarter turn, innerHeight x innerWidth - and every change of it, a resize or a turn)
view.onChange(() => { GFX?.resize(); menuViewDirty = true; });

// Southern hemisphere: the sun sits in the northern (-z) sky.
const sunDir = new THREE.Vector3(0.35, 0.82, -0.46).normalize();
const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x8a7a60, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 1, far: 900 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
const sunShadow = createSunShadow({ sun, dir: sunDir, distance: 300 });
// the graphics settings (src/graphics.js): resolution, shadows, effects and decoration distance from the saved preset
// a desktop's render-size budget: ~5 M pixels (a 2560x1440 screen at x1.35, a 1920x1080 one at x1.5): a 4K or hi-DPI
// laptop screen isn't drawn at 8+ M pixels by default (the adaptive resolution can only step down from the top)

const GFX_DEVICE = { touch: TOUCH, lite: LITE, inApp: IN_APP_BROWSER };   // (src/graphics.js: an in-app browser runs Low at most)
const GFX = createGraphics({ renderer, composer, camera, sun, gtao, bloom, decor: f => setDecorDetail(f), shadowEvery: k => sunShadow.setEvery(k),
  size: () => view.size(), devicePixelRatio: () => devicePixelRatio || 1,   // (the game's size: the window, or innerHeight x innerWidth on a phone held upright)
  memorySafe: LITE, maxPixels: (TOUCH || LITE) ? 900000 : desktopPixels,
  dprCap: (TOUCH || LITE) ? 1.5 : 2, phoneDpr: (TOUCH || LITE) ? 1.5 : 0, phoneMinDpr: (TOUCH || LITE) ? 1 : 0 });   // (phones: x1.5 on any preset, adaptive down to x1.0 under load; the 900k-pixel budget still applies.
// Desktop presets own their render scale and pixel budget; no phone sharpness floor on Low.
// (?preset=low|medium|high|ultra: that preset for this visit, never saved - measuring, tools/perf/desktop_bench.mjs)
GFX.apply(((g, q) => (q ? { ...g, preset: q[1] } : g))(loadGraphics(undefined, globalThis, GFX_DEVICE), /[?&]preset=(low|medium|high|ultra)\b/.exec(location.search)));   // (all devices: Low at 30 FPS by default - src/graphics.js deviceDefaults)
const populationPreset = GFX.settings.preset;
const PHONE_TEX = LITE ? { maxImage: 512, maxCanvas: 1024 } : {};   // (canvases 1024 since 2026-10-08: signs readable)   // (src/phonemem.js: iPhones get half-size photo textures)
const population = populationFor(populationPreset, TOUCH, LITE, location.search);   // (phones and tablets: ~60% of the preset's crowd; ?cars=<n> sets the traffic count)
// every person's body alive at once (people.js Human.live), whoever made it: a phone tab dies of resident rigs, not of
// the ones on screen (src/population.js; ?rigs=<n> sets the budget; __game.population.stats())
// iPhones: far eshay packs and seated locals put their bodies away (people.js Human.sleep) and build them again on the way
// back in, so the resident rigs are the ones near you, not every fixed pool (?sleeprigs=0/1 forces it either way)
const SLEEP_RIGS = /[?&]sleeprigs=([01])/.test(location.search) ? /[?&]sleeprigs=1/.test(location.search) : LITE;
// iPhones: a texture's CPU copy (KTX2 mip levels, a painted-once canvas) goes once it's on the GPU (src/phonemem.js
// freeUploadedTextures; ?freetex=0/1 forces it either way)
const FREE_TEX = !/[?&]freetex=0\b/.test(location.search);
// Every device can release canvases explicitly marked painted-once by their maker, after upload. Keep desktop
// compressed mips for future model/sampler variants; the existing lite path is unchanged.
const FREE_TEX_OPTIONS = { compressed: LITE || /[?&]freetex=1\b/.test(location.search) };
const rigs = createPopulation({ budget: rigBudget({ touch: TOUCH, lite: LITE, query: location.search }), live: () => Human.live,
  caches: () => ({ hair: ASSETS.hairStats(), busSigns: ASSETS.busSignStats?.() }) });   // (hair: one geometry per style and colour seen, bounded by the palettes)
// the adaptive resolution (src/adaptive.js): when it's switched on, inside the preset's range, one sample a frame
const adaptive = createAdaptiveResolution({ gfx: GFX, targetFps: () => GFX.value('targetFps'), enabled: () => GFX.value('adaptive') });
setMetroRenderer(renderer, scene, camera);
// (paused / hidden / graphics lost: nothing compiled; ?shaderwatch=0 off, for A/B)
const shaderWatch = createShaderWatch({ renderer, scene, camera,
  enabled: () => !/[?&]shaderwatch=0\b/.test(location.search) && !document.hidden && !graphicsLost && !swat?.warm?.inflight });   // (not alongside src/swat.js's warm-up builds)

const sky = new THREE.Mesh(new THREE.SphereGeometry(4500, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { sunDir: { value: sunDir }, night: { value: 0 }, dusk: { value: 0 } },
  vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }',
  fragmentShader: `uniform vec3 sunDir; uniform float night; uniform float dusk; varying vec3 vDir;
    void main(){ vec3 d = normalize(vDir); float h = max(d.y, 0.0);
      vec3 zen = vec3(0.19,0.47,0.86), hor = vec3(0.80,0.88,0.94);
      vec3 col = mix(hor, zen, pow(h, 0.5));
      vec3 ncol = mix(vec3(0.07,0.09,0.17), vec3(0.01,0.02,0.07), pow(h, 0.5));
      col = mix(col, ncol, night);
      float toward = max(0.0, dot(normalize(d.xz + 1e-4), normalize(sunDir.xz + 1e-4)));
      col = mix(col, vec3(1.0,0.52,0.28), dusk * pow(1.0 - h, 5.0) * (0.35 + 0.65 * toward));
      float s = max(dot(d, sunDir), 0.0);
      if (sunDir.y > -0.05) col += (vec3(1.0,0.9,0.7) * pow(s, 700.0) * 2.5 + vec3(1.0,0.8,0.6) * pow(s, 10.0) * 0.22) * (1.0 - night);
      if (d.y < 0.0) col = mix(hor * 0.93, vec3(0.04,0.05,0.09), night);
      gl_FragColor = vec4(pow(col, vec3(2.2)) * 1.15, 1.0); }`,
}));
sky.frustumCulled = false;
scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), sky.material));
const envGround = new THREE.Mesh(new THREE.CircleGeometry(100, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x5d5b52 }));
envGround.position.y = -4; envScene.add(envGround);
let hdri = null;            // photo sky (src/envmap.js), daytime
let envRT = null, lastEnvKey = -1;
function updateEnv(night, dusk) {
  const yaw = hdri ? sky.material.uniforms.hdriYaw.value : 0;
  const key = Math.round(night * 12) * 100 + Math.round(dusk * 6) + Math.round(sunDir.x * 4) * 10 + Math.round(yaw * 8) * 10000;
  if (key === lastEnvKey) return;
  lastEnvKey = key;
  envGround.material.color.setHex(night > 0.5 ? 0x07080c : 0x5d5b52);
  const rt = hdri ? captureSkyEnv(pmrem, envScene, sky.material) : pmrem.fromScene(envScene, 0.015, 0.1, 500);
  envRT?.dispose(); envRT = rt;
  scene.environment = rt.texture;
  scene.environmentIntensity = 1 - night * 0.7;
}
const stars = (() => {
  const n = 1800, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), e = Math.asin(rnd(0.05, 1)); pos.set([Math.cos(a) * Math.cos(e) * 4000, Math.sin(e) * 4000, Math.sin(a) * Math.cos(e) * 4000], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p); return p;
})();
const clouds = [];
{ // fair-weather cumulus (the photo sky has real ones by day; these show at dusk / night)
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  for (let k = 0; k < 14; k++) { const x = rnd(30, 98), y = rnd(50, 80), r = rnd(18, 34); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const tex = new THREE.CanvasTexture(c);
  for (let k = 0; k < 26; k++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, fog: false, depthWrite: false, opacity: 0.9, transparent: true }));
    const a = rnd(0, 6.28), r = rnd(900, 3400);
    s.position.set(Math.cos(a) * r, rnd(380, 700), Math.sin(a) * r);
    s.scale.set(rnd(260, 480), rnd(100, 170), 1);
    scene.add(s); clouds.push(s);
  }
}
{ // far ground under everything + Mt Coot-tha with its TV towers, ~6.5 km west of City Hall (hazy on the horizon)
  const g = new THREE.Mesh(new THREE.CircleGeometry(9000, 32), new THREE.MeshLambertMaterial({ color: 0x6f8a55 }));
  g.rotation.x = -Math.PI / 2; g.position.y = -8.5; scene.add(g);
  const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshLambertMaterial({ color: 0x4f6e42 }));
  hill.scale.set(1100, 260, 700); hill.position.set(-3700, -60, 420); scene.add(hill);
  for (let k = 0; k < 3; k++) {
    const tw = new THREE.Group();
    for (let s = 0; s < 6; s++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(2.5 - s * 0.3, 2.8 - s * 0.3, 18, 6), mat(s % 2 ? 0xffffff : 0xd8312a)); seg.position.y = s * 18 + 9; tw.add(seg); }
    tw.position.set(-3550 + k * 60, 180, 380 + k * 40); scene.add(tw);
  }
}

// ------------------------------------------------------------------ HUD refs
const $ = id => document.getElementById(id);
const hud = { heads: $('heads'), mic: $('mic'), objText: $('objText'), objDist: $('objDist'), place: $('place'), clock: $('clock'), hp: $('hp'), wallet: $('wallet'), cred: $('cred'), lime: $('lime'), kmh: $('kmh'), zone: $('zone'), fare: $('fare'), battery: $('battery'), prompt: $('prompt'), subtitle: $('subtitle'), toast: $('toast'), bubbles: $('bubbles'), vignette: $('vignette'), minimap: $('minimap') };
const mm = hud.minimap.getContext('2d');
let toastT = 0;
let hudTidy = null;     // phones / tablets: the HUD tidied into toasts, a speedometer, a one-line objective (src/hudtidy.js)
let clipMode = null, firstMinute = null;   // (src/clipmode.js: recording clips; src/firstminute.js: the welcome ride + share card)
function subtitle(text, secs = 3.2, speak = true, from = null, opts = null) {
  // anyone quoted in a subtitle says it out loud: the recorded ElevenLabs take when there is one (src/voices.js, and
  // the subtitle shows that take's wording), else speech synthesis. The car radio ducks while they talk (Voices.onPlay).
  // from = {x, z} of the speaker: out of earshot (> 28 m) nothing is shown or heard, closer it fades with distance.
  // Subtitles stack (src/speech.js: up to 3, each with its speaker's name): a speaker's new line replaces their own
  // previous one, other speakers' stay. opts = { key (the speaker; default their name), prio (speech.js PRIO) }.
  // -> the subtitle (hold(secs), end(secs)) or undefined when out of earshot
  if (from && Math.hypot(from.x - player.x, from.z - player.z) > 28) return;
  const m = text.match(/^([^:"]+):\s*"([^"]+)"/);
  let name = '', body = text;
  if (m) {
    const said = Voices.textFor(m[2]);
    if (said !== m[2]) { text = text.replace('"' + m[2] + '"', '"' + said + '"'); secs = Math.max(secs, Math.min(7, 1.2 + said.length * 0.055)); }
    if (speak) {
      const who = m[1].toLowerCase();
      // (the voice follows the speaker's body: opts.female, else the person the line comes from - from = an officer, a
      //  driver, a pedestrian with h.look - src/voices.js speakerBody; a voice of the other gender is swapped)
      const body = Voices.speakerBody(m[1], from, opts);
      sfx.say(m[2].replace(/ — .*$/, ''), { who: m[1].trim(), pitch: who.includes('qps') ? 0.8 : who.includes('zero') ? 1.15 : rnd(0.8, 1.1), rate: 1.05, ...(typeof body.female === 'boolean' ? { female: body.female } : {}), ...(body.age ? { age: body.age } : {}), ...(from ? { x: from.x, z: from.z } : {}) });
    }
    name = m[1].trim(); body = text.slice(text.indexOf(':') + 1).trim();
  }
  // over the speaker's head (drawCaptions) when we know who it is: opts.anchor, their Human (opts.speaker), or you
  const anchor = opts?.anchor || (opts?.speaker ? headAnchor(opts.speaker) : opts?.key === 'player' ? headAnchor(pHuman) : null);
  return Speech.show({ key: opts?.key ?? (name ? 'who:' + name.toLowerCase() : 'narration'), name, text: body, secs, prio: opts?.prio ?? PRIO.mission, anchor });
}
// a point just above someone's head, wherever their head is this frame (a rigged person's head bone, else their height)
const _heads = new WeakMap(), _hp = new THREE.Vector3();
function headAnchor(h) {
  if (!h) return null;
  return () => {
    if (h.root && h.root.parent === null && h !== pHuman) return null;          // (gone from the scene)
    let b = _heads.get(h);
    if (b === undefined) { b = h.glb?.root.getObjectByName('head') || null; _heads.set(h, b); }
    if (b) { b.getWorldPosition(_hp); return { x: _hp.x, y: _hp.y + 0.42, z: _hp.z }; }
    const r = h.root?.position;
    return r ? { x: r.x, y: r.y + 2.05, z: r.z } : null;
  };
}
// What people say: a caption over the speaker's head while they're on screen (the bubble follows them; nearer ones in
// front; fainter and smaller further off); the bottom of the screen for narration, radio, missions, and anyone off
// screen or behind you, so a line is never missed. Redrawn every frame (speakers move); the bottom stack only when it changes.
// Talking out loud (hold V / L, src/npcai.js): a soft cone on the ground in front of you is who can hear you, a ring
// under the one who will, a microphone tag over their head, and the pill saying the mic is on.
let micView = null;
function updateMic() {
  const mode = npcAI?.micMode || null, t = mode ? npcAI.voiceTarget() : null;
  if (!micView) {
    if (!mode) return;
    const g = new THREE.Group();
    const wedge = new THREE.Mesh(new THREE.CircleGeometry(MIC.range, 32, Math.PI / 2 - MIC.half, MIC.half * 2),
      new THREE.MeshBasicMaterial({ color: 0x48e08a, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true }));
    wedge.rotation.x = Math.PI / 2; g.add(wedge);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 36), new THREE.MeshBasicMaterial({ color: 0x48e08a, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true }));
    ring.rotation.x = -Math.PI / 2;
    g.renderOrder = ring.renderOrder = 5;
    const tag = document.createElement('div'); tag.className = 'tag'; tag.style.display = 'none'; hud.heads.append(tag);
    scene.add(g, ring);
    micView = { g, wedge, ring, tag };
  }
  const V = micView, on = !!mode;
  V.g.visible = on;
  if (on) {
    V.g.position.set(player.x, (player.y ?? LY.groundY(player.x, player.z)) + 0.05, player.z);
    V.g.rotation.y = player.heading;
    V.wedge.material.opacity = mode === 'ptt' ? 0.2 : 0.1;
  }
  V.ring.visible = on && !!t;
  V.tag.style.display = 'none';
  if (on && t) {
    V.ring.position.set(t.x, LY.groundY(t.x, t.z) + 0.05, t.z);
    const p = headAnchor(t.h)?.();
    if (p) {
      _cv.set(p.x, p.y + 0.05, p.z).project(camera);
      if (_cv.z < 1 && Math.abs(_cv.x) < 1 && Math.abs(_cv.y) < 1) {
        V.tag.textContent = t.name ? '🎤 ' + t.name : '🎤';
        V.tag.style.display = 'block';
        V.tag.style.transform = `translate(${((_cv.x + 1) / 2 * view.w).toFixed(1)}px, ${((1 - _cv.y) / 2 * view.h).toFixed(1)}px) translate(-50%, -100%)`;
      }
    }
  }
  hud.mic.classList.toggle('hidden', !on);
  if (on) {
    hud.mic.classList.toggle('idle', mode === 'open' && !t);
    hud.mic.querySelector('.txt').textContent = mode === 'ptt'
      ? (t ? `Talking to ${t.name || 'the person in front of you'}… let go of V to say it` : 'Listening… face someone (within 9 m)')
      : (t ? `Open mic: talking to ${t.name || 'the person in front of you'} · L to turn off` : 'Open mic: face someone to talk · L to turn off');
  }
}
const CAP_FAR = 40;                             // m: past this a caption goes to the bottom
let subSig = '';
const capEls = new Map();                       // sub id -> its bubble
const _cv = new THREE.Vector3(), _cr = [];
// The DOM is touched only when a value changes (performance stage five): a style or text written every frame costs a
// style recalculation even when it's the same, and reading a size right after writing one forces a layout.
const setStyle = (el, k, v) => { const c = el.__css ||= {}; if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
const setText = (el, v) => { if (el.__txt !== v) { el.__txt = v; el.textContent = v; } };
function drawCaptions() {
  const W0 = view.w, H0 = view.h, bottom = [], seen = new Set();   // (the game's own size: src/device.js)
  _cr.length = 0;
  for (const s of Speech.subs) {
    const p = s.anchor?.();
    if (!p) { bottom.push(s); continue; }
    const d = Math.hypot(p.x - camera.position.x, p.z - camera.position.z);
    if (pov.hide && d < 1) { bottom.push(s); continue; }   // (first person: your own line is anchored right over the eye - a huge bubble on the view looking up; to the bottom with it)
    _cv.set(p.x, p.y, p.z).project(camera);
    if (_cv.z >= 1 || d > CAP_FAR || Math.abs(_cv.x) > 0.96 || _cv.y > 0.96 || _cv.y < -0.9) { bottom.push(s); continue; }
    _cr.push({ s, x: (_cv.x + 1) / 2 * W0, y: (1 - _cv.y) / 2 * H0, d });
  }
  // bubbles: nearest drawn last (on top); one that would sit on a nearer one moves up above it
  _cr.sort((a, b) => b.d - a.d);
  const placed = [];
  for (let i = _cr.length - 1; i >= 0; i--) {
    const c = _cr[i];
    let el = capEls.get(c.s.id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'cap' + (c.s.key === 'player' ? ' you' : '');
      if (c.s.name) { const w = document.createElement('span'); w.className = 'who'; w.textContent = c.s.name; el.append(w); }
      el.append(document.createTextNode(c.s.text));
      hud.heads.append(el); capEls.set(c.s.id, el);
      el.style.transformOrigin = '50% 100%';
      el.__w = el.offsetWidth || 160; el.__h = el.offsetHeight || 40;   // (measured once: the text never changes, scale is a transform)
    }
    seen.add(c.s.id);
    const sc = Math.max(0.72, Math.min(1, 1.15 - c.d / 45)), h = el.__h * sc, w = el.__w * sc;
    let y = c.y;
    for (const q of placed) if (Math.abs(q.x - c.x) < (q.w + w) / 2 && y > q.y - q.h && y - h < q.y) y = q.y - q.h - 6;
    placed.push({ x: c.x, y, w, h });
    setStyle(el, 'transform', `translate(${c.x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%) scale(${sc.toFixed(3)})`);
    setStyle(el, 'opacity', c.d > 26 ? Math.max(0.45, 1 - (c.d - 26) / 30).toFixed(2) : '1');
    setStyle(el, 'zIndex', String(1000 - Math.round(c.d * 10)));
  }
  for (const [id, el] of capEls) if (!seen.has(id)) { el.remove(); capEls.delete(id); }
  // the bottom stack: oldest at the top, each line with its speaker's name
  const sig = Speech.version + '|' + bottom.map(s => s.id).join(',');
  if (sig === subSig) return;
  subSig = sig;
  const box = hud.subtitle;
  box.textContent = '';
  for (const s of bottom) {
    const row = document.createElement('div');
    if (s.name) { const who = document.createElement('span'); who.textContent = s.name + ': '; who.style.opacity = '0.72'; row.append(who); }
    row.append(s.text);
    box.append(row);
  }
}
function toast(text, secs = 2.5) {
  hud.toast.textContent = text; setStyle(hud.toast, 'opacity', '1'); toastT = secs;   // (setStyle: updateHUD fades it)
  if (hudTidy && text && secs < 60) hudTidy.notify(text, { secs, key: 'toast:' + text });   // (a phone: the toast queue; not the PAUSED one, the menu says so)
}

// ------------------------------------------------------------------ world
let W = null, RN = null;     // OpenStreetMap world (src/osm/data.js) and its lane graph (src/osm/roadnet.js)
let world, traffic, peds, ibises, locals, missions = null;
let crowd = null;                                    // the three-level crowd (src/crowd), when CROWD_WANT and the bake fits
let overheard = null, moments = null;      // the street's small talk and small moments (src/overheard.js, src/moments.js)
let wildlife = null;                       // birds, swooping magpies, lunch thieves, possums (src/wildlife/*)
const sfx = new Sfx();
const scooters = [];
const crackheads = [];
const SPAWN = { x: 38, z: -31, heading: -2.28 };   // replaced from W.cityhall in build(): King George Square, facing City Hall
// (no stamina: you can sprint for as long as you like. stepY / stepV: the body and camera easing over a kerb, see updatePlayer;
//  deckRoad: the elevated deck you're walking on, out of a car up on the motorway or an overpass, else null; vault: a
//  hop over a railing or barrier in progress)
const player = { x: SPAWN.x, z: SPAWN.z, y: 0.15, vy: 0, vx: 0, vz: 0, heading: 0, hp: 100, money: 40, riding: null, down: 0, dodgeT: 0, dodgeCd: 0, punchCd: 0, speed: 0, hurtT: 99, kx: 0, kz: 0, cred: 0, rideT: 0, fare: 0, grounded: true, footT: 0, stepY: 0, stepV: 0, deckRoad: null, vault: null, upT: 0 };
const PLAYER_LOOK = playerLook();   // the start outfit (src/clothes.js START_OUTFIT: the Lions-colours tee, f0020; C changes it)
// Player gait thresholds: normal movement is a 1.65 m/s walk; Shift is a 7.4 m/s sprint.
let pHuman = new Human(PLAYER_LOOK, 1.0);
pHuman.gaitRun = PLAYER_GAIT;
scene.add(pHuman.root);
// The save (src/saveflow.js + src/savegame.js, docs/SAVEGAME.md): made now so the title screen can say Continue; what it
// captures and restores comes through this adapter (plain callbacks: the world stays out of the save module). The
// missions and the Metro unlock keep their own code and get a storage shim each, so the save is the one record.
const saveFlow = createSaveFlow({
  known: { missionIds: MISSIONS.map(d => d.id), outfitIds: OUTFIT_IDS },
  game: {
    player,
    isStarted: () => started, isPaused: () => paused, isOnline: () => !!online?.active,
    // a spot worth coming back to: on foot, on the ground, dry, not on a deck or a boat, not mid-step or knocked down
    walkingSafely: () => !!W && started && !player.driving && !player.riding && !(player.down > 0) && player.hp > 0 && player.grounded && !player.deckRoad && !player.vault
      && !water?.active && !ferry?.aboard && !limeRide.busy && W.walkable(player.x, player.z) && !LY.isWater(player.x, player.z),
    placeName: (x, z) => (W ? W.placeName(x, z) : ''),
    positionEnv: () => ({
      walkable: (x, z) => W.walkable(x, z), water: (x, z) => LY.isWater(x, z),
      blocked: (x, z) => !!world?.col?.pointBlocked?.(x, LY.groundY(x, z) + 1.0, z),
      anchorExists: (id, x, z) => !id || W.placeName(x, z) === id,   // (the world still calls that spot by the saved name)
      snap: (x, z) => W.snapWalkable(x, z, 30, {}, false, true),
      fallback: SPAWN, maxNearby: 40,
    }),
    placePlayer: ({ x, z, heading }) => {   // (never the saved height: the ground as it is now)
      Object.assign(player, { x, z, y: LY.groundY(x, z) + 0.02, vx: 0, vz: 0, vy: 0, heading, stepY: 0, stepV: 0, deckRoad: null, vault: null, upT: 0, grounded: true });
      cam.yaw = heading; cam.pitch = 0.12; cam.x = x - Math.sin(heading) * 5; cam.z = z - Math.cos(heading) * 5; cam.y = player.y + 2;
      world?.focus?.(x, z, true);
    },
    outfitId: () => currentOutfit().id, setOutfit: id => applyOutfit(pHuman, id),
    missions: () => missions, wanted: () => crime?.S?.wanted || 0,
    returnToCityHall: () => { missions?.abandon?.(); for (const k in keys) keys[k] = false; combat?.release?.(); combat?.block?.(false); respawn('Back at City Hall, out the front doors in King George Square.'); },
    restartMission: () => !!missions?.sys?.restart?.(),
    toast, unpause: () => { paused = false; toast('', 0); lockPointer(); },
  },
});
outfitHooks.changed = () => saveFlow.markDirty('outfit');
// riding a Lime (src/limeride.js): articulated scooter, drive model, rider IK, step on / off
const limeRide = new LimeRide({ groundY: (x, z) => LY.groundY(x, z), surfaceAt: (x, z) => LY.surfaceAt(x, z), walkable: (x, z) => LY.walkable(x, z) });
limeRide.onParked = sc => placeScooter(sc);
limeRide.onJolt = k => { cam.shake = Math.min(1, cam.shake + k); };   // kerbs
// wheelies (src/wheelie.js): the balance, the timer and your best (the save's progress prefs), sounds, what's said.
// A loop-out knocks you off at the top of the next ride step (wheelieFall: not in the middle of placing the bike)
let wheelieFall = null;
const wheelie = createWheelie({
  sfx, subtitle, toast, groundY: (x, z) => LY.groundY(x, z), hud: document.getElementById('wheelie'),
  getBest: k => missions?.sys?.progress?.pref?.(k), setBest: (k, v) => missions?.sys?.progress?.pref?.(k, v),
  female: () => !!pHuman?.look?.female, you: () => ({ x: player.x, y: player.y + 1.6, z: player.z }),
  bystanders: () => [peds?.list, locals?.list],
  shake: k => { cam.shake = Math.min(1, cam.shake + k); },
  loopOut: kind => { wheelieFall = kind; },
});
const wheelieIn = { held: false, v: 0, fwd: 0, str: 0, foot: false };
// stop a step-off half way (knocked down, respawned, teleported, carjacking...): park the scooter where it is
function abortLimeStep() {
  if (!limeRide.stepping) return;
  const sc = limeRide.sc;
  limeRide.detach(pHuman);
  if (sc) { sc.v = 0; sc.lean = 0; placeScooter(sc); }
}

const cam = { yaw: 0, pitch: 0.28, dist: 3.7, x: 0, y: 0, z: 0, shake: 0, pitchMin: -0.35 };   // (dist: closer by default since 2026-10-08; wheel / pinch 2.5-12; pitchMin: how far up you can look - further in first person, below)
const CAM_RATE = 14;                                  // the follow camera's damping rate (1/s): ~0.16 s to close 90%
const keys = {};
let started = false, paused = false, time = 0, gameMinutes = 10 * 60 + 30;

// The load in steps (2026-10-18). iPhones (LITE): each step is its own task - the browser gets the main thread back between
// them (WebKit's memory-pressure handling and its collector run there, never inside one long task), the crash crumb
// says which step a tab died in ("Filling the streets with traffic · CityCats"), and after the big ones a breather
// (ms) lets the collector take the step's leftovers before the next allocates: in Safari's engine the page grew
// ~0.5 GB of garbage across the build that was let go only seconds later (tools: window.__loadMark, a dev probe).
// Elsewhere: nothing changes (no yield).
function loadStep(next, breather = 0) {
  window.__loadMark?.(next || '');
  if (!LITE) return;
  if (next) { const st = (startBtn.textContent || '').replace(/…$/, ''); if (!/^play|could not load/i.test(st)) crumb(`${st} · ${next}`); }
  return new Promise(r => { let t = 0; const tick = () => { t += 100; if (t >= breather) r(); else setTimeout(tick, 100); }; setTimeout(breather > 0 ? tick : r, breather > 0 ? 100 : 0); });
}
async function build(progress) {
  pHuman.dispose(); pHuman = new Human(PLAYER_LOOK, 1.0); pHuman.gaitRun = PLAYER_GAIT; pHuman.fingersFirst = true; scene.add(pHuman.root); // rebuild with the loaded rig
  world = await buildOSMCity(scene, renderer, W, { progress });
  await loadStep(null, 1000);   // (iPhones: the city build's leftovers collected before the traffic is made)
  RN = world.RN;
  LY.setWorld(W, RN);
  sight.configure({ occluded: RN.occluded, groundY: (x, z) => W.groundY(x, z) });   // (src/sight.js: fed the camera every frame)
  lanesOutOfSight(RN, W);                    // (lane spawns - traffic, QPS, SERT, riders - out of the camera's sight)
  Object.assign(SPAWN, world.spawn);
  Object.assign(player, { x: SPAWN.x, z: SPAWN.z, y: W.groundY(SPAWN.x, SPAWN.z), heading: SPAWN.heading });
  progress('Filling the streets with traffic…');
  await new Promise(r => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
  // each traffic bus's route (src/bus-routes.js: number, destination, via, fleet number) goes to its destination display
  // and fleet numbers (src/bus-signs.js setBusDisplay, re-exported by src/assets.js, which also registers it) through
  // busDisplay.hook; the route is on mesh.userData.busRoute too (the hijack HUD and the police radio read it there)
  if (!busDisplay.hook && typeof ASSETS.setBusDisplay === 'function') busDisplay.hook = ASSETS.setBusDisplay;
  traffic = new Traffic(scene, W, RN, makeVehicleMesh, { onlineActive: () => !!(online && online.active), setBusDoors, animateWheels: animateVehicleWheels, disposeMesh: disposeVehicle, center: { x: SPAWN.x, z: SPAWN.z }, count: population.vehicles, buses: population.buses, taxis: population.taxis, police: population.police, flows: 26, ferries: 0, seed: 20260928, hideDist: 250, simLod: SIM_LOD,
    // (phones: a car you can see 75-200 m off - drawn instanced there, src/farcars.js - is batched too and coasts between
    //  its steps: src/simlod.js SIMLOD.carPhone; ?carlod=0 keeps the old rule)
    simLodCar: SIM_LOD && !/[?&]carlod=0\b/.test(location.search) ? SIMLOD.carPhone : null });   // (ferries: src/ferry/*, below)
  await loadStep('parked cars');
  for (const c of traffic.cars) trimVehicleShadows(c.mesh);
  for (const f of traffic.flows) trimVehicleShadows(f.mesh);
  // parked cars in decor's kerbside bays (street check 2026-10-02: the kerbs were empty), solid at their real footprint
  traffic.park(world.spawns.parking);
  // every vehicle's lamps (src/vehicle-lights.js): head / tail / brake lights, indicators, reversing lamps, light bars,
  // the beams on the road at night - from each vehicle's light state (src/vehicle-light-state.js)
  await loadStep('vehicle lights');
  vlights = createVehicleLights({ scene, camera, player, surfaceAt: (x, z) => LY.surfaceAt(x, z) });   // (surfaceAt: a beam stops at a building)
  if (window.__game) window.__game.vlights = vlights;     // debug: __game.vlights.stats / .debugFlares()
  for (const p of traffic.visual) if (p.mesh) trimVehicleShadows(p.mesh);
  // (p.box: hit hard, a parked car is knocked loose - src/vehicle-physics.js preDrive - and its collider goes)
  for (const p of traffic.visual) p.box = addVehicleCollider(world.col, { x: p.x, z: p.z, heading: p.ry, len: p.len, wid: p.wid, outline: p.mesh?.userData?.outline });   // (its fitted outline: src/vehicle-contact.js)
  await loadStep('the crowd');
  // the three-level crowd (src/crowd): made before the walkers so they start in it (no rig each until they're near)
  if (CROWD_WANT) {
    const asset = await crowdAssetFor(A.human);
    // (?crowdnear=<m>: the rig ring's radius - 0 draws everyone with the crowd: looking at it close up, tests)
    const qn = /[?&]crowdnear=(\d+)/.exec(location.search), o = qn ? { ...CROWDLOD, nearIn: +qn[1], nearOut: +qn[1] + 8 } : (TOUCH || LITE || populationPreset === 'low') ? CROWDLOD : { ...CROWDLOD, ...DESKTOP_CROWD };
    // (spare: rigs kept ready for people coming near - re-dressing one is ~free, building one is garbage; the rig budget
    //  takes spares back first when it's short)
    if (asset) crowd = createCrowd({ scene, asset, o, spare: LITE ? 8 : 12, allowRig: () => rigs.allow('crowd', PRIO_RIG.near) });
    else console.warn('crowd: no bake that fits the rig (assets/crowd) - everyone on rigs');
  }
  await loadStep('walkers');
  const people = crowd ? crowdPopulationFor(populationPreset, TOUCH, LITE, location.search) : population;   // (walkers / seated)
  // people live within ~150 m of the player (relocated out of sight as you move), so the streets around you stay busy
  peds = new Pedestrians(scene, W, RN, people.pedestrians, { center: { x: SPAWN.x, z: SPAWN.z }, traffic, simLod: SIM_LOD, hideDist: 125, recycleDist: 150, spawnMin: 30, spawnMax: 135, visMin: 80, initRadius: 140, gameHour: () => (gameMinutes / 60) % 24,
    crowd: !!crowd,                                          // (start in the GPU crowd: src/crowd)
    col: world.col,                                          // stepping aside for someone never steps into a wall
    playerCar: () => player.driving });                      // crossing gaps count the player's car too (src/npc/crossing.js)
  await loadStep('seated people');
  splashFx = createSplash(scene);                            // someone going into the river (src/splash.js)
  Ragdolls.init({ W, world, sfx, peds, shake: v => { cam.shake = Math.min(1, cam.shake + v); },   // vehicle-vs-person (src/ragdoll.js)
    splash: (x, y, z, s) => splashFx.add(x, y, z, s) });
  taxis = createTaxis({ traffic: () => traffic, peds: () => peds, player, W, THREE });   // hailing a cab, getting out of one (src/taxis.js)
  // (with the crowd: sitters start in it and need no sleeping - a far one has no rig anyway - and show out to 170 m)
  locals = addLocals(scene, world.spawns, world.buskers, { max: people.seated, hour: (gameMinutes / 60) % 24, sleep: SLEEP_RIGS && !crowd, crowd: !!crowd, show: crowd ? 170 : 140, simLod: SIM_LOD });
  await loadStep('eshays');
  if (crowd) {
    crowd.source('peds', () => peds?.list, { important: (p, d) => pedImportant(p, d) });
    crowd.source('locals', () => locals?.list, { important: o => !!o.ctrl || o.pose !== 'sit' });
    if (window.__game) window.__game.crowd = crowd;         // debug: __game.crowd.stats()
  }
  // Phase 6A markets (src/osm/markets.js): stallholders, the crowd drawn to an open market, its stalls' colliders
  world.phase6a?.attach({ scene, col: world.col, peds, Human, crowdLook: randomLook, crowdCtx, gameMinutes: () => gameMinutes, population: rigs });
  // bin chickens: at real bins and benches near the crowd spots, the Mall and King George Square
  const ibisSpots = [];
  const bins = W.pointsOf('bin').filter(b => W.inPlay(b.x, b.z) && W.walkable(b.x, b.z) && !W.isRoad(b.x, b.z));
  const near = (list, x, z, r) => list.filter(b => Math.hypot(b.x - x, b.z - z) < r).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
  const addIbis = (x, z) => { const s = W.snapWalkable(x, z, 6, {}); if (s && !ibisSpots.some(o => Math.hypot(o.x - s.x, o.z - s.z) < 1.5)) ibisSpots.push({ x: s.x, z: s.z }); };
  for (const s of world.spawns.loiter) {
    const nb = near(bins, s.x, s.z, 45);
    if (nb.length) for (const b of nb.slice(0, 2)) addIbis(b.x + rnd(-1.2, 1.2), b.z + rnd(-1.2, 1.2));
    else addIbis(s.x + rnd(-6, 6), s.z + rnd(-6, 6));
  }
  for (const b of bins.filter(b => W.inMall(b.x, b.z)).slice(0, 4)) addIbis(b.x + 0.8, b.z + 0.8);
  for (const b of near(bins, SPAWN.x, SPAWN.z, 70).slice(0, 2)) addIbis(b.x - 0.9, b.z + 0.6);
  ibises = WILDLIFE_ON ? null : new Ibises(scene, ibisSpots.slice(0, 40));   // (with wildlife on, src/wildlife/* draws them)
  // Lime scooters where decor parked them (KGS by the spawn, the Mall ends, stations, South Bank, bike racks, corners;
  // never in the Mall), ~18% tipped over (decor decides, so the ones in view at the spawn always stand)
  for (const s of world.spawns.scooters) {
    if (W.inMall(s.x, s.z) || !W.walkable(s.x, s.z) || W.isRoad(s.x, s.z)) continue;
    const root = makeScooter();
    const sc = { root, x: s.x, z: s.z, ry: s.ry, fallen: s.fallen ?? Math.random() < 0.18, battery: Math.floor(rnd(35, 100)), lean: 0, v: 0 };
    scooterParts(sc);
    scooters.push(sc); scene.add(root); placeScooter(sc);
  }
  // crackheads loitering at the usual spots (King George Square, the Mall, Anzac Square, Roma St, Central, South Bank...)
  const homes = [...world.spawns.loiter].sort(() => Math.random() - 0.5).slice(0, 11);
  for (const h of homes) crackheads.push(new Crackhead(h.x, h.z));
  // eshay packs: 3-6 lads in polos / trackies and TNs round the CBD, South Bank and the Valley edge (src/eshays.js)
  try {
    eshays = createEshays({ scene, camera, cam, player, W, RN, world, sfx, subtitle, toast, hurtPlayer, peds, bubbles: hud.bubbles,
      sleepBodies: SLEEP_RIGS,                               // (iPhones: far packs' bodies put away, people.js Human.sleep)
      simLod: SIM_LOD,                                       // (phones: calm far packs batched by distance, src/simlod.js - eshays.js ESHAY_SIMLOD)
      crowd: !!crowd,                                        // (phones: lads start in the GPU crowd, their kit on the rig they get near - src/crowd, eshay_kit.js crowdKit)
      get crime() { return crime; }, get swat() { return swat; }, get traffic() { return traffic; }, get link() { return npcAI?.link; },
      police: () => police, time: () => time, held: () => npcAI?.city?.held,
      gameHours: () => gameMinutes / 60,                     // (the hangouts' groups come and go with the hour: src/eshay_hangouts.js)
      get npcDest() { return npcDest; },                     // (seats a hangout group sits on are reserved there)
      get combat() { return combat; } });   // (a pack standing over someone: src/combat.js standover)
    if (window.__game) window.__game.eshays = eshays;       // debug: __game.eshays.debugState() / .debugSpawn(x, z) / .stats
  } catch (err) { console.error('eshays failed to start', err); eshays = null; }
  await loadStep('stops and map');
  buildStops();
  buildMapBase();
  setupNight();
  clockHands = world.clockHands || [];
  await loadStep('police and crashes');
  // crash damage, engine fires and explosions, for every vehicle (src/vehicle-damage.js; the crashes themselves:
  // src/vehicle-physics.js, made by busjack.js as busjack.crash). Made before the shader warm-up: it owns a PointLight.
  vdamage = createVehicleDamage({
    scene, camera, sfx, player, groundY: LY.groundY, subtitle, toast, hurtPlayer, crackheads, Ragdolls, upAndFlee, viewH: () => view.h, lite: TOUCH || LITE,
    shake: v => { cam.shake = Math.min(1, cam.shake + v); }, time: () => time,
    get crash() { return busjack?.crash; }, get crime() { return crime; }, get peds() { return peds; }, get swat() { return swat; },
    exitCar: () => { if (player.driving) crime?.exitCar(true); },
  });
  // knockable street furniture (src/knock.js): decor registered every pole, sign, bin and bench while the city was built
  knock = createKnock({
    scene, camera, player, sfx, col: world.col, groundY: LY.groundY, props: A.props, propStreams: world.propStreams, viewH: () => view.h,
    serverRespawn: () => !!(online && online.active),   // (online: knocked props stand again when the room says - src/sim/knockrules.js)
    scooters, placeScooter, shake: v => { cam.shake = Math.min(1, cam.shake + v); }, get lampPools() { return lampPools; },
    // any vehicle (yours, the QPS units, the BearCats): 100 hp in src/vehicle-damage.js; a street light at 50 km/h ~5
    damageVehicle: (car, hp) => {
      const h = car.heading ?? 0, sg = (car.v || 0) < 0 ? -1 : 1, fx = Math.sin(h) * sg, fz = Math.cos(h) * sg;
      vdamage?.hit(car, hp, car.x + fx * (car.len || 4.6) / 2, car.z + fz * (car.len || 4.6) / 2, fx, fz, 'prop', hp);
    },
  });
  if (window.__game) window.__game.knock = knock;   // debug: __game.knock.stats(), __game.knock.debugKnock(x, z)
  crime = createCrime({
    scene, player, world, sfx, subtitle, toast, makeVehicleMesh, hurtPlayer, keys, cam,
    onlineCol: () => (online && online.col) || null, onlineActive: () => !!(online && online.active), onlineExit: () => online?.exit(),
    onlineKnock: (car, dt) => (online && online.active && online.knockStep ? online.knockStep(car, dt) : 1),   // (knockable props before the step, as the room: src/sim/knockrules.js)   // (the online mode: prediction drives against the room's own walls)
    get traffic() { return traffic; }, get peds() { return peds; }, get pHuman() { return pHuman; }, crackheads,
    shake: v => { cam.shake = Math.min(1, cam.shake + v); }, time: () => time, hasPoliceSuv: hasVehicle('police_suv'),
    showOverlay, respawn,
    sirenHint: TOUCH ? 'SIREN button: lights and siren' : 'Y: lights and siren',   // (entering a QPS car: crime.js)
    get busjack() { return busjack; }, get radio() { return radio; }, get swat() { return swat; }, get damage() { return vdamage; },
    get water() { return water; },     // (your car may run off the bank into the river: src/water/index.js)
    onCallArrived: () => policeArrived(),   // (your Triple Zero call's unit pulled up: src/crime.js call000)
    driftTier: LITE ? 'lite' : TOUCH ? 'touch' : 'desktop', night: () => sky.material.uniforms.night?.value ?? 0,   // (tyre marks / smoke: src/drift.js)
  });
  busjack = createBusjack({
    scene, player, keys, sfx, subtitle, toast, world, groundY: LY.groundY, walkable: LY.walkable, hurtPlayer,
    onlineActive: () => !!(online && online.active),   // (the online mode: the room's car meets no local wreck or traffic)
    get damage() { return vdamage; },
    get traffic() { return traffic; }, get peds() { return peds; }, get crime() { return crime; }, get radio() { return radio; },
    shake: v => { cam.shake = Math.min(1, cam.shake + v); },
    get riders() { return busRiders; },   // the people seated in the buses (below)
    get water() { return water; },   // (the Metro's hover won't set down on the river: src/metro/hover.js)
  });
  // the driver and passengers seated in the buses (src/busriders.js): drawn in the nearest few, they scream when the
  // bus is hijacked, crashes or is rammed, and they are the ones who run (busjack.js). You sit in the cab of a bus you
  // drive; BearCats ram buses too.
  busRiders = createBusRiders({
    scene, player, get traffic() { return traffic; }, get crime() { return crime; }, get swat() { return swat; },
    get wrecks() { return busjack.wrecks; }, pileOut: (v, looks, driver) => busjack.pileOut(v, looks, driver),
    scream: (x, z, female) => busScream(sfx, x, z, female),
    hour: () => (gameMinutes / 60) % 24, playerLook: () => pHuman.look,
  });
  // buses at their stops (src/busservice.js): the people waiting get on, riders get off; people walk to the stops near you
  busService = createBusService({
    player, W, get traffic() { return traffic; }, get peds() { return peds; }, get riders() { return busRiders; },
    get life() { return npcLife; }, get dest() { return npcDest; }, held: p => !!npcAI?.city?.held?.has(p),
    hour: () => (gameMinutes / 60) % 24,
  });
  traffic.onBusStop = (c, st) => busService.onBusStop(c, st);
  traffic.onBusDepart = c => busService.onBusDepart(c);
  // police near trouble (src/osm/traffic.js _patrol): the patrol car joins a pursuit near a wanted suspect, and drifts
  // towards trouble (hotspot, updateHotspot below) between jobs
  traffic.wanted = () => crime?.S?.wanted || 0;
  traffic.respond = c => !!crime?.adoptUnit?.(c);
  if (window.__game) window.__game.busService = busService;   // debug: __game.busService.debug()
  // the Lime helmet: H puts it on, if you like - no fine without it any more (src/helmet.js)
  helmet = createHelmet({
    scene, player, sfx, subtitle, toast,
    get pHuman() { return pHuman; }, nearLime: () => nearestScooter(2.4),
  });
  // 5 stars: QPS SERT in BearCats + POLAIR 2 overhead (src/swat.js)
  swat = createSwat({
    onlineActive: () => !!(online && online.active),   // (the online mode: the SERT here is local - it cannot move the room's body or car)
    scene, camera, renderer, player, world, sfx, subtitle, toast, cam, hurtPlayer, makeVehicleMesh,
    get crime() { return crime; }, get radio() { return radio; }, get traffic() { return traffic; }, get damage() { return vdamage; },
    night: () => sky.material.uniforms.night?.value ?? 0,
    routeTo: (fx, fz, tx, tz) => crime.route ? crime.route(fx, fz, tx, tz) : null,
    shake: v => { cam.shake = Math.min(1, cam.shake + v); },
    drawTarget: () => (bloom.enabled || gtao.enabled ? composer.renderTarget1 : null),   // (where the scene is drawn now: the SERT / POLAIR shader warm-up builds and draws for it)
    shadersBusy: () => shaderWatch.busy || shaderWatch.pending > 0 || shaderWatch.queued > 0,   // (the warm-up waits while src/shaderwatch.js builds: one queue at a time in the GPU process)
  });
  // food-delivery riders on e-bikes you can steal (src/delivery.js); the stolen e-bike rides through player.riding
  delivery = createDelivery({
    scene, camera, player, W, RN, sfx, subtitle, toast, hurtPlayer, dismount,
    groundY: LY.groundY, walkable: LY.walkable, col: world.col,
    get traffic() { return traffic; }, get peds() { return peds; }, get crime() { return crime; }, get swat() { return swat; },
    shake: v => { cam.shake = Math.min(1, cam.shake + v); }, night: () => sky.material.uniforms.night?.value ?? 0,
    inLagoon: (x, z) => world.inLagoonRing(x, z) || W.inLagoon(x, z),
    isPlaying: () => started && !paused && $('bigmap').classList.contains('hidden'),
    population: rigs,
    crowd: !!crowd,                                          // (phones: riders' bodies start in the GPU crowd - src/crowd)
  });
  if (window.__game) window.__game.delivery = delivery;   // debug: __game.delivery.riders / .stats / .debugSpawnNear()
  await loadStep('the river and sharks');
  // the water (src/water/*): swimming (rivers, the lagoon, ponds), bull sharks in the river, jet skis at the CityCat
  // terminals, a car run off the bank into the river; its splashes are src/splash.js's
  try {
    water = createWater({
      scene, camera, cam, player, W, world, keys, sfx, subtitle, toast, hurtPlayer,
      pHuman: () => pHuman, standable: footWalkable, splash: (x, y, z, s) => splashFx?.add(x, y, z, s),
      traffic: () => traffic, peds: () => peds, crime: () => crime,
      hour: () => (gameMinutes / 60) % 24, night: () => sky.material.uniforms.night?.value ?? 0,
      phone: TOUCH || LITE,   // (fewer bull sharks at once)
    });
  } catch (err) { console.error('water failed to start', err); water = null; }
  await loadStep('CityCats', 1000);   // (a breather: Safari's collector took the steps' leftovers only in ~1 s idle)
  // the CityCats (src/ferry/*): the river service between the terminals of each reach, boarding, the helm (a hijack)
  try {
    ferry = createFerries({
      scene, camera, cam, player, W, world, keys, sfx, subtitle, toast, hurtPlayer,
      pHuman: () => pHuman, water: () => water, traffic: () => traffic, crime: () => crime, radio: () => radio, damage: () => vdamage,
      splash: (x, y, z, s) => splashFx?.add(x, y, z, s), shake: v => { cam.shake = Math.min(1, cam.shake + v); },
      walkable: LY.walkable, groundY: LY.groundY,
      // the Water Police (src/ferry/police.js): their officers shoot through SERT's shared gun, sit in the rig budget,
      // light up like the cars; fewer launches on phones
      swat: () => swat, population: rigs, phone: TOUCH || LITE, night: () => sky.material.uniforms.night?.value ?? 0,
      vlights: () => vlights, river: () => river,
    });
  } catch (err) { console.error('ferries failed to start', err); ferry = null; }
  await loadStep('river traffic');
  // the river's own traffic (src/river/*): kayakers and paddleboarders by the banks, a rowing eight and its coach,
  // tinnies, runabouts, cruisers, a moored yacht or two - round you while you're near the river, two instanced draws
  try {
    if (ferry) river = createRiver({ scene, player, W, sight, ferry: () => ferry, water: () => water,
      hour: () => (gameMinutes / 60) % 24, phone: TOUCH || LITE, population: rigs, subtitle, sfx,   // (sfx: their recorded voices)
      splash: (x, y, z, s) => splashFx?.add(x, y, z, s), night: () => sky.material.uniforms.night?.value ?? 0 });   // (night: their lamps)
  } catch (err) { console.error('river traffic failed to start', err); river = null; }
  await loadStep('characters');
  // the 2026 characters (src/characters2026.js, src/characters2026_world.js): the kebab shop owner and worker at their
  // counters, rideshare drivers at the kerb, tourists, international students, locals, smoko tradies, a bartender at a
  // pub door, the weekend sausage sizzle, CityCat commuters - each with their own voice and accent; T / E plays their
  // ordered sequences (src/sequences.js), a second T is a conversation (src/cityai.js kind 'c26')
  try {
    chars26 = createCharacters2026({ scene, W, world, player, Human, sequences: Sequences,
      traffic: () => traffic, ferry: () => ferry, link: () => npcAI?.link || null, subtitle,
      gameHour: () => (gameMinutes / 60) % 24, dow: () => world.markets?.dow?.() ?? new Date().getDay(),
      wanted: () => crime?.S?.wanted || 0, fighting: () => !!combat?.fightMode,
      quiet: () => !!(npcAI?.link?.typing || npcAI?.city?.conv || Speech.busy(PRIO.chatter)),
      // (their body stays while you're in a conversation with them: src/cityai.js; and the shared rig budget)
      busy: o => !!(npcAI?.city?.held?.has?.(o) || npcAI?.city?.conv?.c?.o === o), population: rigs,
      giveFood: kind => !!wildlife?.food?.give(kind),        // (your kebab / snag in hand: the bin chickens are onto it, src/wildlife/food.js)
      takeFood: () => !!wildlife?.food?.lose?.('taken'),     // (the kebab shop owner caught you: he takes it back)
      crime: (kind, n) => crime?.crime?.(kind, n), peds: () => peds?.list || [],   // (a kebab stolen: 2 stars, and the street laughs at you)
      pay: (n, why) => { if (!(player.money >= n)) return false; player.money -= n; toast(`-$${n}  ·  ${why}`, 2.4); try { sfx?.coin?.(); } catch { /* */ } return true; },   // (the kebab shop's till, src/kebabshop.js)
      toast,
      crowd: !!crowd });                                     // (phones: a body made away from you starts in the GPU crowd - src/crowd)
    if (window.__game) window.__game.chars26 = chars26;   // debug: __game.chars26.stats / .find('kebab_counter') / .play(key, id)
  } catch (err) { console.error('2026 characters failed to start', err); chars26 = null; }
  // Calories Guy (src/calorieguy.js): the fitness influencer at his table by the walk-in kebab shop, his fans filming;
  // he follows you about when you go in for a kebab, and shoves you flying if you hit him. The solo game only. (?calorie=0: not there)
  try {
    if (chars26 && !/[?&]calorie=0\b/.test(location.search)) calorie = createCalorieGuy({ scene, W, world, player, Human, chars26: () => chars26, population: rigs, lite: LITE || TOUCH,   // (phones: 3 fans, not 5)
      hour: () => (gameMinutes / 60) % 24, quiet: () => !!(npcAI?.link?.typing || npcAI?.city?.conv),
      mouth: h => Voices.mouth(h),                           // (his voice's loudness: his gestures land on the stressed syllables)
      knock: (x, z, dmg) => { hurtPlayer(dmg, x, z, 'car'); try { sfx.crash(); } catch { /* */ } } });   // (one shove: knocked flying like a car hit)
    if (window.__game) window.__game.calorie = calorie;   // debug: __game.calorie.stats / .state / .meetAt()
  } catch (err) { console.error('Calories Guy failed to start', err); calorie = null; }
  await loadStep('NPC life', 1000);
  // street fighting (src/combat.js): the player's combo / haymaker / kick / shove / block, and the people who fight
  // back (src/cityai.js engages them through ctx.combat)
  try {
    combat = createCombat({
      player, keys, cam, sfx, subtitle, toast, hurtPlayer, crackheads, groundY: LY.groundY, walkable: LY.walkable, col: world.col,
      get pHuman() { return pHuman; }, get peds() { return peds; }, get crime() { return crime; }, get npcAI() { return npcAI; },
      busy: () => limeRide.busy || !!ferry?.atHelm, others: punchOthers, shake: v => { cam.shake = Math.min(1, cam.shake + v); },
      onlineTargets: () => (online?.active ? online.npcLive() : null), onlineHit: (e, H) => online?.hitNpc(e.owner, e.key, H.heavy ? 2 : 1, Math.round((H.dmg || 8) * 2.2)),   // (other players' people: the hit goes to their game)
      W, decks: world.decks,                 // (line of sight: police seeing a street brawl)
      get hitReact() { return hitReact; },   // (a street weapon hit: their line, the people about - src/hit_react.js)
      firstPerson: () => pov.active,         // (first person: a strike locks on along the view, not the way you move - aimAt)
    });
  } catch (err) { console.error('combat failed to start', err); combat = null; }
  // street weapons (src/weapons.js): your own thongs / shoes, and a cricket bat and a boomerang round King George Square.
  // Everyone can be hit: combat.js's target registry plus the systems below (weaponOnly: fists keep their own paths,
  // punchOthers); each says who it is for src/hit_react.js (its own lines and voice), anyone else is a 'ped'.
  try {
    hitReact = createHitReact({ subtitle, sfx, player, peds: () => peds });
    if (window.__game) window.__game.hitReact = hitReact;
    const on = h => h?.root?.visible !== false;
    combat?.addTargets('cop', { who: 'cop', weaponOnly: true,          // street police (src/crime.js): down a beat, then at you; worse than a civilian
      each(fn) { for (const o of crime?.S?.officers || []) if (o.officer && !(o.down > 0) && on(o.h)) fn(o); },
      hit(o, H) { o.down = H.weapon === 'bat' ? 0.9 : 0.6; if (o.h) o.h.hurtT = 0.4; crime?.crime('assault police', H.weapon === 'bat' ? 2.0 : 1.6); return 'hit'; } });
    combat?.addTargets('sert', { who: 'sert', weaponOnly: true,        // SERT (src/swat.js): a stagger, then they shoot
      each(fn) { for (const o of swat?.officers || []) if (!(o.down > 0) && on(o.h)) fn(o); },
      hit(o, H) { o.h && (o.h.hurtT = 0.4); o.stagger = 0.4; o.aimT = 0; o.firstAim = true; if (H.weapon === 'bat' && --o.hp <= 0) o.down = 1.5; crime?.crime('assault police', 2.0); return 'hit'; } });
    combat?.addTargets('eshay', { who: 'eshay', weaponOnly: true,      // eshays (src/eshays.js): knocked about, the pack turns on you
      each(fn) { for (const m of eshays?.list || []) if (m.state === 'ok' && on(m.h)) fn(m); },
      hit(m, H) { return eshays.hitBy(m, H.dmg * (H.weapon === 'bat' ? 2.4 : 1.6), H.fromX, H.fromZ) ? 'hit' : false; } });
    combat?.addTargets('mick', { who: 'mick', weaponOnly: true,        // Mick (src/npcai.js): his own lines
      each(fn) { const m = npcAI?.mick; if (m && on(npcAI.human)) fn(m); },
      hit(m, H) { npcAI.human?.move?.(H.weapon === 'bat' ? 'Stagger' : 'HitHead', { mask: 'upper', speed: 1.1 }); crime?.crime('assault', 0.6); return 'hit'; } });
    combat?.addTargets('riders', { weaponOnly: true,                   // Lime riders / kids on e-bikes (src/streetlife/riders.js): off they come
      each(fn) { const L = streetLife?.agents; if (L) for (const a of L) if (a.state === 'ride' || a.state === 'stand') fn(a); },
      hit(a, H) { return streetLife?.punch?.(a.x - H.dirx * 0.8, a.z - H.dirz * 0.8, H.dirx, H.dirz) ? 'hit' : false; } });
    weapons = createWeapons({ scene, player, sfx, toast, combat: () => combat, eshays: () => eshays, pHuman: () => pHuman, outfit: currentOutfit, foodKind: () => wildlife?.food?.carrying || null, foodName: k => FOOD.kinds[k]?.name || '', stage: document.getElementById('stage') || document.body, touch: !!TOUCH, camera,
      groundY: LY.groundY, walkable: LY.walkable, spawn: { x: SPAWN.x, z: SPAWN.z }, shake: v => { cam.shake = Math.min(1, cam.shake + v); } });
    if (window.__game) window.__game.weapons = weapons;   // debug: __game.weapons.A.S / .A.ground / .use() / .drop()
  } catch (err) { console.error('weapons failed to start', err); weapons = null; }
  // everyday life (src/npc/*): reachable places and reservable seats, who knows whom, goals -> actions -> routes. It
  // runs without the agent service (offline mode); the crowd AI below asks it what a conversation may offer to do.
  try {
    const busStops = W.pointsOf('busstop').filter(b => W.playable(b.x, b.z)).map(b => ({ id: b.id, x: b.x, z: b.z, name: b.name || 'bus stop' }));
    const placeList = ['King George Square', 'Queen Street Mall', 'Anzac Square', 'Post Office Square', 'City Botanic Gardens', 'South Bank Parklands',
      'Streets Beach', 'Roma Street Parkland', 'Wickham Park', 'Cultural Centre', 'Reddacliff Place', 'Brisbane Square']
      .map(n => { const pl = W.place?.(n); if (!pl) return null; const w = W.snapWalkable?.(pl.x, pl.z, 25, {}, false) || pl; return { name: n, x: w.x, z: w.z }; }).filter(Boolean);
    npcDest = createDestinations({ W, peds, benches: world.spawns.benches, busStops, spots: world.spawns.loiter, places: placeList, locals, playable: W.playable,
      shopWindows: [...(world.buildings?.shopSpill || []), ...(world.markets?.windows || [])] });   // (stage 9: lit shop windows people stop at; Phase 6A: market stalls)
    npcSocial = createSocial({ W });
    npcLife = createNpcActivities({ peds, destinations: npcDest, social: npcSocial, player, W, held: p => !!npcAI?.city?.held?.has(p),
      interrupt: (p, why) => npcAI?.city?.interrupt?.(p, why) });   // danger ends a conversation before they get away
    peds.onRecycle = p => npcLife.recycled(p);            // a background person about to become someone else: their action ends
    const scare = peds.scare.bind(peds);                  // whatever scares people nearby is a threat they get away from
    peds.scare = (x, z, r) => { scare(x, z, r); npcLife.threat(x, z, Math.max(r, 12), 12, 'scare'); };
    if (window.__game) window.__game.npc = { life: npcLife, dest: npcDest, social: npcSocial, save: () => saveNpcs(), load: () => loadNpcs(),
      demo: createNpcDemo({ life: npcLife, dest: npcDest, peds, player, save: () => saveNpcs(), load: () => loadNpcs() }) };   // (src/npc/demo.js)
  } catch (err) { console.error('NPC activities failed to start', err); npcLife = null; }
  // AI NPCs (src/npcai.js + the agent service in ai/): Mick on the Adelaide St footpath by King George Square
  try {
    npcAI = createNpcAI({ scene, player, W, RN, subtitle, toast, sfx, playthroughId: () => saveFlow.current?.runId || '', groundY: LY.groundY, spawn: SPAWN, gameHour: () => (gameMinutes / 60) % 24,
                          activities: npcLife, social: npcSocial,  // what a conversation may offer to do, who knows whom (src/npc/*)
                          gameSeconds: () => gameMinutes * 60, worldId: NPC_WORLD,
                          peds, locals, crackheads, crime,       // everyone in the city is an agent too (src/cityai.js)
                          get swat() { return swat; },           // (SERT operators: T gets a brush-off, src/coptalk.js)
                          eshays: eshays?.list || [],            // (the eshay packs' lads: src/eshays.js)
                          eshayGang: eshays,                     // (their packs: a lad whose brain has a go -> eshays.provoke)
                          characters: chars26,                   // (the 2026 characters: talked to after their sequences)
                          combat,                                // fights and shoves (src/combat.js, made just above: npcai spreads this ctx)
                          col: world.col, decks: world.decks,    // what blocks their line of sight (src/senses.js)
                          time: () => time,                      // game time (a witness report is dated when they saw it)
                          // what the NPCs can see of you (src/cityai.js situationCodes): your kit, the water, the weather
                          playerLook: () => pHuman?.look, waterMode: () => water?.mode || null,   // (functions: npcai.js spreads this ctx)
                          weather: () => (missions?.current === 'storm' ? 'storm' : '') });
    if (window.__game) window.__game.npcAI = npcAI;       // debug: __game.npcAI.debugNearMiss(), .mick, .online
  } catch (err) { console.error('AI NPCs failed to start', err); npcAI = null; }
  await loadStep('street life');
  loadNpcs();
  setInterval(() => saveNpcs(), 60000);
  addEventListener('pagehide', () => saveNpcs());
  // scripted reactions (src/reactions.js): spoken through the agent link, each person in the voice they talk in
  Reactions.link = npcAI?.link || null;
  Reactions.voiceOf = o => npcAI?.city?.voiceOf?.(o) || null;
  Reactions.prefetcher = (t, v, e, d) => Voices.prefetch(t, v, e, d);
  Reactions.load();
  if (window.__game) window.__game.reactions = Reactions;   // debug: __game.reactions.pick('ch_aggro', 'ch_au_m1')
  // street lines by situation x persona (src/streetlines.js): crashes, bumps, Triple Zero calls, eshay chase taunts...
  StreetLines.link = npcAI?.link || null;
  StreetLines.voiceOf = Reactions.voiceOf;
  StreetLines.nameOf = o => npcAI?.city?.nameOf?.(o) || '';
  StreetLines.player = player; StreetLines.toast = toast;
  StreetLines.people = v => (npcAI?.city?.witnessesFor ? npcAI.city.witnessesFor(v, 'ped', v.x, v.z, { r: 22, max: 6, dangerAt: 0.4 })
    : peds.list.map(o => ({ o, kind: 'ped' })));          // (who saw it: src/senses.js line of sight)
  StreetLines.onReport = r => crime?.witnessReport?.(r);  // someone who rings Triple Zero really reports it
  StreetLines.load();
  // a driver you bumped has a go at you as they drive off (src/vehicle-physics.js: honk + this line, else its own)
  CRASH_TALK.line = (x, z) => StreetLines.lineFor({ x, z, look: { female: Math.random() < 0.3 } }, 'angry_at_rider', { vehicle: 'car', kind: 'drv' })?.text || null;
  if (window.__game) window.__game.streetLines = StreetLines;   // debug: __game.streetLines.log, .stats, .react(p, 'near_miss')
  // the street's small talk and small moments: never over the player's own conversation, a chat, or from a car
  const streetQuiet = () => !!(player.driving || player.riding || npcAI?.link?.typing || npcAI?.city?.conv || Speech.busy(PRIO.chatter));
  const heldBy = p => !!npcAI?.city?.held?.has(p) || Sequences.holds(p);   // (in a conversation sequence: left alone)
  overheard = createOverheard({ peds, player, Reactions, nameOf: o => npcAI?.city?.nameOf?.(o) || '', quiet: streetQuiet, held: heldBy });
  moments = createMoments({ scene, camera, player, peds, locals, Reactions, groundY: LY.groundY, walkable: (x, z) => LY.walkable(x, z) && W.playable(x, z),
    audio: createMissionAudio(sfx, () => player), held: heldBy, quiet: streetQuiet, skip: WILDLIFE_ON ? ['ibis', 'magpie'] : [] });
  // wildlife (src/wildlife/*): magpies (swooping in season), crows, currawongs, bin chickens, South Bank gulls, birds
  // nicking people's lunch, possums in the park trees at night (?wildlife=0: off, the old bin chickens come back)
  // (its own load step: a crumb, and on phones a breather before it, so the city build's garbage can go first)
  if (WILDLIFE_ON) await loadStep('wildlife');
  if (WILDLIFE_ON) try {
    wildlife = createWildlife({ scene, camera, player, W, world, groundY: LY.groundY, sfx, Reactions, ibisSpots: ibisSpots.slice(0, 40),
      get peds() { return peds; }, get locals() { return locals; }, pHuman: () => pHuman, hour: () => (gameMinutes / 60) % 24,
      night: () => sky.material.uniforms.night?.value ?? 0, hurtPlayer, toast, held: heldBy, paused: () => paused,
      quiet: () => !!(npcAI?.link?.typing || npcAI?.city?.conv || Speech.busy(PRIO.chatter)),
      shake: v => { cam.shake = Math.min(1, cam.shake + v); },
      helmetOn: () => !!player.helmet || (!!missions?.sys?.progress?.has?.('helmet') && missions.sys.progress.pref('helmet') !== false),
      missionBusy: () => ['magpie', 'ibis', 'pie'].includes(missions?.current),
      subtitle, mission: () => missions?.current || null, inWater: () => !!water?.active || !!ferry?.aboard, start: SPAWN,   // (your food and the bin chickens: src/wildlife/food.js; a pie by the start)
      onEvent: (name, info) => Sequences.event(name, info) });   // (a theft / swoop starts its NPC-to-NPC sequence)
    if (window.__game) window.__game.wildlife = wildlife;   // debug: __game.wildlife.stats2() / .nests() / .goNest(i) / .swoopMe() / .lunch()
    // (the perf tools' in-session A/B: off = disposed, a true zero; on = made again from the same context)
    const wlCtx = wildlife.ctx;
    Features.register('wildlife', {
      on: () => !!wildlife,
      disable() { wildlife?.dispose(); wildlife = null; if (window.__game) window.__game.wildlife = null; },
      enable() { if (wildlife) return; wildlife = createWildlife(wlCtx); if (window.__game) window.__game.wildlife = wildlife; },
    });
  } catch (err) { console.error('wildlife failed to start', err); wildlife = null; }
  if (!ibises && !wildlife) ibises = new Ibises(scene, ibisSpots.slice(0, 40));   // (fallback: the old bin chickens)
  // conversation sequences (src/sequences.js, data/sequences.json): ordered NPC-to-NPC scenes near you by situation
  // (bus stop, CityCat terminal, smoko, office lunch, Valley / Maccas late, magpie nests, bin chicken thefts, Origin
  // night, the storm mission) and the 2026 characters' player-facing ones (Sequences.talkTo / start)
  try {
    let stormEnd = -1e9;
    Sequences.init({ link: npcAI?.link || null, speech: Speech, player, peds, voiceOf: Reactions.voiceOf, nameOf: o => npcAI?.city?.nameOf?.(o) || '',
      hour: () => (gameMinutes / 60) % 24, night: () => sky.material.uniforms.night?.value ?? 0,
      month: () => new Date(Date.now() + 10 * 3600e3).getUTCMonth() + 1, weekday: () => new Date(Date.now() + 10 * 3600e3).getUTCDay(),
      wanted: () => crime?.S?.wanted || 0, held: p => !!npcAI?.city?.held?.has(p),
      quiet: streetQuiet, inConversation: () => !!(npcAI?.link?.typing || npcAI?.city?.conv),
      nests: () => wildlife?.nests?.() || [], magpieSeason: () => (wildlife ? !!wildlife.season : [8, 9, 10].includes(new Date().getMonth() + 1)),
      storm: () => { if (missions?.current === 'storm') { stormEnd = time; return 'before'; } return time - stormEnd < 240 ? 'after' : null; },
      spots: {
        busstop: W.pointsOf('busstop').filter(b => W.playable(b.x, b.z)).map(b => ({ x: b.x, z: b.z })),
        ferry: (W.places || []).filter(p => /ferry_terminal/.test(p.kind || '')).map(p => ({ x: p.x, z: p.z })),
        beach: ['Streets Beach'].map(n => W.place?.(n)).filter(Boolean).map(p => ({ x: p.x, z: p.z })),
      } });
    Sequences.load();
    if (window.__game) window.__game.sequences = Sequences;   // debug: __game.sequences.stats() / .now() / .start('bus_stop_01', {speakers:[a,b]})
  } catch (err) { console.error('sequences failed to start', err); }
  peds.onRecycle = (prev => p => { if (overheard?.active?.p === p) overheard.end(); p.h?.phone?.(false); prev?.(p); })(peds.onRecycle);
  if (window.__game) {
    window.__game.overheard = overheard; window.__game.moments = moments; window.__game.locals = locals;
    Object.assign(window.__game.npc?.demo || {}, { overhear: () => overheard.now(), ibis: () => moments.ibis(), magpie: () => moments.magpie(), hat: () => moments.hat() });
  }
  // street life (src/streetlife/*): Lime riders on the footpaths, kids on e-bikes (and now and then a mob of them taking
  // over an intersection), buskers with their own music, and what happens when someone's bowled over. Before bodies:
  // its new buskers join locals.list.
  if (STREETLIFE_ON) try {
    streetLife = createStreetLife({ scene, camera, player, W, RN, world, sfx, locals, limeRide, spawn: SPAWN, riderPrewarm: SLEEP_RIGS ? 2 : undefined, simLod: SIM_LOD,
      subtitle, toast, hurtPlayer, shake: v => { cam.shake = Math.min(1, cam.shake + v); },
      get peds() { return peds; }, get traffic() { return traffic; }, get crime() { return crime; }, get swat() { return swat; },
      get wrecks() { return busjack?.crash?.wrecks; },   // (f0034: riders go round / bounce off wrecks too)
      hour: () => (gameMinutes / 60) % 24, time: () => time, held: heldBy, busy: () => !!photo,
      night: () => sky.material.uniforms.night?.value ?? 0, population: rigs, crowd: !!crowd });
    if (window.__game) window.__game.streetLife = streetLife;   // debug: __game.streetLife.stats() / .debugLime() / .debugTakeover()
  } catch (err) { console.error('street life failed to start', err); streetLife = null; }
  await loadStep('bodies');
  if (crowd) crowdMoreSources();
  registerRigs();
  // bodies (src/bodies.js): you can't walk through people, and crackheads don't walk through each other, the crowd,
  // eshays or the police; every push is resolved against the walls on the spot
  try {
    bodies = createBodies({
      player, col: world.col, walkable: LY.walkable, playerWalkable: footWalkable, crackheads,
      playerFree: () => !limeRide.busy && !limeRide.stepping && !photo,
      get peds() { return peds; }, get locals() { return locals; }, get eshays() { return eshays; }, get crime() { return crime; },
      get swat() { return swat; }, get npcAI() { return npcAI; }, get pHuman() { return pHuman; },
      // f0031/f0032: everyone else on foot is solid too (src/bodies.js others)
      get chars26() { return chars26; }, get markets() { return world?.markets; }, get missionNpcs() { return missions?.npcs; },
      get delivery() { return delivery; }, get streetRiders() { return streetLife; }, get busPeople() { return busjack?.people; },
      get ferryPeople() { return ferry?.people; },
      onContact:(o, kind, tier, info) => playerTouched(o, kind, tier, info),   // (you touched someone: lines, knock-downs)
    });
    if (window.__game) window.__game.bodies = bodies;     // debug: __game.bodies.stats
  } catch (err) { console.error('bodies failed to start', err); bodies = null; }
  // the contact debug view (src/colview.js): every body's and vehicle's collider drawn over the world
  try {
    colView = createColView({ scene, player, get bodies() { return bodies; }, traffic: () => traffic, crash: () => busjack?.crash,
      crime: () => crime, swat: () => swat, personal: PERSONAL });
    if (/[?&]colview\b/.test(location.search)) colView.set(true);
  } catch (err) { console.warn('colview unavailable', err); colView = null; }
  await loadStep('missions');
  try {
    missions = createMissions({
      scene, camera, player, W, world, sfx, subtitle, toast, cam,
      canvas: renderer.domElement,
      makeHuman: look => new Human(look, 1, false),
      playerMesh: () => pHuman.root,
      firstPerson: () => pov.active,           // (the camera at your eyes: a marker's beam isn't drawn around it - src/missions/fx.js)
      isPlaying: () => started && !paused && $('bigmap').classList.contains('hidden'),
      hurtPlayer: (dmg, x, z) => hurtPlayer(dmg, x, z),
      addMoney: n => { player.money += n; },
      gameHour: () => (gameMinutes / 60) % 24,
      setGameHour: h => { gameMinutes = Math.floor(gameMinutes / 1440) * 1440 + h * 60; },
      crime, makeVehicleMesh,
      guarding: () => !!wildlife?.food?.guarding, offerGuard: (s, alert) => wildlife?.food?.offer(s, alert),   // (the pie thief vs SHOO: src/wildlife/food.js)
      busDoors: (car, open) => car.mesh && setBusDoors(car.mesh, open),
      wanted: () => crime.S.wanted,
      busted: () => !!crime.S.busted, heat: (kind, n) => crime.crime(kind, n), wheelieOn: () => !!wheelie.on,
      get crew() { return streetLife?.riders?.crew || null; },                   // (the e-bike crew: src/missions/m_crew.js)
      giveBike: (x, z, ry, color, model) => delivery?.adoptKidBike({ color, scale: 1, x, z, ry, v: 0, fallen: false, gift: true, model }) || null,
      scooters,                                // (the parked Lymes: First Ride points at the nearest, src/missions/m_first.js)
      storage: saveFlow.missionStorage,        // (the mission records live in the player's save, src/saveflow.js)
    });
    watchMissions(missions);
  } catch (err) { console.error('missions failed to start', err); missions = null; }
  try { metroUnlock = createMetroUnlock({ missions, crime, scene, player, W, RN, world, spawn: SPAWN, toast, sfx, subtitle, touch: TOUCH, get traffic() { return traffic; }, get peds() { return peds; }, crackheads, storage: saveFlow.metroStorage }); if (window.__game) window.__game.metroUnlock = metroUnlock; }
  catch (err) { console.warn('metro unlock unavailable', err); metroUnlock = null; }
  registerBudget();
}
// The memory budget's reporters (src/budget.js, docs/PHONE_MEMORY.md): what each system holds, by its scene roots (named:
// a new system names its top-level objects and adds a line here, or registers itself). Read by ?diag=1 and the gate.
function registerBudget() {
  const tops = re => scene.children.filter(o => re.test(o.name || ''));
  const WATER = /^(citycat|cityferry|kittycat|river|water|ferry|shark|jetski|police_launch)/i, CITY = /^(stream-|ground|osm-|CityHall|KingGeorgeV|phase6a|boundary|WheelOfBrisbane|anzac)/;
  budget.register('city', () => ({ roots: tops(CITY) }))
    .register('traffic', () => ({ roots: [...(traffic?.cars || []).map(c => c.mesh), ...(traffic?.visual || []).map(p => p.mesh), ...tops(/^farcars_/)] }))
    .register('people', () => ({ roots: [...tops(/^crowd/), ...(peds?.list || []).map(p => p.h?.root), ...(locals?.list || []).map(p => p.h?.root)], rigs: rigs.stats?.().resident }))
    .register('waterways', () => ({ roots: tops(WATER) }))
    .register('missions', () => ({ roots: missions?.npcs ? missions.npcs.map(n => n.h?.root || n.root) : [] }));
  if (window.__game) window.__game.budget = { report: () => budget.report(0, scene), allow: budget.allow, pressure: budget.pressure, limits: budget.limits, tier: budget.tier };
}
let crime = null, busjack = null, radio = null;
let metroUnlock = null;   // the Brisbane Metro's code-giver and its one Metro (src/metro/unlock.js)
let busRiders = null;  // the people seated in the buses (src/busriders.js)
let busService = null; // people on and off the buses at their stops (src/busservice.js)
let vlights = null;    // vehicle lamps (src/vehicle-lights.js)
let carDark = 0, carLit = 0;   // how dark it is for the car lamps (updateDayNight): 0 day .. 1 night
let helmet = null;     // the Lime helmet: H puts it on, your choice (src/helmet.js)
let swat = null;   // 5 stars: QPS SERT + POLAIR (src/swat.js)
let knock = null;
let vdamage = null;   // vehicle damage, fires, explosions (src/vehicle-damage.js)
let delivery = null;   // delivery riders + stolen e-bikes (src/delivery.js)
let streetLife = null; // Lime riders, kid gangs on e-bikes and their takeovers, buskers, bowling people over (src/streetlife/*)
let npcAI = null;      // AI NPCs talking through the agent service (src/npcai.js, ai/)
let splashFx = null;   // spray and foam where someone goes into the river (src/splash.js)
let river = null;      // the river's own traffic: kayaks, paddleboards, rowers, tinnies, cruisers (src/river/*)
let taxis = null;      // people hailing cabs and getting out of them (src/taxis.js)
let chars26 = null;    // the 2026 characters and their sequences (src/characters2026_world.js)
let calorie = null;    // Calories Guy by the kebab shop (src/calorieguy.js; solo only)
const TRY_CALORIE = /[?&]try=calorie\b/.test(location.search);   // (the owner's try link: start on the footpath in front of him)
let water = null;      // swimming, sharks, jet skis, a car into the river (src/water/*)
let ferry = null;      // the CityCats: the river service, riding, the helm (src/ferry/*)
let npcLife = null, npcDest = null, npcSocial = null;   // everyday life: goals, routes, seats, who knows whom (src/npc/*)
const NPC_WORLD = 'brisbane-1';                           // the saved people belong to this world (src/npc/persist.js)
/** the people who matter (talked to, helped, wronged; Mick), as plain data in localStorage */
function saveNpcs() {
  if (!npcLife || !peds || saveFlow.resetting) return false;   // (resetting: New game is reloading - the old people must not be written back)
  try {
    const save = npcSnapshot({ peds, activities: npcLife, social: npcSocial, nameOf: p => npcAI?.city?.nameOf?.(p) || '', worldId: NPC_WORLD,
      gameMinutes, extra: npcAI?.mick ? [[npcAI.mick, 'known']] : [] });
    return saveToStorage(save);
  } catch (err) { console.warn('NPC save failed', err); return false; }
}
function loadNpcs() {
  if (!npcLife || !peds) return null;
  try {
    const save = loadFromStorage();
    if (!save) return null;
    const r = npcRestore(save, { peds, activities: npcLife, social: npcSocial, destinations: npcDest, worldId: NPC_WORLD, known: npcAI?.mick ? { mick: npcAI.mick } : {} });
    if (r.restored.length) console.log(`[npc] restored ${r.restored.length} people` + (r.skipped.length ? `, skipped ${r.skipped.length}` : ''));
    return r;
  } catch (err) { console.warn('NPC load failed', err); return null; }
}
let eshays = null;     // eshay packs (src/eshays.js)
let weapons = null;    // street weapons (src/weapons.js)
let hitReact = null;   // the shared weapon-hit reaction (src/hit_react.js)
let combat = null;     // street fighting: the player's moves and the people who fight back (src/combat.js)
let bodies = null;     // nobody walks through anybody: you vs everyone, crackheads vs the crowd (src/bodies.js)
let phoneTexTimer = 0, freeTexN = 0;  // (phones: the texture pass, every few seconds in play: src/phonemem.js)
let touchUI = null;     // the on-screen controls on a phone / tablet (src/touch.js; made at the end)
let colView = null;    // the contact debug view (src/colview.js: ?colview=1, F7, __game.colView(true))
// Only a vehicle's painted body casts a shadow (wheels, glass, lamps, the bus interior don't): ~6 fewer shadow draws per car.
function trimVehicleShadows(mesh) {
  mesh.traverse(o => {
    if (!o.isMesh) return;
    if (o.material === vehicleMats.bodyMat) o.castShadow = o.parent === mesh;
    else if (o.material === vehicleMats.glassMat || o.material === vehicleMats.lampMat || /interior|glass/i.test(o.name + ' ' + (o.material?.name || ''))) o.castShadow = false;
  });
}
// the real car models in traffic (assets/cars, tools/import_cars.py): names for the HUD and the steal prompt
// (what a vehicle is called on screen: plain kinds, no make or model - not even parody brands - since 2026-10-09)
const CAR_NAMES = { hilux: 'ute', hilux_workmate: 'work ute', ranger: 'ute', rav4: 'SUV', camry: 'sedan', hiace: 'van',
  model3: 'electric sedan', modely: 'electric SUV', atto3: 'electric SUV', seal: 'electric sedan', dolphin: 'electric hatchback',
  qps_camry: 'police car', qps_rav4: 'police SUV', taxi_camry: 'Black & White cab', bearcat: 'SERT armoured truck' };
// Distant cars: chassis + wheels as ONE pre-merged mesh (assets.js userData.farBody), no plates / wheel pivots.
function vehicleLOD(mesh, far) {
  const u = mesh.userData;
  if (!u.farBody || !u.chassisMesh || u.lodFar === far) return;
  u.lodFar = far;
  // (far cars cast no shadow: that was ~50 of the ~370 shadow-pass draws, for shadows a few pixels long)
  if (far && !u.farMesh) { u.farMesh = new THREE.Mesh(u.farBody, u.farMat || vehicleMats.bodyMat); u.farMesh.castShadow = false; u.farMesh.receiveShadow = true; mesh.add(u.farMesh); }
  if (u.farMesh) u.farMesh.visible = far;
  u.chassisMesh.visible = !far;
  for (const w of u.wheels || []) w.pivot.visible = !far;
  for (const t of u.textured || []) t.visible = !far;
}
function updateVehicleLOD() {
  const cx = camera.position.x, cz = camera.position.z;
  farCars?.begin();          // (far cars of one model: one instanced draw - src/farcars.js)
  const lod = m => { const d = Math.abs(m.position.x - cx) + Math.abs(m.position.z - cz); vehicleLOD(m, m.userData.lodFar ? d > 60 : d > 72); farCars?.visit(m); };
  for (const c of traffic.cars) lod(c.mesh);
  for (const f of traffic.flows) lod(f.mesh);
  for (const u of crime.S.units) lod(u.mesh);
  for (const a of crime.S.abandoned) lod(a.mesh);
  for (const t of swat?.trucks || []) lod(t.mesh);
  // parked cars: drawn only within ~170 m (Manhattan) of the camera, the far body beyond 72 m
  for (const p of traffic.visual) {
    const m = p.mesh; if (!m) continue;
    const d = Math.abs(m.position.x - cx) + Math.abs(m.position.z - cz);
    m.visible = d < 170 && !online?.active;   // (online: the room's parked cars are drawn instead - src/multiplayer/online.js)
    if (m.visible) lod(m);
  }
  if (online?.active) online.eachMesh(lod);   // (the room's cars, its parked cars, the others' police cars: the same far body and instanced far draw as this screen's own)
  if (player.driving) vehicleLOD(player.driving.mesh, false);
  farCars?.end();
}
// People are skinned meshes with frustumCulled = false (their bounds move with the animation), so cull whole
// people against the view frustum here: a person is ~3 draw calls.
const _frustum = new THREE.Frustum(), _pv = new THREE.Matrix4(), _sph = new THREE.Sphere(new THREE.Vector3(), 1.4);
// The sun's shadow pass walks every visible object in the scene, casters or not. The crowd casts no shadows of its own
// (a blob each: people.js Human with shadows = false - its body, clothes, hair and props all castShadow false), so for
// that pass only the walkers and the seated people are hidden: ~50 people x ~45 bones and parts it no longer walks.
{
  const sm = renderer.shadowMap, render = sm.render, hid = [];
  const skip = L => { if (L) for (const p of L) { const h = p.h, r = h?.root; if (r && r.visible && h.shadows === false && !h.rag) { r.visible = false; hid.push(r); } } };
  sm.render = function () {
    skip(peds?.list); skip(locals?.list);
    const own = povHid;   // (first person: your body is out of the view's draw, not the sun's - your shadow stays. renderNow)
    if (own) own.visible = true;
    try { return render.apply(this, arguments); } finally { if (own) own.visible = false; for (let i = 0; i < hid.length; i++) hid[i].visible = true; hid.length = 0; }
  };
}
// Effect draws that are empty most of the time - particle pools, sparks, tracers, crash debris, busker coins: a draw
// range or an instance count of 0 - still cost three.js a whole draw set-up each (~10-35 us of CPU, in the shadow pass
// too). Empty ones are off the camera's layers until they have something to draw (their visibility stays their
// owners'). The scene's top-level instanced / ranged draws are listed every 2 s.
const fxDraws = [];
let fxDrawsT = 0;
function skipEmptyDraws(dt) {
  if ((fxDrawsT -= dt) <= 0) {
    fxDrawsT = 2; fxDraws.length = 0;
    for (const o of scene.children) if (o.isInstancedMesh || ((o.isPoints || o.isMesh) && o.geometry?.drawRange && o.geometry.drawRange.count !== Infinity)) fxDraws.push(o);
  }
  for (let i = 0; i < fxDraws.length; i++) {
    const o = fxDraws[i], u = o.userData, empty = o.isInstancedMesh ? o.count === 0 : o.geometry.drawRange.count === 0;
    if (empty === !!u.emptyDraw) continue;
    u.emptyDraw = empty;
    if (empty) { u.drawLayers = o.layers.mask; o.layers.mask = 0; } else o.layers.mask = u.drawLayers ?? 1;
  }
}
// The static city wholly inside the fog (its nearest point further than scene.fog.far: drawn, it would be the fog colour
// exactly) is taken off the camera's layers - the merged building and ground chunks, the backdrop skyline, the
// decoration chunks. Four times a second, with 10 m of hysteresis; the list is made again every 2 s (a streamed cell,
// src/stream, joins it). Phones only (VIEW_FAR): the desktop's 3.4 km fog has almost nothing past it.
const farCulled = { list: [], scanT: 0, t: 0, hidden: 0 };
const _fcBounds = new WeakMap(), _fcV = new THREE.Vector3();
function farCullScan() {
  const old = farCulled.list.slice(), L = farCulled.list; L.length = 0;
  const fogged = m => (Array.isArray(m) ? m.every(x => x.fog !== false) : m && m.fog !== false);
  const add = o => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.geometry || !fogged(o.material)) return;
    if (o.geometry.drawRange && o.geometry.drawRange.count !== Infinity) return;   // (an effect pool: skipEmptyDraws')
    let b = _fcBounds.get(o);
    if (!b) {
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      o.updateWorldMatrix(true, false);
      _fcV.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld);
      b = { x: _fcV.x, z: _fcV.z, r: o.geometry.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis(), cut: false, mask: 1 };
      _fcBounds.set(o, b);
    }
    L.push(o);
  };
  for (const c of scene.children) {
    if (c.isMesh && c.matrixAutoUpdate === false) add(c);                              // (the merged chunks: kit.js Batcher)
    else if (c.isLOD && c.userData?.cut !== undefined) for (const l of c.levels) add(l.object);   // (decoration chunks)
    else if (c.name === 'ground' || c.name === 'osm-backdrop-buildings') for (const g of c.children) add(g);
  }
  // (one that left the list - out of the scene, streamed away - goes back on its own layers: never left hidden)
  const now = new Set(L);
  for (const o of old) { const b = _fcBounds.get(o); if (b?.cut && !now.has(o)) { b.cut = false; o.layers.mask = b.mask || 1; } }
}
function farCull(dt) {
  if (!VIEW_FAR || (farCulled.t -= dt) > 0) return;
  farCulled.t = 0.25;
  if ((farCulled.scanT -= 0.25) <= 0) { farCulled.scanT = 2; farCullScan(); }
  const cx = camera.position.x, cz = camera.position.z, lim = scene.fog.far;
  let hidden = 0;
  for (const o of farCulled.list) {
    const b = _fcBounds.get(o), dx = b.x - cx, dz = b.z - cz, near = Math.sqrt(dx * dx + dz * dz) - b.r;
    const cut = b.cut ? near > lim : near > lim + 10;
    if (cut !== b.cut) {
      b.cut = cut;
      if (cut) { b.mask = o.layers.mask; o.layers.mask = 0; } else o.layers.mask = b.mask || 1;
    }
    if (cut) hidden++;
  }
  farCulled.hidden = hidden;
}
function cullPeople() {
  camera.updateMatrixWorld();
  _frustum.setFromProjectionMatrix(_pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  // (h.onScreen feeds the pose budget, src/people.js POSE: culled people are posed at 5 Hz, and at once on coming back)
  const test = h => {
    const r = h.root; if (!r.visible) { h.onScreen = false; return; }
    _sph.center.set(r.position.x, r.position.y + 0.9, r.position.z);
    if (!_frustum.intersectsSphere(_sph)) { r.visible = false; h.onScreen = false; return; }
    if (h.onScreen === false) h.catchUpPose?.();
    h.onScreen = true;
  };
  for (const p of peds.list) test(p.h);
  for (const o of locals.list) test(o.h);
  for (const c of crackheads) test(c.h);
  for (const e of eshays?.list || []) test(e.h);
  for (const o of swat?.officers || []) test(o.h);
  // the Water Police officers (launches, jet skis) and those in the water: off screen, not drawn - nor in the shadow
  // pass (the launch behind you in a chase was ~5 shadow draws an officer); their look on screen is unchanged
  const PB = ferry?.police;
  if (PB) {
    for (const L of PB.units || PB.launches) if (L.on && L.officers) for (const o of L.officers) if (o.body) test(o.body.h);
    for (const s of PB.crew?.swimmers || []) if (s.b) test(s.b.h);
  }
}
function showOverlay(title, text, btn, cb) {
  $('deadTitle').textContent = title; $('deadText').textContent = text; $('respawnBtn').textContent = btn;
  $('respawnBtn').onclick = () => { $('dead').classList.add('hidden'); cb(); };
  $('dead').classList.remove('hidden'); document.exitPointerLock?.();
}
// Brisbane City Hall's clock (the model is placed by src/osm/index.js at the real footprint)
let clockHands = [];
function updateClock() {
  if (!clockHands.length) return;
  const mins = gameMinutes % 720;
  for (const c of clockHands) { c.h.rotation.z = c.h0 - mins / 720 * Math.PI * 2; c.m.rotation.z = c.m0 - (mins % 60) / 60 * Math.PI * 2; }
}
function placeScooter(sc) {
  sc.root.position.set(sc.x, LY.groundY(sc.x, sc.z), sc.z);
  sc.root.rotation.set(0, sc.ry, 0);
  const b = sc.root.userData.body;
  if (sc.fallen) {
    // lying on its side, resting on the deck edge and the handlebar end, to the left or right
    const f = scooterFallPose(b), side = (Math.round(sc.x * 7 + sc.z * 13) & 1) ? 1 : -1;
    b.rotation.set(0, 0, f.th * side);
    b.position.set(f.dx * side, f.lift, 0);
  } else {
    b.rotation.set(0, 0, sc.lean);
    b.position.set(0, 0, 0);
  }
  sc.root.userData.stand.visible = !sc.fallen && sc !== player.riding;
}
// Tipped-over pose of the scooter model, from its geometry: roll it about its long axis (local z) towards -x,
// pivoting on the lowest contact each time (gift-wrapping the cross-section) until its centre of mass sits over the
// contacts. -> { th (roll, rad), lift (so nothing is under the ground), dx (half-centres the lying footprint) }
let _limeFall = null;
function scooterFallPose(body) {
  if (_limeFall) return _limeFall;
  const xs = [], ys = [], v = new THREE.Vector3(), inv = new THREE.Matrix4(), m = new THREE.Matrix4();
  body.updateMatrixWorld(true);
  inv.copy(body.matrixWorld).invert();
  body.traverse(o => {
    const p = o.isMesh && o.geometry?.attributes?.position; if (!p) return;
    m.multiplyMatrices(inv, o.matrixWorld);
    for (let i = 0, step = Math.max(1, Math.floor(p.count / 2000)); i < p.count; i += step) { v.fromBufferAttribute(p, i).applyMatrix4(m); xs.push(v.x); ys.push(v.y); }
  });
  const n = xs.length;
  if (n < 8) return (_limeFall = { th: Math.PI / 2 - 0.1, lift: 0.06, dx: 0.15 });
  let cx = 0, cy = 0; for (let i = 0; i < n; i++) { cx += xs[i] / n; cy += ys[i] / n; }
  let th = 0;
  for (let it = 0; it < 8; it++) {
    const c = Math.cos(th), s = Math.sin(th);
    let miny = Infinity; for (let i = 0; i < n; i++) miny = Math.min(miny, xs[i] * s + ys[i] * c);
    let px = Infinity, py = 0;
    for (let i = 0; i < n; i++) { const y = xs[i] * s + ys[i] * c; if (y < miny + 0.003) { const x = xs[i] * c - ys[i] * s; if (x < px) { px = x; py = y; } } }
    if (it > 0 && cx * c - cy * s > px + 0.02) break;                      // centre of mass over the contacts: at rest
    let best = Infinity;
    for (let i = 0; i < n; i++) { const x = xs[i] * c - ys[i] * s; if (x < px - 0.02) best = Math.min(best, Math.atan2(xs[i] * s + ys[i] * c - py, px - x)); }
    if (!(best < Infinity)) break;
    th += Math.max(0.005, best);
  }
  const c = Math.cos(th), s = Math.sin(th);
  let miny = Infinity, minx = Infinity, maxx = -Infinity;
  for (let i = 0; i < n; i++) { const x = xs[i] * c - ys[i] * s, y = xs[i] * s + ys[i] * c; miny = Math.min(miny, y); minx = Math.min(minx, x); maxx = Math.max(maxx, x); }
  return (_limeFall = { th, lift: -miny + 0.004, dx: -(minx + maxx) / 4 });
}
// The model's biggest mesh is the scooter; the rest (decals, lamp lens) are detail for close range (cullScooters)
function scooterParts(sc) {
  const meshes = [];
  sc.root.traverse(o => { if (o.isMesh) meshes.push(o); });
  const tris = o => (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
  meshes.sort((a, b) => tris(b) - tris(a));
  sc.main = meshes.length > 3 ? meshes : meshes.slice(0, 1);     // the procedural fallback is many small parts: keep all
  sc.detail = meshes.length > 3 ? [] : meshes.slice(1);
  for (const m of sc.detail) m.castShadow = false;                 // a decal / lamp lens shadow is invisible anyway
  sc.lodNear = sc.lodShadow = true;
}

// ------------------------------------------------------------------ crackheads
const LINES = {
  beg: ['Oi! Oi, brother! Got a spare dollar?', "Scuse me mate, you got a durry?", 'Lend us your phone, I gotta call me mum.', 'Just need two bucks for the bus, bro.', "Hey, hey... you got a lighter?", "Bro. Bro. Bro. Listen to me for one sec."],
  aggro: ["What are you lookin' at, ya dog?!", "Don't walk away from me!", "I'll smash ya, I swear!", "Come 'ere! COME 'ERE!", "You think you're better than me, eh?!", "Oi! I'm talkin' to you!"],
  scooter: ["Oi, that's my scooter, ya dog!", 'Give us a ride on that!', 'Get off the scooter, c\'mon!'],
  hit: ['Argh!', 'Ya mongrel!', 'Ow! Oi!', 'Aaagh!'],
  down: ["Alright, alright! I'm done!", "Me ribs, bro...", 'Okay okay okay...'],
  paid: ['Legend! Legend, brother. God bless.', 'Too easy, bro. Too easy.', 'You\'re a good man. Good man.'],
  greedy: ["That's it?! Two bucks?! Give us the wallet!", 'Nah, nah. I want the lot.'],
  lost: ['Yeah run, ya dog!', "I'll find ya!", 'Yeah, you better run!'],
  mutter: ["They're all watchin' me...", "Where's me thong?", 'Nah nah nah nah nah...', 'Gotta get to the Valley...', 'Who took me bag?!'],
  cops: ["Cops! I'm out!", 'Nah, not the jacks!'],
};
// what a crackhead says over a line of his own still going (the rest - beg, mutter, aggro, scooter, lost - wait for it)
const CH_CUTS_IN = new Set(['hit', 'down', 'cops', 'paid', 'greedy']);
class Crackhead {
  constructor(x, z, roamer = false) {
    const look = crackheadLook();   // shirtless, filthy and wired, every one of them (src/clothes.js, map fault f0022)
    this.bottle = Math.random() < 0.35; // longneck in a paper bag, or a bottle
    look.bottle = this.bottle;
    this.h = new Human(look, rnd(0.95, 1.05));
    this.h.twitch = 1;
    if (this.bottle && !this.h.glb) {
      const b = new THREE.Mesh(this.h.own(new THREE.CylinderGeometry(0.04, 0.045, 0.28, 8)), mat(pick([0x2e5d2a, 0x7a5a2a])));
      b.position.set(0, -0.36, 0.04); this.h.arms[1].el.add(b);
    }
    scene.add(this.h.root);
    this.home = { x, z }; this.x = x + rnd(-2, 2); this.z = z + rnd(-2, 2);
    if (!W.walkable(this.x, this.z)) { this.x = x; this.z = z; }
    this.heading = rnd(0, 6.28); this.state = roamer ? 'beg' : 'loiter'; this.t = 0; this.hp = 70;
    this.cool = rnd(3, 10); this.wander = { x: this.x, z: this.z, t: 0 };
    this.lineT = 0; this.windup = 0; this.swingCd = 0; this.stuck = 0; this.side = 0; this.calmT = 0; this.roamer = roamer; this.speed = 0;
    this.bubble = document.createElement('div'); this.bubble.style.display = 'none'; hud.bubbles.appendChild(this.bubble);
    this.bubbleT = 0; this.lostT = 0; this.respawn = 0; this.kx = 0; this.kz = 0;
  }
  say(kind, angry = false) {
    // his own native Australian voice, from 10-32 lines per situation with no repeats (src/reactions.js, data/reactions.json
    // ch_*); heard as far as a shout carries, so the taunts follow you as you get away. Without the agent service: the
    // few old lines and their recordings, as before.
    // One line at a time: his next beg / mutter / taunt never cuts off a line of his own he's still saying (it waits for
    // it, and a beat after it: src/speech.js createLineGate). Pain, getting knocked down, the cops, your money: those cut straight in.
    const gate = this.gate ||= createLineGate();
    if (!CH_CUTS_IN.has(kind) && !gate.free()) { gate.hold([kind, angry, this.state]); return; }
    gate.clear(); gate.said(null, 0);
    const said = Reactions.say('ch_' + kind, { voice: this.voiceId(), follow: () => ({ x: this.x, z: this.z }), speaker: this.h, key: this.h, name: 'Crackhead',
      onLine: l => gate.said(l) });
    const text = said || pick(LINES[kind]), shown = said || Voices.textFor(text);   // (recorded take's wording when there is one)
    this.bubble.textContent = shown; this.bubble.className = angry ? 'angry' : '';
    this.bubbleT = said ? 0 : Math.min(6, 2.2 + shown.length * 0.045);   // (said through sayLine: its caption is over his head)
    const d = Math.hypot(this.x - player.x, this.z - player.z);
    if (!said && d < 22) { subtitle('Crackhead: "' + text + '"', 3.2, false); sfx.say(text, { pitch: rnd(0.55, 0.85), rate: angry ? 1.2 : 1.0, x: this.x, z: this.z, range: 22 }); }
    if (!said) gate.said(null, this.bubbleT);          // (no line handle without the service: his bubble's time, then a beat)
  }
  /** each frame (src/speech.js createLineGate): a line he held back is said once he's free, if it still fits */
  speakTick(dt) {
    const q = this.gate?.tick(dt);
    if (q && q[2] === this.state && this.state !== 'gone' && this.state !== 'down') this.say(q[0], q[1]);
  }
  /** the voice he talks in (the AI layer's pick, so his shouting and a conversation with him match), kept for good */
  voiceId() {
    return this._voice ||= Reactions.voiceOf?.(this) || Reactions.fallbackVoice('ch_aggro', Math.round(this.home.x) + ',' + Math.round(this.home.z), false);
  }
  get dist() { return Math.hypot(this.x - player.x, this.z - player.z); }
  move(tx, tz, speed, dt) {
    let dx = tx - this.x, dz = tz - this.z; const d = Math.hypot(dx, dz);
    if (d < 0.05) { this.speed = 0; return; }
    dx /= d; dz /= d;
    if (this.stuck > 0) { this.stuck -= dt; const s = this.side; [dx, dz] = [dx * 0.3 + dz * s, dz * 0.3 - dx * s]; }
    const step = Math.min(d, speed * dt);
    const ox = this.x, oz = this.z;
    const p = { x: this.x + dx * step, z: this.z + dz * step };
    world.col.resolve(p, 0.35);
    if (!LY.walkable(p.x, p.z)) { p.x = ox; p.z = oz; }
    const moved = Math.hypot(p.x - ox, p.z - oz);
    // blocked by a wall, or by someone in the way (src/bodies.js holds him off them: he isn't getting anywhere):
    // he steps round for a moment
    this.blockT = step > 0 && (this.av || 0) < 0.3 * speed ? (this.blockT || 0) + dt : 0;
    if ((moved < step * 0.3 || this.blockT > 0.35) && this.stuck <= 0) { this.stuck = 0.9; this.blockT = 0; this.side = Math.random() < 0.5 ? 1 : -1; }
    this.x = p.x; this.z = p.z;
    this.speed = moved / dt;
    const th = Math.atan2(dx, dz);
    let dh = th - this.heading; while (dh > Math.PI) dh -= 6.283; while (dh < -Math.PI) dh += 6.283;
    this.heading += dh * Math.min(1, dt * 8);
  }
  hit(dmg, fromX, fromZ, byPlayer = true) {
    if (this.state === 'down' || this.state === 'gone') return;
    this.hp -= dmg;
    const d = Math.hypot(this.x - fromX, this.z - fromZ) || 1;
    this.kx = (this.x - fromX) / d * 5; this.kz = (this.z - fromZ) / d * 5;
    this.h.hurtT = 0.35; this.windup = 0; this.h.windup = 0;
    peds.scare(this.x, this.z, 18);
    if (this.hp <= 0) {
      // (down 1-1.5 s, then up - src/combat.js GETUP - and off; it was 8-12 s flat out, then straight to his feet, then 3-4.5 s)
      this.state = 'down'; this.t = rnd(1, 1.5); this.upT = 0; this.say(dmg >= 60 ? 'hit' : 'down'); if (byPlayer) player.cred++;   // (a car: a cry of pain)
      if (Math.random() < 0.5) setTimeout(() => subtitle(pick(['Passer-by: "Good on ya, mate!"', 'Passer-by: "Someone call the cops!"', 'Passer-by: "Mate, you right?"'])), 1800);
    } else {
      if (Math.random() < 0.5) this.say('hit', true);
      this.state = 'aggro'; this.stagger = 0.4;
    }
  }
  update(dt) {
    const d = this.dist;
    if (d > 260 && (this.state === 'loiter' || this.state === 'gone')) { // far away: frozen and hidden
      this.h.root.visible = false;
      if (SLEEP_RIGS && d > 280 && !this.h.rag) this.h.sleep();      // (iPhones: his body put away out here, people.js Human.sleep)
      if (this.state === 'gone') { this.respawn -= dt; if (this.respawn < 0 && unseenAt(this.home.x, this.home.z)) { this.state = 'loiter'; this.hp = 70; this.x = this.home.x; this.z = this.home.z; } }
      return;
    }
    if (this.h.asleep) this.h.wake();                                 // (back in range: his body again)
    this.cool -= dt; this.swingCd -= dt; this.lineT -= dt; this.calmT -= dt;
    this.speakTick(dt);
    // his legs go by how far he really got (forwards) since the last frame: walking into someone he stands (src/bodies.js
    // holds him off them), not treading on the spot; shoved or knocked back he doesn't run forwards either
    { const fx = Math.sin(this.heading), fz = Math.cos(this.heading);
      const mv = this.lx === undefined ? 0 : (this.x - this.lx) * fx + (this.z - this.lz) * fz, v = dt > 0 && mv > 0 && mv < 3 ? mv / dt : 0;
      this.av = (this.av || 0) + (v - (this.av || 0)) * (dt > 0 ? 1 - Math.exp(-dt / (v > (this.av || 0) ? 0.03 : 0.1)) : 0);
      this.lx = this.x; this.lz = this.z; }
    this.x += this.kx * dt; this.z += this.kz * dt; this.kx *= Math.pow(0.02, dt); this.kz *= Math.pow(0.02, dt);
    { const p = { x: this.x, z: this.z }; world.col.resolve(p, 0.35);
      if (LY.isWater(p.x, p.z) && !LY.isWater(this.lx, this.lz)) { this.x = this.lx; this.z = this.lz; this.kx = this.kz = 0; }   // (shoved: never off dry ground into a pond / the lagoon)
      else if (LY.walkable(p.x, p.z)) { this.x = p.x; this.z = p.z; } }
    let pose = 'walk';
    if (player.driving && (this.state === 'beg' || this.state === 'aggro')) { this.state = 'loiter'; this.cool = 10; }
    if (this.ctrl) {                  // aggro: src/combat.js fights him (footwork, blows, blocks, reactions); the lines stay his
      if (this.lineT < 0 && d < 25) { this.say(player.riding ? 'scooter' : 'aggro', true); this.lineT = rnd(4, 6); }
      return;
    }
    let active = 0;
    for (const c of crackheads) if (c !== this && (c.state === 'beg' || c.state === 'aggro')) active++;
    switch (this.state) {
      case 'gone':
        this.respawn -= dt;
        // (back at his spot: never where you can see him turn up - src/sight.js)
        if (this.respawn < 0 && d > 60 && unseenAt(this.home.x, this.home.z)) { this.state = 'loiter'; this.hp = 70; this.x = this.home.x; this.z = this.home.z; this.h.root.visible = true; }
        return;
      case 'loiter': {
        if (this.talkTo) { this.speed = 0; this.faceplayer(dt * 0.5); break; }   // you're talking to him (src/cityai.js): he stands, faces you
        this.wander.t -= dt;
        if (this.wander.t < 0) { this.wander = { x: this.home.x + rnd(-5, 5), z: this.home.z + rnd(-5, 5), t: rnd(2, 6) }; }
        this.move(this.wander.x, this.wander.z, 1.1, dt);
        if (this.lineT < 0 && d < 14 && Math.random() < dt * 0.3) { this.say('mutter'); this.lineT = 8; }
        if (d < 17 && this.cool < 0 && this.calmT < 0 && active < 2 && player.hp > 0 && !player.driving && !globalThis.__newPlayer?.shielded?.()) {   // (new-player grace: src/newplayer.js)
          if (Math.random() < dt * 0.6) {
            this.state = player.riding && Math.random() < 0.5 ? 'aggro' : 'beg'; this.t = rnd(9, 15);
            this.say(this.state === 'aggro' ? 'scooter' : 'beg', this.state === 'aggro'); this.lineT = 4;
          }
        }
        break;
      }
      case 'beg': {
        this.t -= dt;
        if (this.talkTo) { this.t = Math.max(this.t, 2); this.lineT = Math.max(this.lineT, 1.5); }   // (talking with you: no begging over it)
        if (d > 2) this.move(player.x, player.z, player.riding ? 4.5 : 3.6, dt); else { this.speed = 0; this.faceplayer(dt); }
        if (this.lineT < 0) { this.say('beg'); this.lineT = rnd(3.5, 5); }
        if (this.t < 0 || (d > 14 && Math.random() < dt * 0.5)) {
          if (Math.random() < 0.65) { this.state = 'aggro'; this.say(player.riding ? 'scooter' : 'aggro', true); this.lineT = 4; }
          else { this.state = 'loiter'; this.cool = 20; }
        }
        if (d > 45) { this.state = 'loiter'; this.cool = 15; }
        break;
      }
      case 'aggro': {
        if (this.stagger > 0) { this.stagger -= dt; pose = 'walk'; break; }
        if (this.windup > 0) {
          this.windup -= dt; this.h.windup = this.windup; this.faceplayer(dt); this.speed = 0;
          if (this.windup <= 0) this.strike();
          break;
        }
        if (d > 1.15) this.move(player.x, player.z, player.riding ? 6.4 : 5.9, dt); else { this.speed = 0; this.faceplayer(dt); }
        if (this.lineT < 0 && d < 25) { this.say(player.riding ? 'scooter' : 'aggro', true); this.lineT = rnd(4, 6); }
        if (d < 1.7 && this.swingCd < 0 && player.down <= 0) { this.windup = 0.45; }
        if (d > 45) { this.lostT += dt; if (this.lostT > 4) { this.say('lost', true); this.state = 'loiter'; this.cool = 25; this.lostT = 0; } }
        else this.lostT = 0;
        if (player.hp <= 0) { this.state = 'loiter'; this.cool = 30; }
        break;
      }
      case 'down': {
        this.t -= dt; pose = 'down'; this.speed = 0;
        if (this.t < 0 && !this.upT) this.upT = this.h.move('GetUp', { mask: 'full', fin: 0.1, from: GETUP.from, speed: GETUP.speed }).dur || 1e-3;
        if (this.upT > 0) {                    // getting up (on the ground to clip time 1.2 s), then he legs it
          this.upT = Math.max(0, this.upT - dt);
          if (GETUP.clipT(-this.t) >= 1.2) pose = 'walk';           // (-t: how long since he started up)
          if (this.upT <= 0) { this.state = 'flee'; this.t = 12; }
        }
        break;
      }
      case 'flee': {
        this.t -= dt;
        const ax = this.x - player.x, az = this.z - player.z, l = Math.hypot(ax, az) || 1;
        this.move(this.x + ax / l * 10, this.z + az / l * 10, 4.5, dt);
        // (gone once out of sight: he runs on while you can still see him)
        if ((this.t < 0 || d > 70) && unseenAt(this.x, this.z)) { this.state = 'gone'; this.h.root.visible = false; this.respawn = rnd(60, 120); }
        break;
      }
      case 'calm': {
        this.t -= dt;
        const ax = this.x - player.x, az = this.z - player.z, l = Math.hypot(ax, az) || 1;
        this.move(this.x + ax / l * 10, this.z + az / l * 10, 1.4, dt);
        if (this.t < 0) { this.state = 'loiter'; this.calmT = 120; }
        break;
      }
    }
    const far = d > 200;
    this.h.root.visible = !far && this.state !== 'gone';
    this.h.setPos(this.x, LY.groundY(this.x, this.z), this.z, this.heading);
    if (!far) this.h.update(dt, pose === 'down' ? 0 : this.av, pose);
    if (this.state !== 'windup') this.h.windup = this.windup;
  }
  faceplayer(dt) {
    const th = Math.atan2(player.x - this.x, player.z - this.z);
    let dh = th - this.heading; while (dh > Math.PI) dh -= 6.283; while (dh < -Math.PI) dh += 6.283;
    this.heading += dh * Math.min(1, dt * 10);
  }
  strike() {
    this.h.punch(1); this.swingCd = rnd(1.0, 1.6); sfx.whoosh();
    const d = this.dist;
    const fx = Math.sin(this.heading), fz = Math.cos(this.heading);
    const dot = ((player.x - this.x) * fx + (player.z - this.z) * fz) / (d || 1);
    if (d < 1.9 && dot > 0.5 && player.dodgeT <= 0 && Math.abs(player.y - LY.groundY(this.x, this.z)) < 1.2) {   // (not up on a deck over him: f0025)
      const dmg = this.bottle ? rnd(14, 20) : rnd(8, 13);
      hurtPlayer(dmg, this.x, this.z, player.riding && Math.random() < 0.55 ? 'knockoff' : null);
      if (player.money >= 5 && Math.random() < 0.3 && !globalThis.__newPlayer?.shielded?.()) {   // (new-player grace: src/newplayer.js)
        const n = Math.min(player.money, Math.floor(rnd(5, 12)));
        player.money -= n; setTimeout(() => subtitle(`He nicked $${n} out of your pocket!`), 400);
      }
    }
  }
}

// ------------------------------------------------------------------ player damage
// by = 'police' for QPS / SERT / POLAIR damage: a police takedown at 0 hp is an arrest, anything else is a knockout
function hurtPlayer(dmg, fx, fz, extra, by) {
  if (player.hp <= 0) return;
  if (combat && !extra && by !== 'police') { dmg = combat.absorb(dmg, fx, fz); if (!(dmg > 0)) return; }   // on the guard (src/combat.js)
  // f0035: sat in a vehicle, nothing knocks you flat / ragdolls your body out on the road (the car takes the shove)
  if (player.driving && (extra === 'car' || extra === 'knockoff')) extra = 'seated';
  player.hp = Math.max(0, player.hp - dmg); player.hurtT = 0;
  if (extra === 'seated') { cam.shake = Math.min(1, cam.shake + 0.2 + dmg / 25); sfx.hurt(); if (player.hp <= 0) die(); return; }
  const d = Math.hypot(player.x - fx, player.z - fz) || 1;
  player.kx += (player.x - fx) / d * (extra === 'car' ? 9 : 3.5); player.kz += (player.z - fz) / d * (extra === 'car' ? 9 : 3.5);
  cam.shake = Math.min(1, cam.shake + dmg / 25);
  hud.vignette.style.boxShadow = 'inset 0 0 180px 70px rgba(200,0,0,.55)';
  setTimeout(() => hud.vignette.style.boxShadow = 'inset 0 0 180px 60px rgba(200,0,0,0)', 250);
  pHuman.hurtT = 0.35;
  sfx.hurt();
  if (extra === 'knockoff' || extra === 'car') {
    const rv = player.riding ? player.riding.v : 0, rh = player.heading;
    if (player.riding) dismount(true); player.down = extra === 'car' ? 1.0 : 0.7; if (extra === 'car') player.vy = 4;   // (+ the get-up, updatePlayer; car was 1.3)
    // src/ragdoll.js: cleaned up by a car (its mass / speed / front), or thrown over the bars at the bike's speed
    if (extra === 'car') Ragdolls.hit(pHuman, player, carHit ? { car: carHit, y: true } : { vx: (player.x - fx) / d * 8, vz: (player.z - fz) / d * 8, y: true });
    else if (rv > 1.5) Ragdolls.hit(pHuman, player, { self: true, vx: Math.sin(rh) * rv, vz: Math.cos(rh) * rv, y: true });
  }
  if (player.hp <= 0) {
    // wanted by the cops: they take you down and you're arrested (GTA style); otherwise you got rolled
    if (by === 'police' && crime && crime.S.wanted > 0 && !crime.S.busted) {
      player.down = 99;
      if (player.riding) dismount(true);
      crime.bust(pick(['The QPS took you down.', 'You went down in a hail of QPS lead.', 'Tased, cuffed and stuffed in the back of a paddy wagon.']));
    } else die();
  }
}
function die() {
  player.down = 99;
  if (player.riding) dismount(true);
  if (player.driving) {   // the car stays where it is: its own footprint, at its level (a deck), as a collider
    const car = player.driving, cy = car.y || 0, box = world.col.addPoly(footprintRing(car), cy + 1.5, cy - 0.5);
    if (box && car.onDeck) box.deck = 1;
    crime.S.abandoned.push({ ...car, box, t: 0 }); player.driving = null;
    lightsOff(car.mesh, 'abandoned');
  }
  setTimeout(() => {
    crime?.clearWanted();
    showOverlay('You got rolled in the CBD.', `You made it through ${player.done} of ${STOPS.length} stops, fought off ${player.cred} crackhead${player.cred === 1 ? '' : 's'}, and you've got $${player.money.toFixed(2)} left.`, 'Wake up out the front of City Hall', () => respawn());
  }, 1500);
}
function respawn(msg) {
  if (player.riding) dismount(false);
  abortLimeStep();
  if (player.driving) { const car = player.driving; if (online?.active) crime.leaveWheel(); else { player.driving = null; disposeVehicle(car.mesh); } }   // (online: the room's car stays the room's; RESPAWN below takes us out of it there)
  Object.assign(player, { x: SPAWN.x, z: SPAWN.z, y: LY.groundY(SPAWN.x, SPAWN.z) + 0.02, vy: 0, hp: 100, down: 0, kx: 0, kz: 0, vx: 0, vz: 0, heading: SPAWN.heading, stepY: 0, stepV: 0, deckRoad: null, vault: null, upT: 0 });
  cam.yaw = SPAWN.heading; cam.pitch = 0.12; cam.x = player.x - Math.sin(SPAWN.heading) * 5; cam.z = player.z - Math.cos(SPAWN.heading) * 5; cam.y = player.y + 2;
  online?.respawn();   // (online: the room puts the body back out the front too, out of any car)
  for (const c of crackheads) if (c.state === 'aggro' || c.state === 'beg') { c.state = 'loiter'; c.cool = 30; }
  pHuman.root.visible = true;
  npcAI?.onRespawn?.();       // what the NPCs were about to say belongs to the scene you left (src/npcai.js)
  npcLife?.reset('respawned');                // and what they were doing for you (showing you the way) is over
  combat?.reset('respawn');   // every fight is over (src/combat.js)
  if (crime) crime.S.busted = false;   // only the BUSTED overlay's button cleared it: any other way here left crime() dead for the session
  eshays?.onRespawn();
  water?.reset();             // out of the water, off the jet ski, the sharks gone (src/water/index.js)
  ferry?.reset();             // off any CityCat (src/ferry/index.js)
  subtitle(msg || 'Patched up at the RBWH and dropped off out the front of City Hall.'); lockPointer();
}

// ------------------------------------------------------------------ Lime
const UNLOCK = 1.0, PER_MIN = 0.48;
// Where you're riding, from the OSM surface (the Mall, South Bank, a footpath / shared path, the road): the HUD shows
// it. It no longer caps a Lime's speed (the real rules are 12 km/h on footpaths, 10 at South Bank, 25 on the road and
// none in the Mall; the user asked for the limit to go). rideZoneLabel: the name without the old limits.
function rideZone(x, z) { return W.zoneAt(x, z); }
const rideZoneLabel = z => (z.cls === 'noride' ? 'QUEEN ST MALL' : z.cls === 'slow' ? 'SOUTH BANK' : z.name.replace(/ · .*$/, ''));
function nearestScooter(r = 2) {
  let best = null, bd = r;
  for (const s of scooters) {
    if (s === player.riding || s.__knock?.body) continue;          // (one a car just sent flying can't be unlocked mid-air)
    const d = Math.hypot(s.x - player.x, s.z - player.z); if (d < bd) { bd = d; best = s; }
  }
  return best;
}
function mount(sc) {
  if (player.money < UNLOCK + PER_MIN) { sfx.limeDenied(); subtitle('Lyme: "Payment declined." You need at least $1.48.'); return; }
  if (sc.battery < 5) { sfx.limeDenied(); subtitle('Lyme: this scooter is out of battery.'); return; }
  player.riding = sc; sc.v = 0; player.rideT = 0; player.fare = UNLOCK; player.money -= UNLOCK;
  sfx.limeUnlock(); sfx.say('Ride started. Please ride safely.', { pitch: 1.25, rate: 1.05, vol: 0.8, female: true });
  helmet?.onRideStart();   // (no helmet on: where it is, the H key, once)
  sc.root.userData.stand.visible = false;
  sc.root.visible = true;
  // step on from where you're standing (the ride module glides the player onto it); fallback: pop straight on
  if (limeRide.available() && limeRide.attach(sc, pHuman, player, true)) return;
  player.x = sc.x; player.z = sc.z; player.heading = sc.ry;
}
// crash / respawn / teleport: off at once. animate (E, slow enough): the rider steps off and parks it (src/limeride.js)
function dismount(crash = false, animate = false) {
  const sc = player.riding; if (!sc) return;
  wheelie.end();                    // (off mid-wheelie: level again at once)
  crime?.drift?.bikeEnd();          // (and mid-skid)
  if (sc.ebike) { player.riding = null; delivery.dismount(sc, crash); return; }   // stolen delivery e-bike: no fare, it parks
  const mins = Math.ceil(player.rideT / 60);
  const perMin = mins * PER_MIN;
  player.money = Math.max(0, player.money - perMin);
  player.fare += perMin;
  subtitle(`Lyme ride ended · ${mins} min · $${player.fare.toFixed(2)}${crash ? ' · you stacked it!' : ''}`);
  helmet?.onRideEnd();     // the helmet goes back on the Lime's bars
  if (crash) { sc.fallen = true; sfx.crash(); } else sfx.coin();
  player.riding = null;
  if (animate && !crash && limeRide.active && limeRide.sc === sc && limeRide.beginDismount()) return;
  if (limeRide.active) limeRide.detach(pHuman);
  sc.v = 0; sc.lean = 0;
  placeScooter(sc);
}

// ------------------------------------------------------------------ police (Triple Zero)
// P / the 000 button: the call goes to src/crime.js call000 - a real unit is dispatched out of sight on the shortest
// drive, comes with the lights and siren, pulls up at the kerb nearest you, stays on the job ~25 s and drives off
// (police response pass, 2026-10-10: it used to be a car put down 7 m from you after 16 s, in plain view, and a second
// call within 2 minutes got "already on the way" with nothing coming). `police` is the call being answered (null: none):
// { arrived, mesh, unit, done } - src/eshays.js and the minimap read it.
let police = null, policeCd = 0;
function call000() {
  if (police && !police.done) { subtitle('Triple Zero: "Police are already on the way."'); return; }
  if (policeCd > 0) { subtitle('Triple Zero: "We\'ve just had a car out to you - call again if you need us."'); return; }
  subtitle('Triple Zero: "Police. What\'s your emergency?" — "There\'s a bloke trying to bash me!"', 4);
  police = crime.call000('help');
  setTimeout(() => { if (police && !police.done && !police.arrived) subtitle('Triple Zero: "A car\'s on its way to you now. Stay where it\'s safe."', 3); }, 4500);
}
// (crime.js calls this when the responder pulls up: ctx.onCallArrived)
function policeArrived() {
  subtitle('QPS: "Righto, what\'s going on here?"');
  for (const c of crackheads) if (c.state !== 'gone' && c.dist < 90 && c.state !== 'down') { c.state = 'flee'; c.t = 14; if (c.dist < 40) c.say('cops', true); }
}
function updatePolice(dt) {
  policeCd -= dt;
  if (police?.done) { police = null; policeCd = 15; }      // (a short pause before the next call: no prank-dialling a fleet)
  return 0;                                                // (the responder's siren is crime.js's: S.sirenLevel)
}

// ------------------------------------------------------------------ tourist stops (real places from OpenStreetMap)
const STOPS = [];
player.done = 0;
function buildStops() {
  STOPS.length = 0;
  const snap = (x, z, r = 25) => W.snapWalkable(x, z, r, {}) || { x, z };
  const add = (text, p, r = 14, extra = {}) => { if (p && Number.isFinite(p.x)) { const s = snap(p.x, p.z); STOPS.push({ text, x: s.x, z: s.z, r, ...extra }); } };
  const lm = name => world.landmarks.find(l => l.name === name) || null;
  const mall = W.place('Queen Street Mall');
  add('Head down to the Queen Street Mall', mall, 18);
  // the Lime nearest the Mall
  if (mall && scooters.length) {
    const sc = scooters.filter(s => !s.fallen).sort((a, b) => Math.hypot(a.x - mall.x, a.z - mall.z) - Math.hypot(b.x - mall.x, b.z - mall.z))[0];
    if (sc) STOPS.push({ text: 'Unlock a Lyme near the Mall (E)', x: sc.x, z: sc.z, r: 3, check: () => player.riding });
  }
  add('Ride across Victoria Bridge to South Bank', W.place('Victoria Bridge Abutment') || W.place('Victoria Bridge'), 22);
  add('Get a photo at the BRISBANE sign by the Wheel', lm('BRISBANE sign') || W.place('Wheel of Brisbane'), 12);
  add('Cool off at Streets Beach', W.place('Streets Beach'), 24);
  add('Head over the river to the City Botanic Gardens', W.place('City Botanic Gardens'), 30);
  { const [x, z] = W.latLonToXZ(-27.4668801, 153.0313428); add('Follow the Riverwalk to Eagle St Pier (Riverside)', { x, z }, 22); }
  add('Visit the eternal flame at Anzac Square', world.eternalFlame || W.pointsOf('memorial').find(p => /shrine of remembrance/i.test(p.name || '')) || W.place('Anzac Square'), 10);
  add('Walk up to Central Station on Ann St', W.place('Brisbane Central') && W.place('Brisbane Central').x > -500 ? W.place('Brisbane Central') : W.place('Central Station'), 16);
  add('Find the Old Windmill on Wickham Terrace', W.place('The Old Windmill'), 16);
  STOPS.push({ text: 'Head home to City Hall in King George Square', x: SPAWN.x, z: SPAWN.z, r: 12 });
}
function updateStops() {
  const m = STOPS[player.done];
  if (missions?.active) return m;
  if (!m) { setText(hud.objText, 'Free roam — survive the CBD'); setText(hud.objDist, `Crackheads fought off: ${player.cred}`); return null; }
  const d = Math.hypot(m.x - player.x, m.z - player.z);
  const ok = m.check ? m.check() : d < m.r;
  if (ok) {
    player.done++; player.money += 10; sfx.objective(); toast('✓ ' + m.text + '\n+$10');
    return updateStops();
  }
  setText(hud.objText, m.text);
  const dir = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((Math.atan2(m.x - player.x, -(m.z - player.z)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
  setText(hud.objDist, `${Math.round(d)} m ${dir}`);
  return m;
}

// ------------------------------------------------------------------ input
addEventListener('keydown', e => {
  if (online?.typing) return;   // (the room chat's line has the keyboard: src/multiplayer/online.js)
  if (e.code === 'Enter' && online?.active && !e.repeat && !chars26?.kebabMenu?.isOpen) { online.openChat(); e.preventDefault(); return; }
  if (!started) return;
  if (chars26?.kebabMenu?.isOpen) { for (const k in keys) keys[k] = false; return; }   // (ordering at the kebab shop: src/kebabmenu.js has the keys)
  if (e.code === 'F7' && !e.repeat && colView) { colView.toggle(); e.preventDefault(); return; }   // F7: the contact debug view (src/colview.js)
  if (e.code === 'KeyV' && !e.repeat && !npcAI?.typing && npcAI?.pushToTalk(true)) { e.preventDefault(); return; }   // hold V: say it out loud (turn to aim it)
  if (e.code === 'KeyL' && !e.repeat && !npcAI?.typing && npcAI) { npcAI.openMic(); e.preventDefault(); return; }       // L: the open mic on / off
  if (npcAI?.typing) return;                     // typing a line to an AI NPC (src/npcai.js)
  // the weapon wheel (src/weapons.js): hold Tab, the mouse or the arrows choose, let go to equip
  if (e.code === 'Tab' && weapons) { e.preventDefault(); if (!e.repeat && !player.driving && !player.riding) weapons.wheel.show(true); return; }
  if (weapons?.wheel.open && weapons.wheel.key(e.code)) { e.preventDefault(); return; }
  if (e.code === 'Backquote') { if (!e.repeat) togglePov(); e.preventDefault(); return; }   // ` : first-person view on / off (POV, below)
  if (e.code === 'KeyT' && !e.repeat && (chars26?.talk() || npcAI?.talk())) { for (const k in keys) keys[k] = false; e.preventDefault(); return; }
  keys[e.code] = true;
  if (player.driving && !e.repeat && radio?.key(e.code, e.shiftKey)) return;   // 1-5 tune, R next station, Shift+R off/on
  if (e.code === 'KeyB' && !e.repeat) busjack?.toggleDoors();
  if (e.code === 'KeyH' && !e.repeat && !player.driving && !ferry?.hornKey()) helmet?.toggle();   // the Lime helmet (in a car / at a CityCat's helm H is the horn)
  if (e.code === 'KeyE') interact();
  if (e.code === 'KeyF' && !e.repeat) punch();     // (held: a haymaker wind-up, src/combat.js)
  // driving: Z / X the left / right indicator (again to cancel; they cancel themselves after the turn: crime.js)
  if (player.driving && !e.repeat && (e.code === 'KeyZ' || e.code === 'KeyX')) player.driving.indPress = e.code === 'KeyZ' ? 'L' : 'R';
  // Y: a stolen QPS car's lights and siren on / off (src/crime.js toggleSiren; the touch SIREN button sends Y)
  if (e.code === 'KeyY' && !e.repeat && player.driving?.police) { const on = crime?.toggleSiren(); if (on !== null && on !== undefined) toast(on ? 'Lights and siren ON' : 'Lights and siren off', 1.2); }
  if (e.code === 'KeyI' && !e.repeat) wildlife?.food?.guard();   // I: SHOO a lunging bin chicken off your food (src/wildlife/food.js)
  if (e.code === 'KeyZ' && !e.repeat) combat?.kick();
  if (e.code === 'KeyR' && !e.repeat) combat?.shove();   // (in a car R is the radio: that returned above)
  if (e.code === 'KeyQ') {                    // riding: the bell; on foot: hold for the guard (the same as RMB)
    if (player.riding) sfx.bell();
    else if (!player.driving && !e.repeat && combat) combat.block(true);
  }
  if (e.code === 'KeyG') giveMoney();
  // 1 held: wind up the weapon you hold, let go: throw / swing it (keyup below), 2: drop it (on foot; in a car the digits tune the radio, above)
  if (!e.repeat && weapons && !player.driving && $('bigmap').classList.contains('hidden')) { if (e.code === 'Digit1') weapons.use(); else if (e.code === 'Digit2') weapons.drop(); }
  if (e.code === 'KeyP') call000();
  if (e.code === 'KeyM') toggleMap();
  if (e.code === 'KeyC' && !e.repeat) cycleOutfit(pHuman, e.shiftKey ? -1 : 1);   // wardrobe: team jerseys (src/clothes.js)
  // (plain K / Shift+K are the fault reporter's: src/faults.js; ambient occlusion moved to Ctrl+Alt+K and the Esc menu)
  if (e.code === 'KeyK' && e.ctrlKey && e.altKey) { GFX.set('gtao', !gtao.enabled); gfxMenu.refresh(); toast('Ambient occlusion ' + (gtao.enabled ? 'on' : 'off (faster)')); }
  if (e.code === 'KeyN' && online?.active) { toast('Online: the room keeps the time of day.', 2); return; }   // (one sky for everyone: the room's clock)
  if (e.code === 'KeyN') { const h = (gameMinutes / 60) % 24; gameMinutes = (h > 7 && h < 16.5 ? 17.7 : h >= 16.5 && h < 19 ? 20.5 : 11) * 60; toast(h > 7 && h < 16.5 ? 'Arvo — sunset over the river' : h >= 16.5 && h < 19 ? 'Night in Brisvegas' : 'Morning'); }
  if (e.code === 'ControlLeft' || e.code === 'ControlRight') dodge();
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'Escape' || e.code === 'KeyO') { paused = !paused; toast(paused ? 'PAUSED — press Esc to resume' : '', paused ? 9999 : 0); }
});
addEventListener('keyup', e => { if (online?.typing) return; keys[e.code] = false; if (e.code === 'Tab') weapons?.wheel.release(); if (e.code === 'Digit1') weapons?.release(); if (e.code === 'KeyI') wildlife?.food?.release?.(); if (e.code === 'KeyV') npcAI?.pushToTalk(false); if (e.code === 'KeyF') combat?.release(); if (e.code === 'KeyQ') combat?.block(false); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; combat?.release(); combat?.block(false); weapons?.release(); weapons?.wheel.show(false); });
document.addEventListener('visibilitychange', () => { for (const k in keys) keys[k] = false; if (document.hidden) adaptive.reset('hidden'); });
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== canvas && started && player.hp > 0 && $('bigmap').classList.contains('hidden')) { paused = true; toast('PAUSED — click to resume', 9999); }
});
canvas.addEventListener('mousedown', e => {
  if (!started) return;
  if (chars26?.kebabMenu?.isOpen) return;                                  // (no punch while you order)
  if (paused) { paused = false; toast('', 0); lockPointer(); return; }
  if (document.pointerLockElement !== canvas) { lockPointer(); return; }
  if (e.button === 0) { if (weapons?.armed && !player.driving && !player.riding) weapons.use(); else punch(); }   // (armed: the weapon held at its wind-up, not a punch; mouseup lets it go)
  if (e.button === 2) combat?.block(true);        // hold RMB: guard up
});
addEventListener('mouseup', e => { if (e.button === 0) { combat?.release(); weapons?.release(); } if (e.button === 2) combat?.block(false); });
canvas.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mousemove', e => {
  if (document.pointerLockElement !== canvas) return;
  if (weapons?.wheel.open) { weapons.wheel.move(e.movementX, e.movementY); return; }   // (the weapon wheel: the mouse picks a slot)
  cam.yaw -= e.movementX * 0.0026;
  cam.pitch = Math.max(cam.pitchMin, Math.min(1.2, cam.pitch + e.movementY * 0.0022));
  if (e.movementX || e.movementY) cam.lookIdle = 0;   // (driving: the camera holds where you look - src/drivecam.js)
});
addEventListener('wheel', e => { if (pov.active) return; cam.dist = Math.max(2.5, Math.min(12, cam.dist + e.deltaY * 0.004)); });   // (first person: no follow camera to zoom - it would come back at a distance you never saw set)

function interact() {
  if (player.down > 0 || limeRide.busy) return;     // (mid step-on / step-off)
  const ON = !!online?.active;
  if (ON && !player.riding) {   // (online: the room's cars - E takes one in reach or gets out; then everything else E does in solo, but the local vehicles and the water)
    if (player.driving || online.seated) { online.exit(); return; }   // (at the wheel or in a passenger seat: out)
    const v = online.nearestVehicle(3.6);
    if (v) { online.enter(v); return; }
    const rider = online.nearestRider?.(2.4);
    if (rider) { online.hopOn(rider.id); return; }   // (another player's Lime / e-bike: on the back)
  }
  if (!ON && ferry?.interact()) return;      // board / climb aboard a CityCat, take its helm, step off (src/ferry/index.js)
  if (!ON && water?.interact()) return;      // climb out / onto a jet ski / off it (src/water/index.js)
  if (player.driving) { crime.exitCar(); return; }
  if (weaponFirst()) { weapons.pickUp(); return; }            // a weapon / your thong in reach, nearer than any food (src/weapons.js)
  if (!player.riding && wildlife?.food?.interact()) return;   // eat the food in your hand / pick up food (src/wildlife/food.js)
  if (!player.riding && chars26?.interact()) return;   // a kebab counter, the sausage sizzle, a rideshare driver's window
  if (ON && !player.riding && !nearestScooter(2.2) && !delivery?.nearBike?.() && crime?.nearestCar?.()) { subtitle('Online: this screen\'s own cars are not shared - take one of the room\'s (any parked car, a stopped one in the traffic, the sedans).', 2.4); return; }   // (the bikes and scooters are yours as in solo: the room moves your body as you ride)
  if (delivery?.interact()) return;   // steal / re-mount / park a delivery e-bike (src/delivery.js) — takes priority over jacking a car
  if (!player.riding && delivery) {   // a kid's e-bike (src/streetlife/riders.js takeBike): shove them off it and ride it away
    const kb = streetLife?.takeBike?.(player.x, player.z, 2.4);
    if (kb) { delivery.adoptKidBike(kb); return; }
  }
  if (!player.riding && crime?.canEnter() && !nearestScooter(1.2)) { crime.enterCar(); return; }
  if (player.riding) {
    if (player.riding.v > 1.5) { subtitle('Slow down to end your ride.'); return; }
    if (W.inMall(player.x, player.z)) { sfx.limeDenied(); subtitle('Lyme: "You can\'t end your ride in a no-parking zone."'); return; }
    dismount(false, true);
    if (!limeRide.stepping) { player.x += Math.cos(player.heading) * 0.7; player.z -= Math.sin(player.heading) * 0.7; }   // (e-bike: hop off)
    return;
  }
  if (!nearestScooter(1.2) && streetLife?.tip()) return;   // a busker in reach: $2 in the case (src/streetlife/buskers.js)
  const sc = nearestScooter(2.2);
  if (!sc) return;
  if (sc.fallen) { sc.fallen = false; sc.ry = player.heading; placeScooter(sc); subtitle('You stand the Lyme back up. Classic Brisbane.'); return; }
  mount(sc);
}
// The player's fists (src/combat.js): F / LMB starts the combo (held, it winds up a haymaker). Each blow lands on its
// clip's impact frame, where combat.js hits its own targets (fighters, crackheads, pedestrians) and calls punchOthers()
// for everyone else's. The instant punch below is only the fallback if combat.js failed to start.
// E: a weapon or your thrown thong in reach wins over food when it is the nearer one (and you're not holding food)
function weaponFirst() {
  if (!weapons?.offer || player.riding || player.driving || wildlife?.food?.carrying) return false;
  return weapons.offerD <= (wildlife?.food?.nearDist?.() ?? Infinity);
}
function punch() {
  if (water?.punch()) return;         // in the water: at a shark's nose (src/water/index.js)
  Sequences.event('fight');           // swinging at anyone ends a conversation sequence (the kebab owner: "Not in my shop!")
  if (combat) { combat.press(); return; }
  if (player.punchCd > 0 || player.down > 0 || player.riding || player.driving || limeRide.busy) return;
  player.punchCd = 0.42; pHuman.punch(); sfx.whoosh();
  const fx = Math.sin(player.heading), fz = Math.cos(player.heading);
  let hit = false;
  for (const c of crackheads) {
    if (c.state === 'gone' || c.state === 'down') continue;
    const dx = c.x - player.x, dz = c.z - player.z, d = Math.hypot(dx, dz);
    if (d < 1.9 && (dx * fx + dz * fz) / (d || 1) > 0.35) { c.hit(rnd(20, 28) + (player.speed > 3 ? 8 : 0), player.x, player.z); hit = true; npcAI?.onPunch(c); }
  }
  for (const p of peds.list) {
    const dx = p.x - player.x, dz = p.z - player.z, d = Math.hypot(dx, dz);
    if (d < 1.6 && (dx * fx + dz * fz) / (d || 1) > 0.4 && p.down <= 0) { p.down = 1; hit = true; crime?.crime('assault', 0.6); subtitle(pick(['Pedestrian: "What the hell, mate?!"', 'Pedestrian: "Oi! Are you serious?!"']), 3.2, true, null, { female: !!p.h?.look?.female, age: p.h?.look?.age }); peds.scare(p.x, p.z, 12); npcAI?.onPunch(p); }
  }
  if (punchOthers(player.x, player.z, fx, fz)) hit = true;
  if (hit) { sfx.punch(); cam.shake = Math.min(1, cam.shake + 0.25); }
}
// Other systems' melee targets, hit on the impact frame of each of the player's strikes (combat.js ctx.others): the
// player's position and facing. true when something was hit.
function punchOthers(x, z, fx, fz) {
  let hit = false;
  // eshays: punch targets (src/eshays.js punch: the lad in reach in front of you; knocked down after 2-3)
  if (eshays?.punch(fx, fz)) hit = true;
  if (crime?.punchOfficers(x, z, fx, fz)) { hit = true; subtitle('QPS: "Assaulting police! You\'re under arrest."', 2); }
  if (swat?.punch(x, z, fx, fz)) hit = true;   // SERT operators (4 hits each)
  if (streetLife?.punch(x, z, fx, fz)) hit = true;   // a Lime rider / a kid on an e-bike: off they come (src/streetlife/riders.js)
  if (calorie?.punch(x, z, fx, fz)) hit = true;      // Calories Guy: he shoves you flying (src/calorieguy.js)
  return hit;
}
function dodge() {
  if (player.dodgeCd > 0 || player.riding || player.down > 0 || limeRide.busy) return;
  player.dodgeT = 0.3; player.dodgeCd = 1.1; sfx.whoosh();
  combat?.onDodge();                          // squared up: a slip (src/combat.js)
}
function giveMoney() {
  const c = crackheads.find(c => c.state === 'beg' && c.dist < 4);
  if (!c) { if (!streetLife?.tip()) subtitle('No one around is asking for money.', 1.5); return; }   // (G by a busker: a tip)
  if (player.money < 2) { subtitle("You're broke."); return; }
  player.money -= 2; sfx.coin();
  npcAI?.onGiveMoney(c, '$2');   // they remember who helped them out (src/cityai.js)
  if (Math.random() < 0.72) { c.say('paid'); c.state = 'calm'; c.t = 8; }
  else { c.say('greedy', true); c.state = 'aggro'; }
}
function toggleMap() {
  const bm = $('bigmap');
  bm.classList.toggle('hidden');
  if (!bm.classList.contains('hidden')) drawBigMap();
}

// ------------------------------------------------------------------ player update
// The body on foot: toes ~0.17 m ahead of the centre, hands ~0.27 m to the side (idle), so 0.25 m touches walls and
// poles instead of stopping ~0.2 m short (it was 0.35).
const PLAYER_R = FOOT.r;
// the world as src/sim/foot.js sees it: the game's W / world, looked up late (they're built after this module loads)
const SIMW = {
  groundY: (x, z) => LY.groundY(x, z), walkable: (x, z) => LY.walkable(x, z), surfaceAt: (x, z) => LY.surfaceAt(x, z),
  floorY: (x, z) => (W?.floorY ? W.floorY(x, z) : NaN), inLagoon: (x, z) => W.inLagoon(x, z), inLagoonRing: (x, z) => world.inLagoonRing(x, z),
  openWater: (x, z) => !!W.openWater?.(x, z), get col() { return (online && online.col) || world.col; }, get decks() { return world.decks; },   // (online: the room's own collision, so prediction agrees with it)
};
let online = null, stepOnFoot = false, localTrafficOn = true;
const _tagV = new THREE.Vector3();   // (online name tags: projection scratch)   // (localTrafficOn: online the room's traffic is drawn instead, this screen's own is hidden)   // the online mode (src/multiplayer/online.js, loaded only when chosen); stepOnFoot: this tick was an on-foot step
const FOOT_IN = { mx: 0, mz: 0, run: false, jump: false, hold: false, speedScale: 1, face: null }, FOOT_OUT = {};
const DRIVE_IN = { throttle: false, brake: false, steerIn: 0, handbrake: false };   // (online: the wheel and the pedals this tick, as crime.js reads them)
// what the shared step asks the game: a railing or the water on a jump, a bank walked off, a bike into a wall
const FOOT_HOOKS = {
  // (online: no railings and no water - the room has neither yet, and prediction must agree with it; a bank is a wall there)
  vault: (jx, jz) => (startVault(jx, jz) ? (bodyFree = true) : false), jumpIn: (jx, jz) => (water?.jumpIn(jx, jz) ? (bodyFree = true) : false), walkOff: (ox, oz, nx, nz) => (water?.walkOff(ox, oz, nx, nz) ? (bodyFree = true) : false),   // (taken by one: this tick goes to the room as FREE - no jump of its own there)   // (online too, 2026-10-27: the room follows the body while these have it - server/room.mjs freeStep)
  wallHit: () => {
    const sc = player.riding;
    if (sc.v > 3.6) { hurtPlayer(rnd(8, 14), player.x + Math.sin(player.heading), player.z + Math.cos(player.heading), 'knockoff'); subtitle(sc.ebike ? 'You stacked the e-bike into a wall.' : 'You stacked the Lyme into a wall.'); }
    else sc.v *= 0.6;
  },
};
// (src/sim/foot.js: the same rules the online mode and the game server use)
function footWalkable(x, z) { return simFootWalkable(SIMW, x, z); }
// Up on an elevated deck on foot (out of a car on the Pacific Motorway, the Riverside Expressway or an overpass, or
// over a barrier onto one): the deck is your floor - src/osm/decks.js support(): the deck you're on while it is under
// you, else whatever is within a step - its barriers hold you in, and walking down a ramp to the street hands you back
// to the ground. player.deckRoad = that deck's way; null at street level, where the raster and groundY rule as ever.
// deckFloor().y is NaN at the open edge of a deck (treated as a wall); .road = the deck that won, null = the ground.
function deckFloor(x, z, yRef, road) { return simDeckFloor(SIMW, x, z, yRef, road); }
/** can you stand at (x, z) on foot: ground you may walk on, or (road: up on that deck) a deck surface within a step */
function standable(x, z, road) { return simStandable(SIMW, x, z, player.y, road); }
// Vaulting (Space against a railing or barrier: a bridge walkway's rail, a deck fascia, a motorway barrier): the
// barrier must be solid at knee height right in front of you and clear by VAULT.top over your feet; past it there must
// be somewhere to stand within VAULT.far - a floor (the ground you may walk on, or a deck) no more than VAULT.drop above
// or below you, with room for your body. So you can hop from a bridge's walkway onto its road deck and back, or over
// the barrier between two motorway carriageways, but never into the river or off the side of a 9 m deck.
const VAULT = { reach: 0.7, minTop: 0.35, top: 1.45, far: 1.7, drop: 0.8, dur: 0.55 };
const _vp = { x: 0, z: 0 };
let vaultHintT = 0;
function startVault(dx, dz) {
  const x = player.x, z = player.z, y = player.y, col = world.col;
  let near = -1;                                  // the barrier's near face
  for (let d = PLAYER_R; d <= VAULT.reach + 1e-6; d += 0.05) if (col.pointBlocked(x + dx * d, y + 0.5, z + dz * d)) { near = d; break; }
  if (near < 0) return false;
  const bx = x + dx * (near + 0.08), bz = z + dz * (near + 0.08);
  let top = -1;                                   // its top: the first height clear of it
  for (let h = VAULT.minTop; h <= VAULT.top + 1e-6; h += 0.05) if (!col.pointBlocked(bx, y + h, bz)) { top = y + h; break; }
  if (top < 0) return false;                      // a wall, not a railing
  for (let c = near + PLAYER_R + 0.12; c <= near + VAULT.far + 1e-6; c += 0.1) {
    const lx = x + dx * c, lz = z + dz * c;
    const f = deckFloor(lx, lz, y, null), ly = f.y, road = f.road;
    if (!(ly === ly) || Math.abs(ly - y) > VAULT.drop || (!road && !footWalkable(lx, lz))) continue;
    if (!road && W.openWater?.(lx, lz)) continue;  // (a raster sliver over the river past a railing: that's the river - dropOver)
    // and floor on past it too: the 1 m raster runs a walkway cell up to half a metre past a bridge's river railing,
    // a sliver of "ground" over the water you must not be put down on
    const ax = lx + dx * 0.5, az = lz + dz * 0.5, g = deckFloor(ax, az, ly, road);
    if (!(g.y === g.y) || Math.abs(g.y - ly) > 0.3 || (!g.road && !footWalkable(ax, az))) continue;
    if (col.pointBlocked(lx, ly + 0.5, lz) || col.pointBlocked(lx, ly + 1.2, lz)) continue;
    _vp.x = lx; _vp.z = lz;
    col.resolve(_vp, PLAYER_R, ly, 1.7, road);
    if (Math.abs(_vp.x - lx) + Math.abs(_vp.z - lz) > 0.06) continue;   // no room to stand there
    const dur = VAULT.dur * Math.max(0.8, Math.min(1.3, c / 1.2));
    player.vault = { t: 0, dur, x0: x, z0: z, y0: y, x1: lx, z1: lz, y1: ly, road, f: Math.min(0.8, (near + 0.15) / c), top: top + 0.06,
      v: Math.max(3, player.speed) };
    player.vx = player.vz = 0; player.kx = player.kz = 0; player.vy = 0; player.stepY = player.stepV = 0;
    player.heading = Math.atan2(dx, dz);
    sfx.whoosh();
    return true;
  }
  // nothing within a step past it, but a drop: a deck's parapet, a bridge's railing - over you go and down to whatever is
  // below (map faults f0025 / f0029: you couldn't jump off the expressway)
  if (dropOver(x, z, y, dx, dz, near, top)) return true;
  // (on a bridge or a deck, a railing you can't go over: say why, now and then. Elsewhere it's just a jump)
  if (vaultHintT <= 0 && (player.deckRoad || W.onBridge(x, z))) { vaultHintT = 4; subtitle('Nothing to land on over that side.', 1.6); }
  return false;
}
// Over the edge (startVault, when there's no floor within a step past the barrier): a hop onto the barrier's top and off
// the far side into a fall (src/water/index.js dropOff: into the river, or onto the ground below - or a lower deck -
// with the hard-landing damage of any fall). Only where the floor past it is at least DROP.min under you, there's room
// past the barrier, and where you'd come down is water, ground you can walk away from, or a deck.
const DROP = { min: 1.6, out: [0.35, 0.7], v: [3.2, 2.2, 4.4], vy: 1.5, dur: 0.45 };
function dropOver(x, z, y, dx, dz, near, top) {
  if (!water?.dropOff || player.riding || player.driving) return false;
  const col = world.col, DK = world.decks;
  for (const o of DROP.out) {
    const c = near + 0.35 + o, lx = x + dx * c, lz = z + dz * c;      // just past the barrier's far face
    if (col.pointBlocked(lx, top + 0.3, lz) || col.pointBlocked(lx, top + 1.3, lz)) continue;   // (a wall there, not air)
    const g = LY.groundY(lx, lz), dk = DK ? DK.topBelow(lx, lz, top) : -Infinity;
    if (dk > y - 0.6) continue;                                   // (still over the deck you're on)
    const floor = dk > g ? dk : g, wet = !(dk > g) && !!W.openWater?.(lx, lz);
    if (y - floor < DROP.min && !wet) continue;                   // (a step down: the vault above, or a jump; the river: any height, f0029)
    for (const v of DROP.v) {
      // where you'd come down from the barrier's top at v m/s out and DROP.vy up
      const h = top + 0.1 - floor, t = (DROP.vy + Math.sqrt(DROP.vy * DROP.vy + 26 * h)) / 13;
      const ex = lx + dx * v * t, ez = lz + dz * v * t;
      const eg = LY.groundY(ex, ez), ed = DK ? DK.topBelow(ex, ez, top) : -Infinity;
      const ok = (ed > eg && ed < y - 0.6) || LY.surfaceAt(ex, ez) === 1 || !!W.openWater?.(ex, ez) || footWalkable(ex, ez);
      if (!ok || col.pointBlocked(ex, (ed > eg ? ed : eg) + 1.0, ez)) continue;
      player.vault = { t: 0, dur: DROP.dur, x0: x, z0: z, y0: y, x1: lx, z1: lz, y1: top + 0.1, road: null, f: Math.min(0.8, (near + 0.15) / c), top: top + 0.1,
        v: 0, drop: { vx: dx * v, vz: dz * v, vy: DROP.vy } };
      player.vx = player.vz = 0; player.kx = player.kz = 0; player.vy = 0; player.stepY = player.stepV = 0;
      player.heading = Math.atan2(dx, dz);
      sfx.whoosh();
      return true;
    }
  }
  return false;
}
// the hop itself: along a straight line to the landing spot, feet over the barrier's top at the moment you pass it
function stepVault(dt) {
  const V = player.vault;
  V.t += dt;
  const s = Math.min(1, V.t / V.dur), e = s * s * (3 - 2 * s);
  const base = V.y0 + (V.y1 - V.y0) * V.f;
  const hump = Math.max(0.2, (V.top - base) / Math.sin(Math.PI * V.f));
  player.x = V.x0 + (V.x1 - V.x0) * e; player.z = V.z0 + (V.z1 - V.z0) * e;
  player.y = V.y0 + (V.y1 - V.y0) * e + hump * Math.sin(Math.PI * e);
  player.speed = 0;
  if (s < 1) return;
  if (V.drop) {                           // (dropOver: on the barrier's top - and off it, down to whatever is below)
    player.vault = null; player.deckRoad = null; player.y = V.y1; player.grounded = false;
    if (!water.dropOff(V.drop.vx, V.drop.vz, V.drop.vy)) { player.vy = V.drop.vy; player.vx = V.drop.vx; player.vz = V.drop.vz; }
    return;
  }
  player.vault = null; player.deckRoad = V.road;
  player.y = V.y1; player.vy = 0; player.grounded = true;
  player.vx = Math.sin(player.heading) * V.v; player.vz = Math.cos(player.heading) * V.v; player.speed = V.v;   // (and on you go)
}
const PLAYER_UP = { from: 0.6, speed: 1.6, hold: 0.55 };   // GetUp clip time 0.6 (sat up) .. 1.5 (on your feet) in 0.55 s
let bodyFree = false;   // (this tick the vault / the ferry / the water code had the body: online it goes to the room as a FREE tick)
function updatePlayer(dt) {
  stepOnFoot = false; bodyFree = false;
  player.punchCd -= dt; player.dodgeCd -= dt; player.dodgeT -= dt; player.hurtT += dt;
  if (player.hurtT > 6 && player.hp > 0) player.hp = Math.min(100, player.hp + dt * 1.5);
  const fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), str = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  if (keys.ArrowLeft) cam.yaw += dt * 2; if (keys.ArrowRight) cam.yaw -= dt * 2;
  if (online?.active) online.preStep();   // (the room's newest answer for me, once a step: src/multiplayer/online.js)
  if (player.driving) { DRIVE_IN.throttle = !!(keys.KeyW || keys.ArrowUp); DRIVE_IN.brake = !!(keys.KeyS || keys.ArrowDown); DRIVE_IN.steerIn = (keys.KeyA ? 1 : 0) - (keys.KeyD ? 1 : 0); DRIVE_IN.handbrake = !!(keys.Space || keys.ShiftLeft || keys.ShiftRight); }   // (online: the pedals this tick, as crime.js reads them - src/multiplayer/online.js records them)
  if (player.driving) { crime.updateDriving(dt); player.zone = null; player.throttle = keys.KeyW ? 1 : 0; player.stepY = player.stepV = 0; return; }
  player.seated = !!(online?.active && online.seated);
  if (player.seated) {   // a passenger (src/sim/seats.js): the room carries the body; drawn sitting in the seat (online.present places it)
    player.throttle = 0; player.zone = null; player.stepY = player.stepV = 0; player.grounded = true;
    rideCam(cam, player.heading, player.speed, dt, keys);   // (the car's follow camera: look round, it holds, swings back behind - as at the wheel)
    const rp = online.renderPose, pil = online.seated.seat === 255; pHuman.setPos(rp.x, rp.y, rp.z, rp.heading); pHuman.update(dt, 0, pil ? 'ride' : 'sit');   // (255: on the back of a bike - src/sim/net.js PILLION_SEAT)
    return;
  }
  if (online?.active && !player.riding) online.beforeStep();   // (the knock and the push local people gave the body since the last step: sent with this tick's input)
  if (limeRide.stepping && (player.down > 0 || pHuman.rag)) abortLimeStep();
  vaultHintT -= dt;
  if (player.vault) {                     // over a railing / barrier (startVault): the hop places you, no walls on the way
    if (player.down > 0 || player.riding || pHuman.rag) player.vault = null;
    else {
      stepVault(dt);
      const s = player.vault ? Math.min(1, player.vault.t / player.vault.dur) : 1;
      pHuman.setPos(player.x, player.y, player.z, player.heading);
      pHuman.update(dt, player.vault ? 2.5 : player.speed, 'walk');
      if (player.vault) pHuman.body.rotation.x = 0.45 * Math.sin(Math.PI * s);   // (leaning over it)
      player.throttle = 0; player.zone = null; bodyFree = true;
      return;
    }
  }
  // aboard a CityCat (src/ferry/index.js): walking its decks, at the helm, on the gangway (before the water: it's river)
  if (ferry?.playerUpdate(dt, fwd, str)) { bodyFree = true; return; }
  // in the water (src/water/index.js): swimming, diving, falling in, climbing out, on a jet ski, a shark has you
  if (water?.playerUpdate(dt, fwd, str)) { bodyFree = true; return; }
  const ox = player.x, oz = player.z;
  let pose = 'walk';
  // wading: real ponds / lagoons are surface code 10 (groundY already slopes down into them); the Streets Beach
  // lagoon is drawn by decor over the lawn, so there we sink the player into the water sheet instead
  const inRing = world.inLagoonRing(player.x, player.z);
  const inLagoon = inRing || W.inLagoon(player.x, player.z);
  if (player.down > 0) {
    player.down -= dt; pose = 'down';
    // up again after a canned fall (no ragdoll had you): the GetUp clip from sitting up, quickened (PLAYER_UP), and a
    // moment on your feet before you move off (it was a 0.2 s blend from lying flat to standing)
    if (player.down <= 0 && player.hp > 0 && !pHuman.rag) {
      pHuman.move('GetUp', { mask: 'full', fin: 0.08, from: PLAYER_UP.from, speed: PLAYER_UP.speed }); player.upT = PLAYER_UP.hold;
    }
  } else if (player.upT > 0) {
    player.upT -= dt; pose = player.upT > PLAYER_UP.hold - (1.2 - PLAYER_UP.from) / PLAYER_UP.speed ? 'down' : 'walk';
    player.vx = player.vz = 0; player.speed = 0; player.throttle = 0; player.zone = null;
  } else if (player.riding) {
    const sc = player.riding;
    player.rideT += dt;
    sc.battery = Math.max(0, sc.battery - dt / 20);
    // no speed limit on anything you ride (the user, 2026-10-05: "no speed limit on any bikes please"): the zone is only
    // a HUD label; the motor pulls until drag holds it (Lime ~73 km/h: src/limeride.js LIME_TOP; e-bikes ~76 km/h:
    // src/delivery.js ebikeDrive). Only a flat battery or the water stops the motor (cap 0).
    const zone = sc.ebike ? delivery.zone(player.x, player.z) : rideZone(player.x, player.z);
    let cap = Infinity;
    if (sc.battery <= 0 || inLagoon) cap = 0;
    if (!sc.ebike && limeRide.active) {
      // Lime: kick-start, motor taper, hand brake, speed-dependent turning circle (src/limeride.js)
      player.heading += limeRide.drive(dt, sc, fwd, str, cap) * dt;
      player.throttle = limeRide.throttle;
    } else if (sc.ebike) {
      player.heading += delivery.drive(sc, fwd, str, dt, cap) * dt;   // (a delivery rider's or a kid's e-bike)
      player.throttle = fwd > 0 ? 1 : 0;
    } else {
      if (cap > LIME_TOP) cap = LIME_TOP;   // (a Lime without the ride module: its constant shove would never stop)
      const throttle = fwd > 0 ? 1 : 0;
      if (fwd > 0 && sc.v < cap) sc.v = Math.min(cap, sc.v + (sc.ebike ? 4 : 3.4) * dt);   // (a Lime without the ride module: as quick as limeride.js's)
      else if (fwd < 0) sc.v = Math.max(0, sc.v - 6 * dt);
      else sc.v = Math.max(0, sc.v - 0.7 * dt);
      if (sc.v > cap) sc.v = Math.max(cap, sc.v - 3.5 * dt);  // top speed (a flat battery / the water: stop)
      const steer = -str;
      const turnRate = (1.9 - Math.min(1, sc.v / 7) * 0.8) * Math.min(1, 0.35 + sc.v / 2.5);
      player.heading += steer * turnRate * dt;
      sc.lean += ((-steer * Math.min(1, sc.v / 5) * 0.28) - sc.lean) * Math.min(1, dt * 6);
      player.throttle = throttle;
    }
    // a wheelie / a manual (src/wheelie.js): Space held at speed, on the bike (not stepping on a Lime); a loop-out comes off
    const wk = sc.ebike ? 'ebike' : limeRide.active ? 'lime' : null;
    wheelieIn.held = !!keys.Space && (sc.ebike || limeRide.phase === 'ride'); wheelieIn.v = sc.v; wheelieIn.fwd = fwd; wheelieIn.str = str; wheelieIn.foot = zone.cls !== 'road';
    wheelie.update(dt, wk, wheelieIn);
    sc.v += wheelie.boost * dt;       // (the front up: the motor pulls a touch harder)
    if (wheelieFall) {                // (looped out last step: off the back, a small knock - the bike shoots on without you)
      wheelieFall = null; sc.v *= 0.35;
      hurtPlayer(rnd(4, 7), player.x + Math.sin(player.heading) * 2, player.z + Math.cos(player.heading) * 2, 'knockoff');
      subtitle(sc.ebike ? 'You looped the wheelie and came off the back!' : 'You looped the manual and came off the back!', 2.2, false);
    }
    // a skid (src/drift.js bike): the back brake with the bars turned at speed - the tail steps out, the bike leans in a
    // touch, one streak from the rear tyre, small puffs, a light squeal (the car's pools: no new draws)
    const sk = player.riding && !wheelie.on && crime?.drift ? crime.drift.bike(dt, player.x, player.z, player.y, player.heading, sc.v, sc.ebike ? (sc.kid ? -0.55 * (sc.s || 1) : -0.41) : -0.45, fwd < 0, str) : 0;
    if (sk > 0) {
      const sd = str > 0 ? 1 : -1;
      player.heading -= sd * sk * BIKE_DRIFT.yaw * dt;
      if (sc.ebike) sc.lean += sd * BIKE_DRIFT.lean * sk * Math.min(1, dt * 6);
      sc.v += sk * 2.5 * dt;          // (the locked back wheel slides: it scrubs less than a plain stop - a longer skid)
      sfx.skid(sk * BIKE_DRIFT.squeal[0], 0, BIKE_DRIFT.squeal[1]);
    }
    const rideV = online?.active ? dqAxis(qAxis(Math.max(0, Math.min(RIDE_V, sc.v)) / RIDE_V)) * RIDE_V : sc.v;   // (online: the speed as the wire carries it - the room steps the same)
    player.rideV = rideV;
    player.vx = Math.sin(player.heading) * rideV; player.vz = Math.cos(player.heading) * rideV;
    player.speed = sc.v;
    // the camera behind the rider: look round and it holds, then swings back (as in a car: src/drivecam.js)
    rideCam(cam, player.heading, sc.v, dt, keys);
    pose = 'ride';
    player.zone = zone;
  } else if (limeRide.stepping) {
    // stepping off a Lime: src/limeride.js owns the body (and glides player.x/z to where they'll stand) for ~0.7 s
    player.vx = player.vz = 0; player.speed = 0; player.throttle = 0; player.zone = null;
  } else {
    // on foot: src/sim/foot.js footVelocity - the speeds (no stamina: Shift sprints for as long as it's held), the easing,
    // the heading, a jump (a railing: startVault; the water: jumpIn; else straight up), the footstep clock
    const running = !!(keys.ShiftLeft || keys.ShiftRight);
    // (the touch joystick: its own direction, not just the 8 the keys it presses give)
    const ax = touchUI?.axis, analog = ax?.active && ax.mag > 0.2, af = analog ? ax.y : fwd, sf = analog ? ax.x : str;
    moveVector(cam.yaw, af, sf, FOOT_IN);
    stepOnFoot = true;
    if (online?.active) { FOOT_IN.mx = dqAxis(qAxis(FOOT_IN.mx)); FOOT_IN.mz = dqAxis(qAxis(FOOT_IN.mz)); }   // (prediction steps exactly what the room will be sent)
    FOOT_IN.run = running; FOOT_IN.jump = !!keys.Space;
    FOOT_IN.hold = !!wildlife?.food?.holding;   // (SHOO held: standing your ground waving the bin chickens off - no walking; the camera still looks)
    FOOT_IN.speedScale = combat && !online?.active ? combat.moveScale(running) : 1;   // squared up / mid-swing (src/combat.js; the room knows no fights yet)
    // squared up / throwing: face your opponent (src/combat.js). In first person (POV) otherwise face where you look: the
    // body turned only to the way you walked (and spun round walking backwards), so standing still a punch, the guard
    // (combat absorb), a throw / a swing (weapons_core.js pl.heading), T-talk (characters2026_world.js, cityai.js) and the
    // mic all aimed off the view. Online too: those all resolve in this browser against its own people; the room steps the
    // same foot.js with face null and checks only the position (online.js reconcile: x / y / z), which the heading doesn't
    // move - but for a dodge standing still (the room doesn't step dodges at all) and a standing jump's direction into a
    // railing or the water (a FREE tick: the room follows this screen). After a correction the replay (face null) hands the
    // heading back to the room's for a step or two before it turns to the view again - with the body hidden, only the aim.
    // The others keep seeing the room's heading (the way you move), as before.
    // (not while a fault view is held: faults.js goto puts you back facing the report's heading and sets cam.yaw to its
    //  follow camera, then ticks with pov.active still on from before - the body turned half way to that yaw)
    const povFace = pov.active && !faults?.api?.holding ? cam.yaw : null;
    FOOT_IN.face = online?.active ? povFace : (combat?.faceHeading() ?? povFace);
    footVelocity(player, FOOT_IN, SIMW, dt, FOOT_OUT, FOOT_HOOKS);
    if (FOOT_OUT.step) sfx.step(FOOT_OUT.step > 1);   // footsteps
    player.throttle = 0;
    player.zone = null;
  }
  player.inLagoon = inLagoon;
  // integrate, the walls, the walkable raster (slide along an edge / back to where the step began), the ground or a deck
  // under you with gravity, the kerb-step spring: src/sim/foot.js moveBody (a bank walked off, a bike into a wall: FOOT_HOOKS)
  moveBody(player, SIMW, dt, FOOT_OUT, FOOT_HOOKS);
  // bump into people (not the street below a deck you're walking on)
  const fast = player.riding ? player.riding.v > 2.2 : player.speed > 4.5, aloft = !!player.deckRoad && player.y - LY.groundY(player.x, player.z) > 1.2;
  // (on foot it's the bodies touching that counts - src/bodies.js onContact, playerTouched below: a brush, a bump, a
  // stagger, knocked down by a sprint straight into them; riding, the old rule: within 0.6 m and fast enough)
  if (player.riding) for (const p of peds.list) {
    if (p.down > 0 || aloft) continue;
    const dx = p.x - player.x, dz = p.z - player.z;
    if (Math.abs(dx) > 1 || Math.abs(dz) > 1) continue;
    const d = Math.hypot(dx, dz);
    if (d < 0.6 && (streetLife ? player.riding.v > 0.8 : fast)) knockPed(p, player.riding.v, player.heading, player.riding.ebike ? 'ebike' : 'scooter');   // (src/ragdoll.js: what the witnesses shout)
  }
  for (const c of crackheads) {
    if (c.state === 'gone' || c.state === 'down' || aloft) continue;
    const dx = c.x - player.x, dz = c.z - player.z, d = Math.hypot(dx, dz);
    if (d < 0.85) {
      if (player.riding && player.riding.v > 3) { c.hit(35, player.x, player.z); player.riding.v *= 0.3; sfx.crash(); }
      // (walking into him: src/bodies.js)
    }
  }
  // place meshes
  if (player.riding && !player.riding.ebike && limeRide.active) {
    // Lime: the ride module places the articulated scooter and poses the rider on it (clip underneath, IK on top)
    pHuman.update(dt, 0, limeRide.phase === 'ride' ? 'ride' : 'walk');
    limeRide.wheelie = wheelie.pitch; limeRide.wheelieLean = wheelie.lean;   // (a manual: src/wheelie.js)
    limeRide.update(dt, player, pHuman);
  } else if (player.riding) {
    const sc = player.riding;
    sc.x = player.x; sc.z = player.z; sc.ry = player.heading;
    if (sc.ebike) delivery.place(sc); else placeScooter(sc);
    pHuman.setPos(player.x, player.y + (sc.seatY ?? 0.24), player.z, player.heading);   // (a kid's e-bike sits higher)
    pHuman.root.rotation.z = 0;
    const lean = sc.ebike ? delivery.seat(pHuman, sc, dt, wheelie.pitch, wheelie.lean) : sc.lean;   // (on an e-bike: seated, src/bikeseat.js; a wheelie pitches it)
    pHuman.update(dt, 0, 'ride');
    pHuman.body.rotation.z = lean; pHuman.body.position.x = 0; pHuman.body.rotation.x = -wheelie.pitch;
  } else if (limeRide.stepping) {
    pHuman.update(dt, 0, 'walk');
    limeRide.update(dt, player, pHuman);      // (at the end it parks the scooter and hands the body back)
  } else {
    pHuman.setPos(player.x + (online ? online.vis.ox : 0), player.y + player.stepY, player.z + (online ? online.vis.oz : 0), player.heading);   // (stepY: easing over a kerb; online: a correction easing out)
    pHuman.update(dt, player.speed, combat ? combat.playerPose(pose) : pose);   // (squared up: the guard stance)
    if (player.dodgeT > 0 && !combat?.fightMode) pHuman.body.rotation.x = 0.5;   // (in a fight the dodge is a slip)
  }
}
// You into pedestrian p at rv m/s, shoving them heading rh (vehicle 'foot' | 'scooter' | 'ebike'). Street life
// (src/streetlife/crash.js), by speed: a nudge (a stumble and a glare), knocked down, or flat and hurt (up again quickly,
// a short limp); your Lime wobbles or throws you; a bystander helps, someone rings Triple Zero. Once per hit. Without it,
// the canned fall.
function knockPed(p, rv, rh, vehicle) {
  if (streetLife) return streetLife.playerHitPed(p, { rv, rh, vehicle });
  peds.hit(p, { vx: Math.sin(rh) * rv, vz: Math.cos(rh) * rv, mass: player.riding ? 0.1 : 0.08, veh: player.riding || undefined, vehicle }, 1);   // (1 s, was 2: the canned fall when no ragdoll is free)
  // what they say depends on what hit them and who they are (src/streetlines.js: a cry, then a bystander helping
  // them up or ringing Triple Zero); else their own few lines (src/reactions.js), else a spray for you
  const who = { person: p, follow: () => ({ x: p.x, z: p.z }), speaker: p.h, key: p.h, female: p.h?.look?.female };
  if (!StreetLines.crash(p, { vehicle, speed: rv, byPlayer: true, down: true }).impact && !Reactions.say(player.riding && rv > 4 ? 'hit_pain' : 'near_miss', who))
    subtitle(pick(['Pedestrian: "Oi! Watch it, mate!"', 'Pedestrian: "Get off the footpath, ya lunatic!"', 'Pedestrian: "Seriously?!"']), 3.2, true, null, { female: !!p.h?.look?.female, age: p.h?.look?.age });
  sfx.hurt(); peds.scare(p.x, p.z, 10);
  return 'down';
}
// You on foot touched someone (src/bodies.js onContact, once per contact; their torso and step are bodies.js's): a
// sprint straight into a pedestrian knocks them down; a jog straight in (or a sprinting brush) is a stumble and a glare;
// walking into them or shouldering past, maybe a word ("Oi, watch it, mate."); still leaning on them, a word for sure
function playerTouched(o, kind, tier, info) {
  if (kind !== 'ped' || o.down > 0 || player.riding || player.driving) return;
  const rh = Math.atan2(info.nx, info.nz);                     // (the way they're shoved)
  if (tier === 'fall') knockPed(o, Math.min(7.4, Math.max(4.6, info.closing)), rh, 'foot');
  else if (tier === 'stagger') {
    if (streetLife) streetLife.playerHitPed(o, { rv: Math.min(3.7, Math.max(2.5, info.closing)), rh, vehicle: 'foot' });   // (x 0.85: under the nudge tier)
    else { if (o.h) o.h.hurtT = 0.5; StreetLines.bump(o, { chance: 1 }); }
  } else if (tier === 'push') StreetLines.bump(o, { chance: 1, gap: 1 });
  else if (tier === 'bump' || (tier === 'brush' && player.speed > 1.1)) StreetLines.bump(o);
}
// Scooters beyond 115 m are hidden (a 1.2 m scooter is a few pixels there). Within that each is one draw (+ one shadow
// draw inside 40 m); the decal / lamp-lens meshes only show inside 30 m. Three.js frustum-culls each mesh on top.
let scooterCullT = 0;
function cullScooters(dt) {
  scooterCullT -= dt; if (scooterCullT > 0) return; scooterCullT = 0.4;
  for (const s of scooters) {
    const own = s === player.riding || !!s.__knock?.body, d = Math.hypot(s.x - player.x, s.z - player.z);
    s.root.visible = own || d < 115;
    if (!s.root.visible || !s.main) continue;
    const near = own || d < 30, shadow = own || d < 40;
    if (s.lodNear !== near) { s.lodNear = near; for (const m of s.detail) m.visible = near; }
    if (s.lodShadow !== shadow) { s.lodShadow = shadow; for (const m of s.main) m.castShadow = shadow; }
  }
}

// ------------------------------------------------------------------ the GPU crowd beyond the walkers (src/crowd)
// The GPU crowd (phones, src/crowd) beyond the walkers and sitters: the eshays, the street riders (and pillions), the
// delivery riders and the 2026 characters are drawn by it mid-distance and far off, and on a rig near you or whenever
// they matter - a lad in a fight, a chase, a taunt, down, with the knife or the phone out or someone talking to him (a
// calm pack hanging about or walking is the crowd's); a rider coming off or down (riding: the baked Ride clip on the
// instanced Lime / e-bike); a delivery rider off the bike (falling, down, chasing you, walking back); a 2026 character
// in a sequence, a conversation or a line, at the wheel, or with the camera out.
function crowdMoreSources() {
  const held = o => !!npcAI?.city?.held?.has?.(o);
  crowd.source('eshays', () => eshays?.list, { important: m => {
    const P = m.pack;
    if (!P || m.state === 'gone' || P.mode === 'gone') return false;   // (out of the world, waiting to come back: nobody to draw)
    return (P.mode !== 'roam' && P.mode !== 'hang') || m.state !== 'ok' || !!m.ctrl || m.windup > 0 || !!m.knife
      || m.upT > 0 || m.phoneT > 0 || m.pointT > 0 || held(m);
  } });
  const sl = [];                                             // (the riders and their pillions: one list, made again each frame)
  crowd.source('streetRiders', () => { sl.length = 0; for (const a of streetLife?.agents || []) { sl.push(a); if (a.pillion?.h) sl.push(a.pillion); } return sl; },
    { important: a => a.state === 'fallen' || !!a.h?.rag || held(a) });
  crowd.source('delivery', () => delivery?.riders, { important: r => (r.state !== 'ride' && r.state !== 'join') || held(r) });
  crowd.source('chars26', () => chars26?.list, { important: c => c.pose === 'sit' || c.car != null || !!c.look?.camera || !!chars26.pinned(c) });
  // everyone on the river craft (src/river/crew.js): the same people, far / mid by the crowd; swimmers keep their rigs
  crowd.source('river', () => river?.crew?.people, { important: b => b.swim });
}

// ------------------------------------------------------------------ the resident-rig budget (src/population.js)
// The ones counted here (the rest register themselves: the 2026 characters, market stallholders, delivery riders, the
// street riders' pool): the player, the walkers (they recycle their own bodies), the seated locals and buskers, the
// eshay packs and hangout groups (a fixed pool), the crackheads. A roamer crackhead far away and not up to anything is
// the one of ours the budget may let go (Human.dispose; out of the list).
function registerRigs() {
  const live = h => (h && !h.disposed && !h.asleep && !h.crowd ? 1 : 0);   // (asleep: its rig put away, people.js Human.sleep; crowd: drawn by src/crowd, no rig)
  rigs.register('player', { count: () => live(pHuman) });
  if (crowd) rigs.register('crowdpool', { count: () => crowd.pool.size, entries: () => crowd.pool.entries(PRIO_RIG.decor) });   // (spare rigs: src/crowd/pool.js)
  rigs.register('peds', { count: () => (peds?.list || []).reduce((n, p) => n + live(p.h), 0) });
  rigs.register('locals', { count: () => (locals?.list || []).reduce((n, o) => n + live(o.h), 0) });
  rigs.register('eshays', { count: () => (eshays?.list || []).reduce((n, m) => n + live(m.h), 0) });
  rigs.register('crackheads', {
    count: () => crackheads.reduce((n, c) => n + live(c.h), 0),
    entries: () => crackheads.filter(c => c.roamer && !c.h.rag && (c.state === 'loiter' || c.state === 'gone') && (c.dist ?? 0) > 150)
      .map(c => ({ d: c.dist, prio: PRIO_RIG.ambient, release: () => releaseCrackhead(c) })),
  });
}
/** a roamer crackhead's body goes for good (the budget): out of the list, his bubble off the HUD, Human.dispose */
function releaseCrackhead(c) {
  const i = crackheads.indexOf(c);
  if (i < 0 || c.h.rag) return false;
  crackheads.splice(i, 1);
  c.bubble?.remove();
  c.state = 'gone'; c.released = true;
  c.h.dispose();
  return true;
}
let rigT = 1;
function updateRigs(dt) { if ((rigT -= dt) <= 0) { rigT = 1; rigs.enforce(); } }

// ------------------------------------------------------------------ roamers: new crackheads find you
// somewhere a person may turn up or go (src/sight.js: out of the camera's view, behind a building, or `far` m off)
const unseenAt = (x, z, far = 120) => !sight.seen(x, null, z, { r: 1, far });
let roamT = 45;
function updateRoamers(dt) {
  roamT -= dt;
  if (roamT > 0) return;
  roamT = rnd(55, 95);
  const active = crackheads.filter(c => c.state === 'beg' || c.state === 'aggro').length;
  if (active >= 2 || crackheads.length > 18 || player.hp <= 0) return;
  if (!rigs.allow('crackheads', PRIO_RIG.ambient)) return;   // (over the rig budget: src/population.js)
  if (online?.active) { const n = Math.max(0, online.players - 1); if (n && Math.random() < n / (n + 1)) return; }   // (online: the room's players share one crowd of roamers between them)
  for (let k = 0; k < 20; k++) {
    const a = rnd(0, 6.28), r = rnd(30, 45);
    const x = player.x + Math.cos(a) * r, z = player.z + Math.sin(a) * r;
    if (!LY.walkable(x, z) || W.isRoad(x, z) || W.inLagoon(x, z)) continue;
    if (!unseenAt(x, z)) continue;                           // (out of sight: behind you or round a corner - src/sight.js)
    const p = { x, z }; if (world.col.resolve(p, 0.4)) continue;
    const c = new Crackhead(x, z, true); c.t = rnd(8, 12); c.lineT = 1.5;
    crackheads.push(c);
    return;
  }
}

// ------------------------------------------------------------------ camera
let contentCam = null;   // a staged scene's camera (src/content/director.js): __game.contentCamera = fn(camera, dt) -> focus | null
let photo = null;   // debug "street view" camera: __game.photo(x, z, yawDeg, pitchDeg, hfovDeg, eye, base = ground y)
// The ground under the camera: under a river bridge's raised span (seen from a ferry, a jet ski, a swimmer) it is the
// river below, not the deck over it (src/osm/riverbridges.js; DK.inSlab keeps the camera out of the deck itself).
function camGround(x, z, ty) {
  const g = LY.groundY(x, z), RB = W && W.riverBridges;
  if (RB && g > ty + 0.3 && RB.maskAt(x, z) && RB.soffitAt(x, z) > ty - 0.6) return W.WATER_Y;
  return g;
}
// First-person view (POV, the owner 2026-10-28): ` on a keyboard, the eye button on a phone. On foot only: the camera at
// your eyes looking where cam.yaw / cam.pitch look (the mouse / the look area steer it as always), your body left out of
// the draw (renderNow). It yields - the follow camera back, as it was - in any vehicle, on a Lime / e-bike, swimming,
// aboard a CityCat, knocked down / getting up / dead / busted, in clip mode and to the staged / photo / fault cameras; it
// comes back by itself when that's over. Remembered in localStorage (bs.pov), off by default. While it's on, the body
// faces where you look (updatePlayer FOOT_IN.face).
// (the state: declared up by render(), which reads pov.hide)
// (getting up: player.down runs out before the GetUp clip (player.upT) or a ragdoll's own get-up (pHuman.rag) is done -
//  the eye would pop up to standing height with the body still on the ground)
function povAllowed() {
  return pov.on && started && !player.driving && !player.seated && !online?.seated && !player.riding && !limeRide.busy
    && !(player.down > 0) && !(player.upT > 0) && !pHuman?.rag && player.hp > 0 && !water?.active && !ferry?.aboard && !clipMode?.on && !crime?.S?.busted;
}
function povApply(on) {
  if (on === pov.active) return;
  pov.active = on; pov.hide = on;
  if (on) { pov.savedPitch = cam.pitch; cam.pitch = 0.05; cam.pitchMin = POV_PITCH_MIN; }
  else { cam.pitchMin = -0.35; if (!faults?.api?.holding) cam.pitch = pov.savedPitch; cam.snap = true; }   // (the follow camera cuts straight back to its spot. A fault view held from first person: faults.js goto has just set the report's follow pitch - kept)
}
function togglePov() {
  pov.on = !pov.on;
  try { if (pov.on) localStorage.setItem('bs.pov', '1'); else localStorage.removeItem('bs.pov'); } catch { /* private mode */ }
  if (!pov.on) povApply(false);
  // (the solo game frozen - paused, the big map open: updateCamera doesn't run there, and a redraw of the frozen frame
  //  - a resize, the phone turned, a setting changed in the Esc menu - drew your body back round a camera still at your
  //  eyes. Placed now (POV off: cam.snap, a cut), the frozen frame is the view you chose; a held fault view is let go
  //  first, as the key does)
  const frozen = started && !online?.active && (paused || !$('bigmap').classList.contains('hidden'));
  if (frozen) { faults?.api?.release(); updateCamera(0); menuViewDirty = true; }
  if (frozen && paused) return;   // (paused: the PAUSED line stays - the frozen frame shows it; a toast wouldn't run down)
  // (short: a phone's toast is one line, ~180 px - src/hudtidy.js)
  toast(pov.on ? (povAllowed() || !started ? 'First-person view' : 'First person when on foot') : 'Third-person view', 1.4);
}
function updateCamera(dt) {
  const cameraBody = online?.active ? (player.vault || water?.active || ferry?.aboard ? TW.view : !(player.down > 0) && !limeRide.stepping ? online.renderPose : player) : player;   // (online, on foot, at the wheel, on a bike: the eased render pose between the room's ticks - a correction never jolts the camera; the water / a CityCat place the body fresh each world step)
  povApply(!contentCam && !photo && !faults?.api?.holding && povAllowed());   // (first person: yields to the staged, photo and held fault cameras too - holdView below; checked here, not there, or it flipped on and off every held frame)
  // a staged scene's camera (src/content/director.js, ?content=1 only): it places the camera and says what to keep in
  // shadow focus; null / false = the game's own camera this frame
  if (contentCam) {
    const f = contentCam(camera, dt);
    if (f) { sky.position.copy(camera.position); sunShadow.follow(f.x, f.y ?? W.groundY(f.x, f.z), f.z); return; }
  }
  if (photo) {
    const yaw = photo.yaw * Math.PI / 180, pit = photo.pitch * Math.PI / 180;
    camera.position.set(photo.x, (photo.base ?? W.groundY(photo.x, photo.z)) + photo.eye, photo.z);
    camera.lookAt(camera.position.x + Math.sin(yaw) * Math.cos(pit), camera.position.y - Math.sin(pit), camera.position.z - Math.cos(yaw) * Math.cos(pit));
    camera.fov = 2 * Math.atan(Math.tan(photo.hfov * Math.PI / 360) / camera.aspect) * 180 / Math.PI; camera.updateProjectionMatrix();
    sky.position.copy(camera.position);
    sunShadow.follow(photo.x, photo.base ?? W.groundY(photo.x, photo.z), photo.z);
    pHuman.root.visible = false;
    return;
  }
  // a fault's exact view held after "Go there" / __game.faults.goto (src/faults.js), until you move or look
  if (faults?.holdView(camera)) { povApply(false); sky.position.copy(camera.position); sunShadow.follow(cameraBody.x, cameraBody.y, cameraBody.z); return; }
  if (pov.active) {   // first person: at the eyes (over the body's centre, eased over kerbs), looking along yaw / pitch
    clipMode?.camera(dt);   // (clip mode is off here: an orbit it left keeps unwinding - drivecam.js cineCam, reused output - so the follow camera doesn't start swung round when POV next yields)
    const pp = cam.pitch, cp = Math.cos(pp), fx = Math.sin(cam.yaw) * cp, fz = Math.cos(cam.yaw) * cp;
    cam.x = cameraBody.x; cam.y = cameraBody.y + POV_EYE + player.stepY; cam.z = cameraBody.z;
    cam.tx = cam.x; cam.ty = cam.y; cam.tz = cam.z;
    cam.shake = Math.max(0, cam.shake - dt * 2.5);
    const sh = cam.shake * 0.05;
    camera.position.set(cam.x + rnd(-sh, sh), cam.y + rnd(-sh, sh), cam.z + rnd(-sh, sh));
    cam.ax = cam.x + fx; cam.ay = cam.y - Math.sin(pp); cam.az = cam.z + fz;
    camera.lookAt(cam.ax, cam.ay, cam.az);
    sky.position.copy(camera.position);
    sunShadow.follow(cameraBody.x, cameraBody.y, cameraBody.z);
    return;
  }
  const drv = player.driving || (player.seated && online?.seatProfile ? { profile: online.seatProfile() } : null);   // (a passenger: the vehicle's camera too - further back in a bus)
  const vp = drv?.profile;
  const vehicleZoom = vehicleCameraZoom(cam.dist, vp);
  // on a Lime: aim at the rider's shoulders (deck 0.16 m + a 1.8 m rider), pull back a little with speed
  const rv = player.riding ? Math.min(1, (player.riding.v || 0) / 7) : 0;
  // (on foot the aim follows the body, eased over kerbs: player.stepY. Aimed at the raw height, each 12 cm step up
  //  snapped the view while the damped position below lagged it)
  // (in the water: aimed just over the surface, the water - not the river bed - its floor; src/water/index.js)
  const wet = water?.active ? water : null;
  const fc = ferry?.camInfo;   // aboard a CityCat: further back at the helm (src/ferry/index.js)
  // clip mode's cinematic follow (src/clipmode.js, src/drivecam.js cineCam): lower, wider, slower, maybe orbiting; null = the game's
  const cine = clipMode?.camera(dt) || null;
  // the auto director (src/director_cam.js): its own pitch and field of view each shot, a cut when the shot changes
  if (cine?.fov) { if (camera.fov !== cine.fov) { camera.fov = cine.fov; camera.updateProjectionMatrix(); } }
  if (cine?.cut) cam.snap = true;
  const ty = (wet ? wet.camTarget : cameraBody.y + (player.riding ? 1.62 : drv ? 2.2 + (vp?.camHeight || 0) * vehicleZoom : 1.6 + player.stepY) - (player.down > 0 ? 1 : 0) + (fc ? fc.lift : 0)) + (cine ? cine.lift : 0);
  const dist = (cam.dist + (player.riding ? 0.1 + 0.6 * rv : 0) + (drv ? (3.6 + (vp?.camDist || 0) * (vp?.camNarrow && camera.aspect < 1.3 ? vp.camNarrow : 1)) * vehicleZoom : 0) + (wet ? wet.camExtra : 0) + (fc ? fc.extra : 0)) * (cine ? cine.distMul : 1);
  const yawOn = online?.active && player.driving ? online.renderPose.yawOff || 0 : 0;   // (online at the wheel: the follow camera turns with the car as drawn between the room's ticks, not a step at a time)
  const fx = Math.sin(cam.yaw + yawOn + (cine ? cine.yawOff : 0)), fz = Math.cos(cam.yaw + yawOn + (cine ? cine.yawOff : 0));
  const pitch = cine && cine.pitch != null ? Math.max(cine.pitch, wet?.camPitchMin ?? -Infinity) : Math.min(cine ? cine.pitchMax : Infinity, Math.max(cam.pitch, wet?.camPitchMin ?? -Infinity, cine ? cine.pitchMin : -Infinity));   // (swimming: looks down on you, src/water camPitchMin)
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  let best = dist;
  const DK = world.decks;   // bridges / elevated roads (src/osm/decks.js): never inside a deck, never under the one you're on
  for (let d = 0.5; d <= dist; d += 0.35) {
    const x = cameraBody.x - fx * cp * d, y = ty + sp * d, z = cameraBody.z - fz * cp * d;
    if (world.col.pointBlocked(x, y, z) || y < (wet ? wet.camFloor(x, z) : camGround(x, z, ty) + 0.2) || (DK &&(DK.inSlab(x, y, z) || y < DK.topBelow(x, z, ty) + 0.2))) { best = Math.max(0.4, d - 0.4); break; }
  }
  const tx = cameraBody.x - fx * cp * best, tz = cameraBody.z - fz * cp * best;
  let tyy = ty + sp * best;
  // (the Metro, profile camOverTrees: its camera, far back and up, rides over the street trees' crowns rather than looking
  //  through them - pulling in, as for a wall, would jump it onto the bus all along a tree-lined street. Any point of the
  //  view line under the crowns' height and within a crown's reach of a trunk (a CBD plane's spreads ~6.5 m): up over
  //  them. src/busjack.js METRO_CAM)
  const TG = vp?.camOverTrees && !cine ? world.decor?._data?.trees : null;
  if (TG) {
    const overT = camGround(tx, tz, ty) + vp.camOverTrees * Math.min(1, vehicleZoom);            // (over the ground there: the CBD has hills)
    let leaves = false;
    for (let d = best; d > 3 && !leaves && tyy < overT; d -= 1.5) {
      const x = cameraBody.x - fx * cp * d, y = ty + sp * d, z = cameraBody.z - fz * cp * d;
      if (y < overT) leaves = TG.each(x, z, 6.5, o => (o.x - x) * (o.x - x) + (o.z - z) * (o.z - z) < 42);
    }
    if (leaves && !world.col.pointBlocked(tx, overT, tz)) tyy = overT;
  }
  // exponential damping toward the wanted spot (performance stage six): the same follow at any frame rate. The clamped
  // linear step it replaces (min(1, 14 dt)) trailed 0.060 s behind at 93 FPS but only 0.006 s at 15 FPS - no smoothing
  // left on a slow machine, where one presentation covers several catch-up steps. cam.x/y/z stay the one position.
  const rate = cine ? CAM_RATE * cine.rate : CAM_RATE;
  cam.x = damp(cam.x, tx, rate, dt); cam.y = damp(cam.y, tyy, rate, dt); cam.z = damp(cam.z, tz, rate, dt);
  // in at once when a wall, an awning or a deck cuts in (then back out smoothly, above); a jump - teleport, busted,
  // respawn, anything over 30 m - snaps rather than swooping across the city
  // (cam.snap: the look-behind key flipped the view - src/drivecam.js - cut, don't swing through the car)
  if (cam.snap || best < cam.lastBest - 0.2 || Math.abs(tx - cam.x) + Math.abs(tyy - cam.y) + Math.abs(tz - cam.z) > 30) { cam.x = tx; cam.y = tyy; cam.z = tz; cam.snap = false; }
  cam.lastBest = best;
  if (cine?.cut !== undefined) clipMode?.director?.reach(dist > 0 ? best / dist : 1, dt);   // (the auto director: a wall in the shot -> cut away, src/director_cam.js)
  cam.tx = tx; cam.ty = tyy; cam.tz = tz;            // (the wanted spot: tools/perf/camera.js measures the lag)
  cam.shake = Math.max(0, cam.shake - dt * 2.5);
  const sh = cam.shake * 0.12;
  camera.position.set(cam.x + rnd(-sh, sh), cam.y + rnd(-sh, sh), cam.z + rnd(-sh, sh));
  // (the cinematic camera's aim trails the player a little too; otherwise it is on the player, and kept there for a cut in)
  const aimX = cine?.aim ? cine.aim.x : cameraBody.x, aimZ = cine?.aim ? cine.aim.z : cameraBody.z, aimY = cine?.aim ? ty + cine.aim.lift : ty;   // (a chase shot: between you and the cops)
  if (cine?.aimRate && !cam.snap && Math.abs(cam.ax - aimX) + Math.abs(cam.az - aimZ) < 40) { cam.ax = damp(cam.ax, aimX, cine.aimRate, dt); cam.ay = damp(cam.ay, aimY, cine.aimRate, dt); cam.az = damp(cam.az, aimZ, cine.aimRate, dt); }
  else { cam.ax = aimX; cam.ay = aimY; cam.az = aimZ; }
  camera.lookAt(cam.ax, cam.ay, cam.az);
  sky.position.copy(camera.position);
  // the sun's shadow follows the player, moved only by whole shadow-map texels in the sun's frame (src/shadows.js)
  sunShadow.follow(cameraBody.x, cameraBody.y, cameraBody.z);
}


// ------------------------------------------------------------------ day / night (Brisbane: AEST all year, no daylight saving)
const SUNRISE = 5 + 40 / 60, SUNSET = 17 + 50 / 60;  // late September
const C = (h) => new THREE.Color(h);
const DAY = { hemiSky: C(0xcfe6ff), hemiGnd: C(0x8a7a60), fog: C(0xc9dcea), sun: C(0xfff1dc) };
// (stage 9: a neutral night - dark grey ground lit warm by the shops and lamps, as in the reference - was 0x2a3a66 /
//  0x1a1a22 / fog 0x0b1120, a saturated navy that drowned the footpaths)
const NIGHT = { hemiSky: C(0x353d52), hemiGnd: C(0x26262c), fog: C(0x10141c), sun: C(0xa2adc6) };
const DUSK = { fog: C(0xd8a888), sun: C(0xffa060) };
// Daytime light balance. With the photo HDRI (envmap.js) the env carries the sky light, so hemi drops to ~0.3.
const LIGHT = { hemiDay: 1.25, sunDay: 2.2, sunMin: 0.4 };
let lampPools = null, shopSpill = null;
// Shop light on the footpath at night (stage 9): a soft warm patch in front of each lit shop bay (src/osm/buildings.js
// spill), tinted by that shop's own interior, brightest at the glass and gone ~3.5 m out. Instanced per 200 m cell.
function setupShopSpill() {
  const list = world?.buildings?.shopSpill || [];
  if (!list.length) return null;
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  const img = g.createImageData(64, 64);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const out = y / 63, side = Math.min(x, 63 - x) / 63;           // y: out from the glass; x: along it
    const a = Math.pow(1 - out, 1.6) * Math.min(1, side * 5);
    const i = (y * 64 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(a * 255);
  }
  g.putImageData(img, 0, 0);
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);   // (local z 0..1: out from the glass)
  const cells = new Map();
  for (const s of list) { const k = Math.floor((s.x0 + s.x1) / 400) + ',' + Math.floor((s.z0 + s.z1) / 400); (cells.get(k) || cells.set(k, []).get(k)).push(s); }
  const meshes = [], m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
  for (const arr of cells.values()) {
    const im = new THREE.InstancedMesh(geo, mat, arr.length);
    arr.forEach((s, i) => {
      const len = Math.hypot(s.x1 - s.x0, s.z1 - s.z0), cx = (s.x0 + s.x1) / 2, cz = (s.z0 + s.z1) / 2;
      q.setFromAxisAngle(up, Math.atan2(s.nx, s.nz));             // local +z along the outward normal
      pos.set(cx, W.groundY(cx + s.nx, cz + s.nz) + 0.06, cz); sc.set(len, 1, 3.6);
      im.setMatrixAt(i, m.compose(pos, q, sc));
      im.setColorAt(i, col.set(s.color));
    });
    im.computeBoundingSphere(); im.renderOrder = 2; im.visible = false; im.castShadow = im.receiveShadow = false;
    scene.add(im); meshes.push(im);
  }
  return { mat, meshes, bays: list.length };
}
// (the old headlight sprites - two fixed glows on the front of every car, on at night whatever the car was doing - are
//  gone: src/vehicle-lights.js draws every lamp from the vehicle's own state, at its own lamps)
function setupNight() {
  // soft pools of warm light under the street lights (radial falloff texture, additive)
  const pool = new THREE.PlaneGeometry(13, 13).rotateX(-Math.PI / 2);
  const pc = document.createElement('canvas'); pc.width = pc.height = 128; const pg = pc.getContext('2d');
  const pgr = pg.createRadialGradient(64, 64, 0, 64, 64, 64);
  pgr.addColorStop(0, 'rgba(255,255,255,1)'); pgr.addColorStop(0.25, 'rgba(255,255,255,0.75)'); pgr.addColorStop(0.6, 'rgba(255,255,255,0.22)'); pgr.addColorStop(1, 'rgba(255,255,255,0)');
  pg.fillStyle = pgr; pg.fillRect(0, 0, 128, 128);
  const L = P.LAMPS.filter(l => l.y < 1);
  lampPools = new THREE.InstancedMesh(pool, new THREE.MeshBasicMaterial({ color: 0xffc27a, map: new THREE.CanvasTexture(pc), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), Math.max(1, L.length));
  const m = new THREE.Matrix4();
  L.forEach((l, i) => { m.makeTranslation(l.x, W.groundY(l.x, l.z) + 0.07, l.z); lampPools.setMatrixAt(i, m); });
  lampPools.count = L.length;
  lampPools.renderOrder = 2; lampPools.visible = false; scene.add(lampPools);
  shopSpill = setupShopSpill();
  traffic.onNewCar = c => { trimVehicleShadows(c.mesh); singlePass(c.mesh); };
}
let lastNight = -1, EXPOSURE = 0.85;
function updateDayNight() {
  const h = (gameMinutes / 60) % 24;
  const a = (h - SUNRISE) / (SUNSET - SUNRISE) * Math.PI;   // 0 at sunrise, PI at sunset
  const elev = Math.sin(a);
  sunDir.set(Math.cos(a) * 0.75, elev * 0.85, -0.5).normalize();   // rises in the east (+x), arcs through the northern sky (-z)
  const night = THREE.MathUtils.clamp((0.12 - sunDir.y) / 0.3, 0, 1);
  const dusk = THREE.MathUtils.clamp(1 - Math.abs(sunDir.y - 0.02) / 0.22, 0, 1) * (1 - night * 0.6);
  sky.material.uniforms.night.value = night; sky.material.uniforms.dusk.value = dusk;
  if (hdri) sky.material.uniforms.hdriYaw.value = hdri.yawFor(sunDir);
  hemi.color.copy(DAY.hemiSky).lerp(DUSK.sun, dusk * 0.45).lerp(NIGHT.hemiSky, night);
  hemi.groundColor.copy(DAY.hemiGnd).lerp(NIGHT.hemiGnd, night);
  // day: LIGHT.hemiDay; dusk / night fade to 0.8 (the CBD is never pitch black: sky glow off the towers and streets)
  hemi.intensity = THREE.MathUtils.lerp(LIGHT.hemiDay, 1.75, Math.max(night, dusk * 0.6));   // (1.75, was 1.15: the city glow keeps the streets readable at night - the owner wants to see where he is going)
  setCarLights(0.3 + Math.max(night, dusk * 0.7) * 1.9);   // real cars: daytime running lights, full head/tail lights after dark
  carDark = Math.max(night, dusk * 0.7); carLit = THREE.MathUtils.smoothstep(night, 0.1, 0.6);   // (src/vehicle-lights.js)
  const up = Math.max(sunDir.y, 0);
  sun.color.copy(DAY.sun).lerp(DUSK.sun, dusk).lerp(NIGHT.sun, night);
  // (the moon: 0.3 and a paler blue - at 0.6 its hard shadows ruled the night street; the shops and lamps light it now)
  sun.intensity = night > 0.5 ? 0.6 : LIGHT.sunMin + Math.min(1, up * 2.5) * LIGHT.sunDay;   // (the moon 0.6, was 0.3: a readable night)
  if (night > 0.5) sunDir.set(-0.3, 0.7, 0.4).normalize(); // moonlight
  scene.fog.color.copy(DAY.fog).lerp(DUSK.fog, dusk * 0.7).lerp(NIGHT.fog, night);
  stars.material.opacity = night * 0.9; stars.visible = night > 0.005;   // (by day: not drawn at all, not 1,800 clear points)
  // sprite cumulus: with the photo sky only at dusk (the HDRI has real clouds by day; at full night they read as grey
  // blobs); without it, by day and fading out at night
  const cloudO = hdri ? Math.max(0, dusk - night) * 0.8 : 0.9 - night * 0.75;
  for (const c of clouds) { c.material.opacity = cloudO; c.visible = c.material.opacity > 0.02; }
  renderer.toneMappingExposure = EXPOSURE + night * 0.7;   // (was 0.35: brighter after dark)
  updateEnv(night, dusk);
  const M = world.M;
  if (Math.abs(night - lastNight) > 0.01) {
    lastNight = night;
    const lit = THREE.MathUtils.smoothstep(night, 0.15, 0.7);
    for (const k in M) if (k.startsWith('f_')) M[k].emissiveIntensity = lit * 0.8;   // (warm lit rooms: kit.js facade emissive)
    // shop interiors are lit all day and read through the glass under the awnings. 0.2 by day left every shopfront a
    // brown-black hole next to the Street View references (02_queen_mall_227 L134, 05_albert_mall_047 L77 vs L64-69)
    M.shop.emissiveIntensity = 0.45 + lit * 0.3;
    if (M.signs) M.signs.emissiveIntensity = lit * 0.75;   // fascia signs light up at night (was stuck inside the comment above)
    M.lampGlow.emissive.setHex(0xffd890); M.lampGlow.emissiveIntensity = 0.2 + lit * 1.0;   // (was 1.4: a blinding bloom up close)
    for (const n of world.nightGlow || []) n.mat.emissiveIntensity = lit * n.k;   // City Hall floodlights
    // (lit poster boxes, bus stop names: capped under the bloom threshold - at 1.2 an ad panel bloomed into a white blob)
    for (const gm of world.propGlow || []) { gm.userData.base ??= gm.emissiveIntensity; gm.emissiveIntensity = Math.min(0.85, gm.userData.base) * (0.25 + lit * 0.75); }
    lampPools.material.opacity = lit * 0.5; lampPools.visible = lit > 0.02;
    if (shopSpill) { shopSpill.mat.opacity = lit * 0.38; for (const sm of shopSpill.meshes) sm.visible = lit > 0.02; }
    // (the grid city lit M.steel blue for the Story Bridge; on the real map steel is the Wheel's legs, poles and tower
    // fins, which should stay dark at night)
    bloom.enabled = GFX.bloomAllowed() && lit > 0.05; bloom.strength = 0.85 * lit;   // (the preset may say no night glow)
  }
  if (world.wheelRim) world.wheelRim.emissive.setHSL((time * 0.05) % 1, 0.9, 0.35 * THREE.MathUtils.smoothstep(night, 0.2, 0.7));
}
// The first frame after dark took 9 s (61 shader programs): bloom moves rendering into the composer's HalfFloat target,
// and every material needs a second program for it (linear output, no tone mapping), plus the bloom passes, the lamp
// pools and the headlight sprites. Compile the lot behind the start screen: the day set once updateDayNight has given
// the scene its environment map (the start click used to compile 47 programs), then the night set through the target.
async function warmShaders(say) {
  say?.('Warming up the shaders…');
  await new Promise(r => requestAnimationFrame(r));   // paint the label first: the compiles block the main thread
  limeRide.prepare(pHuman);   // the Lime rider's IK and closed hands, built now (src/limeride.js; the first E used to freeze ~2 s)
  updateDayNight();
  // transparent double-sided materials drawn in one pass (kit.js singlePass) BEFORE their programs are built: it used
  // to run at Play, which changed those materials' programs (one double-sided pass, not a back + front pair) - the
  // Scania's interior and the car glass then compiled on the first frames of play, the 360 ms task right after Play
  // on desktop (tools/perf/play_hitch.mjs, 2026-10-10). The asset models get it below, with the warm-up's templates.
  singlePass(scene);
  vlights?.prepare?.();       // (the bus saloon lights' emissive map: on before the compile, not on the first frame of play)
  if (LITE) {
    // Avoid compiling all hidden models, lighting variants and post effects at once.
    // Other programs compile on demand; trade occasional first-use hitches for headroom.
    // (with the effect lights not counted - the set-up play runs in nearly all the time, src/fxlights.js. They were
    //  counted here - their initial state - and play hides them on its first frame: every lit material then built a
    //  second program as it first came into view, the iPhone's "small lags here and there", 130-250 ms each on a
    //  phone-emulated page; tools/perf/results/phone-baseline-2026-10-08.md. A lit effect light builds its set-up then.)
    fxLightsShow(false);
    fxLightsAllow(false);   // (and never counted in play here: no warm-up builds that set-up - src/fxlights.js)
    updateCamera(0);
    farCars?.warm(true);      // (the far cars' instanced draw: src/farcars.js)
    crowd?.warm(true);        // (the GPU crowd's mid / far draws and the blobs: src/crowd)
    river?.warm(true);        // (the river craft's instanced draws: src/river/models.js)
    wildlife?.warm?.(true);   // (the birds' and the food's instanced draws, hidden while empty: src/wildlife/index.js)
    crime?.drift?.warm(true); // (tyre marks and smoke, hidden until a drift: src/drift.js)
    try { await renderer.compileAsync(scene, camera); } finally { farCars?.warm(false); crowd?.warm(false); river?.warm(false); wildlife?.warm?.(false); crime?.drift?.warm(false); }
    return;
  }
  // every lit shader twice: with the effect lights counted and without (src/fxlights.js: they're counted only while one
  // is lit), so switching between the two in play never compiles anything
  water?.warm(true);          // (sharks, jet skis, pontoons, foam and spray shown: their programs built now, not on the first E)
  ferry?.warm(true);          // (every CityCat near and far model, the terminals and their signs)
  river?.warm(true);          // (the river craft's two instanced draws: src/river/models.js)
  delivery?.warm(true);       // (a taken e-bike's shadow: its depth program, not built on the first E - src/delivery.js)
  knock?.warm?.(true);        // (a knocked prop's stand-in materials: src/knock.js)
  farCars?.warm(true);        // (the far cars' instanced draw: src/farcars.js)
  crime?.drift?.warm(true);   // (tyre marks and smoke: src/drift.js)
  // (materials made on demand in play, each as a speck at the player for the compile: the rideshare's open windows)
  const specks = new THREE.Group(); specks.name = 'warm_specks';
  { const sg = new THREE.BoxGeometry(0.01, 0.01, 0.01);
    for (const m of [...(chars26?.warmMaterials?.() || [])]) { const k = new THREE.Mesh(sg, m); k.castShadow = !m.transparent; k.frustumCulled = false; specks.add(k); }
    specks.position.set(player.x, (player.y || 0) + 1, player.z); scene.add(specks); }
  busRiders?.warm?.();        // (the people seated in buses: baked and their program built now, not when the first bus nears)
  world.boundary?.warm(true);   // (the edge-of-play fence, src/osm/boundary.js: hidden far off, its programs built now)
  // (and what is hidden right now - the bus riders, people and cars out of range, far chunks - compiled too, though
  //  not drawn: their programs were built mid-walk, 50-200 ms each on a phone; three's compile skips hidden objects)
  // The asset cache's models too (cars, buses and police vehicles not in traffic yet, props): in a hidden group for the
  // warm-up only (they have no parent of their own: put back to none after)
  const templates = new THREE.Group(); templates.name = 'warm_templates';
  const tops = [];
  { const seen = new Set(), walk = (x, d = 0) => { if (!x || d > 4 || seen.has(x)) return; seen.add(x); if (x.isObject3D) { if (!x.parent) tops.push(x); return; } if (typeof x === 'object' && !ArrayBuffer.isView(x)) for (const v of Object.values(x)) if (v && typeof v === 'object') walk(v, d + 1); }; walk(A); }
  for (const o of tops) templates.add(o);
  singlePass(templates);      // (as the scene above: clones share these materials, so play's cars draw with what's built here)
  templates.position.set(player.x, -50, player.z); templates.visible = false; scene.add(templates);
  const compileAll = async () => {
    const shownNow = [];
    scene.traverse(o => { if (!o.visible && !o.isLight && o.name !== 'colview') { shownNow.push(o); o.visible = true; } });
    try { await renderer.compileAsync(scene, camera); } finally { for (const o of shownNow) o.visible = false; }
  };
  // The shadow pass's own programs (a depth material per kind of caster: skinned, alpha-tested, double-sided, a GLB car's
  // panels...): three's compile doesn't build them, and the first car or person of a new kind to enter the sun's
  // shadow built one mid-game - a 2.3 s first use on a phone-emulated page (tools/perf/hitch_bench.mjs --progs). Every
  // caster - hidden ones and the models above too - drawn into the shadow map once, culling off, the screen scissored
  // to one pixel.
  // (one caster per kind - its materials, skinned or instanced - is enough to build a depth program: the rest sit this
  //  draw out; and the camera looks at an empty layer, so only the shadow pass draws at all)
  const shadowAll = () => {
    const shownNow = [], unculled = [], muted = [], kinds = new Set();
    scene.traverse(o => {
      if (!o.visible && !o.isLight && o.name !== 'colview') { shownNow.push(o); o.visible = true; }
      if (!(o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) || !o.castShadow) return;
      const m = o.material, k = (Array.isArray(m) ? m.map(x => x.uuid).join() : m?.uuid) + (o.isSkinnedMesh ? 's' : o.isInstancedMesh ? 'i' : '') + (o.morphTargetInfluences ? 'm' : '');
      if (kinds.has(k)) { muted.push(o); o.castShadow = false; return; }
      kinds.add(k);
      if (o.frustumCulled) { unculled.push(o); o.frustumCulled = false; }
    });
    const sc = renderer.getScissorTest(), mask = camera.layers.mask;
    try {
      sun.shadow.needsUpdate = true; renderer.shadowMap.needsUpdate = true;
      renderer.setScissorTest(true); renderer.setScissor(0, 0, 1, 1); camera.layers.set(31);
      renderer.render(scene, camera);
    } finally {
      camera.layers.mask = mask;
      renderer.setScissorTest(sc);
      for (const o of shownNow) o.visible = false;
      for (const o of unculled) o.frustumCulled = true;
      for (const o of muted) o.castShadow = true;
    }
    return kinds.size;
  };
  // Behind the start screen: the lighting set-up play starts with (the effect lights not counted: src/fxlights.js).
  // The other one - an effect light lit: the POLAIR searchlight, a muzzle flash, fireworks, a crash fire - is built in
  // the background after Play, a few objects a frame (warmFxLater): it was half of this wait, for lights that are dark
  // nearly all the time.
  const tw = { t: performance.now() }, lap = k => { const n = performance.now(); tw[k] = Math.round(n - tw.t); tw.t = n; };
  for (const shown of [false]) {
    fxLightsShow(shown);
    await compileAll(); lap('compile');
    tw.casterKinds = shadowAll(); lap('shadows');
    const lampsWere = lampPools ? lampPools.visible : false;
    if (lampPools) lampPools.visible = true;
    vlights?.warm(true);                                  // (the lamp flares, beams and light-bar washes)
    for (const c of clouds) c.visible = true;
    // (the post-processing target's set: drawn through it only while night glow or ambient occlusion is on - on a
    //  preset with neither, not built here: switched on later from the Esc menu, fxlights.js builds what's missing)
    if (GFX.value('bloom') || GFX.value('gtao')) {
      renderer.setRenderTarget(composer.renderTarget1);
      try { await renderer.compileAsync(scene, camera); } finally { renderer.setRenderTarget(null); }
    }
    lap('target');
    sun.shadow.needsUpdate = true;   // (the shadow pass too: its depth programs - e.g. a taken e-bike's, delivery.warm)
    if (GFX.value('bloom') || GFX.value('gtao')) { bloom.enabled = true; composer.render(); bloom.enabled = false; }   // the bloom / output passes' own programs
    lap('bloom');
    if (lampPools) lampPools.visible = lampsWere;
    vlights?.warm(false);
    for (const c of clouds) c.visible = c.material.opacity > 0.02;
    limeRide.precompile(renderer, camera, scene, composer.renderTarget1);   // the riding body's shader: started, not awaited
  }
  water?.warm(false);
  ferry?.warm(false);
  river?.warm(false);
  delivery?.warm(false);
  world.boundary?.warm(false);
  knock?.warm?.(false);
  farCars?.warm(false);
  crime?.drift?.warm(false);
  specks.removeFromParent();
  for (const o of tops) templates.remove(o);
  templates.removeFromParent();
  // Finish every program now, not on its first draw: three.js links a program's uniforms (and checks its log) the first
  // time something is drawn with it, and with the compile still running in the driver that call waits for it. Walking
  // off from the spawn drew dozens of programs for the first time (the shadow pass's among them): a 5 s freeze on a
  // phone-emulated page (tools/perf/mobile_walk.mjs). Here it's part of "Warming up the shaders".
  { const t = performance.now(); let n = 0; for (const p of renderer.info.programs) { try { p.getUniforms(); p.getAttributes(); n++; } catch { /* lost */ } }
    lap('finish');
    console.info(`[shaders] ${n} programs finished in ${Math.round(performance.now() - t)} ms; ms: ${JSON.stringify(tw)}`); }
  lastNight = -1;   // the next updateDayNight re-applies the night set (lamp pools, headlights, bloom) for the real time
  // (shaders first built in play get the other set-up built too: the post-processing target's while bloom / AO is on)
  fxLightsSetup({ renderer, scene, camera, target: () => (bloom.enabled || gtao.enabled ? composer.renderTarget1 : null) });
}
// After Play: the effect-light set-up's programs (see warmShaders), built in the background a slice at a time - each
// slice's objects compiled with the set shown, the set hidden again before the frame is drawn (the lights are dark
// anyway), then their programs finished once the driver has them. ~4 ms of the main thread a slice, on idle time.
let fxWarmed = false;
async function warmFxLater() {
  if (fxWarmed) return; fxWarmed = true;
  const t0 = performance.now(), objs = [];
  scene.traverse(o => { if (o.material && (o.isMesh || o.isPoints || o.isLine || o.isSprite)) objs.push(o); });
  const list = [], batch = { traverse(f) { for (let i = 0; i < list.length; i++) f(list[i]); }, traverseVisible() {} };
  const idle = () => new Promise(r => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 40)));
  const seen = new Set(), before = new Set(renderer.info.programs);
  let i = 0, slices = 0;
  while (i < objs.length) {
    await idle();
    if (!started) continue;
    const ts = performance.now(); list.length = 0;
    while (i < objs.length && performance.now() - ts < 4) {
      const o = objs[i++], m = o.material, k = Array.isArray(m) ? m.map(x => x.uuid).join() : m.uuid;
      if (seen.has(k + (o.isSkinnedMesh ? 's' : o.isInstancedMesh ? 'i' : ''))) continue;
      seen.add(k + (o.isSkinnedMesh ? 's' : o.isInstancedMesh ? 'i' : ''));
      list.push(o);
      if (list.length >= 12) break;
    }
    if (!list.length) continue;
    const was = fxLightsShow(true);
    let p = null;
    try { p = renderer.compileAsync(batch, camera, scene); } finally { if (was) fxLightsShow(false); }
    slices++;
    await p?.catch(() => {});
  }
  // finish the new programs (their compiles are done: compileAsync waited for them), a few at a time
  const fresh = renderer.info.programs.filter(p => !before.has(p));
  for (let k = 0; k < fresh.length; k += 8) { await idle(); for (const p of fresh.slice(k, k + 8)) { try { p.getUniforms(); p.getAttributes(); } catch { /* gone */ } } }
  fxLightsSetup({ renderer, scene, camera, target: () => (bloom.enabled || gtao.enabled ? composer.renderTarget1 : null) });
  console.info(`[shaders] effect-light set-up: ${fresh.length} programs in ${slices} slices, ${Math.round((performance.now() - t0) / 1000)} s in the background`);
}
// Lite, after Play: the knocked props' stand-ins' programs (src/knock.js warm: a speck of each material) built in the
// background - one speck a slice with compileAsync, each waited for, then each program finished on its own idle slice
// (letting src/shaderwatch.js build them as a batch left one finish waiting ~120 ms on the others), never alongside
// shaderwatch's own builds or the SERT warm-up's (src/swat.js). The specks are never in the scene while it runs.
async function warmKnockLite() {
  if (!knock?.warm || knock._warmG) return;
  knock.warm(true); const g = knock._warmG; if (!g) return;
  g.removeFromParent(); knock._warmG = null;
  const busy = () => document.hidden || !started || shaderWatch.busy || shaderWatch.pending > 0 || shaderWatch.queued > 0 || !!swat?.warm?.inflight;
  const idle = async () => { const t0 = performance.now(); do await new Promise(r => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 40))); while (busy() && performance.now() - t0 < 30000); };
  const list = [], holder = { traverse(f) { for (let i = 0; i < list.length; i++) f(list[i]); }, traverseVisible() {} }, used = new Set();
  for (const o of [...g.children]) {
    await idle();
    list.length = 0; list.push(o); o.matrixWorld.copy(g.matrixWorld);
    const p = renderer.compileAsync(holder, camera, scene); list.length = 0;
    const q = renderer.properties.get(o.material)?.currentProgram; if (q) used.add(q);
    await p.catch(() => {});
  }
  for (const q of used) { await idle(); try { q.getUniforms(); q.getAttributes(); } catch { /* gone */ } }
  g.children[0]?.geometry?.dispose();   // (the specks' one box; their materials are the props' own, kept)
}
function weatherText() {
  const h = (gameMinutes / 60) % 24;
  const t = Math.round(16 + 11 * Math.max(0, Math.sin((h - 8) / 16 * Math.PI)));
  return `${t}°C · ${h > SUNSET + 0.3 || h < SUNRISE - 0.3 ? 'clear night' : h > SUNSET - 0.8 ? 'sunset' : 'sunny'}`;
}

// ------------------------------------------------------------------ minimap + big map (from the OSM surface raster)
// Surface codes: 0 void, 1 river, 2 road, 3 footpath, 4 plaza, 5 grass, 6 building, 7 bridge deck, 8 busway, 9 sand,
// 10 lagoon/pond, 11 path, 12 Queen St Mall, 13 garden bed.
const MAP_PALETTE = [
  [196, 192, 178], [96, 142, 184], [70, 72, 78], [222, 216, 204], [230, 220, 196], [150, 196, 124],
  [196, 172, 140], [200, 200, 206], [128, 72, 64], [236, 216, 164], [72, 196, 206],
  [214, 206, 180], [241, 207, 122], [120, 168, 96]];
let mapBase = null, bigBase = null, bigMapT = 0;
const MAP = { x0: 0, z0: 0, w: 1, h: 1, s: 1, bs: 0.5 };
function mapLabels() {
  // one label per ~260 m of each named street; no two labels of the same street within 170 m, none overlapping
  const out = [], placed = [];
  const skip = new Set(['motorway', 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link', 'busway', 'service']);
  const roads = W.roads.filter(r => r.name && r.play && CAR_TYPES.has(r.hw) && !skip.has(r.hw) && !(r.bridge && r.layer >= 1))
    .sort((a, b) => (b.w || 0) - (a.w || 0));
  for (const r of roads) {
    const name = W.shortRoadName(r.name).toUpperCase(), pts = r.pts;
    let acc = 120;
    for (let i = 1; i < pts.length; i++) {
      const ax = pts[i - 1][0], az = pts[i - 1][1], bx = pts[i][0], bz = pts[i][1], l = Math.hypot(bx - ax, bz - az);
      acc += l;
      if (acc < 200 || l < 30) continue;
      const x = (ax + bx) / 2, z = (az + bz) / 2;
      if (!W.playable(x, z)) continue;
      if (placed.some(p => (p.name === name && Math.hypot(p.x - x, p.z - z) < 170) || Math.hypot(p.x - x, p.z - z) < 36)) continue;
      let ang = Math.atan2(bz - az, bx - ax); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      placed.push({ name, x, z }); out.push({ name, x, z, ang, road: true }); acc = 0;
    }
  }
  return out;
}
function mapPlaces() {
  const out = [];
  const addP = (label, p) => { if (p && W.playable(p.x, p.z) && !out.some(o => Math.hypot(o.x - p.x, o.z - p.z) < 40)) out.push({ name: label, x: p.x, z: p.z }); };
  for (const l of world.landmarks) if (/City Hall|King George Square$|Wheel of Brisbane|BRISBANE sign|^Streets Beach$|Grand Arbour|Nepal Peace Pagoda/.test(l.name)) addP(l.name, l);
  for (const [label, q] of [['Queen St Mall', 'Queen Street Mall'], ['Anzac Square', 'Anzac Square'], ['Central Station', 'Brisbane Central'], ['Old Windmill', 'The Old Windmill'],
    ['City Botanic Gardens', 'City Botanic Gardens'], ['Treasury', 'Treasury Building'], ['Roma St Parkland', 'Roma Street Parkland'], ['Wickham Park', 'Wickham Park'],
    ['Post Office Square', 'Post Office Square'], ['Parliament House', 'Parliament House'], ['Customs House', 'Customs House'], ['QUT Gardens Point', 'QUT Gardens Point'],
    ['Victoria Bridge', 'Victoria Bridge'], ['Kurilpa Bridge', 'Kurilpa Bridge'], ['Goodwill Bridge', 'Goodwill Bridge'], ['Riverside Centre', 'Riverside Centre'],
    ['QPAC', 'Queensland Performing Arts Centre'], ['State Library', 'State Library of Queensland'], ['GOMA', 'Gallery of Modern Art'], ['Cultural Centre', 'Cultural Centre Station'],
    ["St Stephen's Cathedral", "St Stephen's Cathedral"], ['GPO', 'General Post Office']]) {
    const p = W.place(q);
    if (p && (label !== 'Central Station' || p.x > -500)) addP(label, p);
  }
  return out;
}
function mapRegions() {
  // BRISBANE RIVER over open water, SOUTH BANK / KANGAROO POINT / SPRING HILL from the bank sides
  const out = [], S = W.S;
  const water = [];
  for (let z = S.z0 + 60; z < S.z0 + S.h - 60; z += 40) for (let x = S.x0 + 60; x < S.x0 + S.w - 60; x += 40) {
    if (W.surfaceAt(x, z) !== 1) continue;
    if (W.surfaceAt(x - 45, z) === 1 && W.surfaceAt(x + 45, z) === 1 && W.surfaceAt(x, z - 45) === 1 && W.surfaceAt(x, z + 45) === 1) water.push({ x, z });
  }
  // land regions first (on land, clear of the landmark labels), then one river label per ~650 m of open water that
  // stays clear of them
  const sb = W.place('South Bank Parklands'); if (sb) out.push({ name: 'SOUTH BANK', x: sb.x - 20, z: sb.z + 20, region: true, col: '#2d5a1f' });
  let kx = 0, kz = 0, kn = 0;
  for (let z = S.z0; z < S.z0 + S.h; z += 30) for (let x = S.x0; x < S.x0 + S.w; x += 30) if (W.side(x, z) === 3 && W.surfaceAt(x, z) !== 1 && W.surfaceAt(x, z) !== 0) { kx += x; kz += z; kn++; }
  if (kn > 20) out.push({ name: 'KANGAROO POINT', x: kx / kn, z: kz / kn, region: true, col: '#6b4a20' });
  out.push({ name: 'BRISBANE CITY', x: 455, z: 215, region: true, col: '#5a3a3a' });     // between Elizabeth, Edward and Mary Sts
  for (const p of water) if (!out.some(o => Math.hypot(o.x - p.x, o.z - p.z) < (o.name === 'BRISBANE RIVER' ? 650 : 280))) out.push({ name: 'BRISBANE RIVER', x: p.x, z: p.z, region: true, col: '#1f4466' });
  return out;
}
function buildMapBase() {
  const S = W.S;
  Object.assign(MAP, { x0: S.x0, z0: S.z0, w: S.w, h: S.h });
  const img = W.surfaceRGBA(MAP_PALETTE.map(c => [c[0], c[1], c[2], 255]), 1);
  const raw = document.createElement('canvas'); raw.width = img.width; raw.height = img.height;
  raw.getContext('2d').putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(raw, 0, 0);
  const labels = mapLabels(), places = mapPlaces(), regions = mapRegions();
  MAP.labels = labels; MAP.places = places; MAP.regions = regions;
  const X = x => (x - MAP.x0), Z = z => (z - MAP.z0);
  const text = (g, t, x, y, font, fill, halo = 'rgba(255,255,255,0.85)', hw = 3) => { g.font = font; g.lineWidth = hw; g.strokeStyle = halo; g.strokeText(t, x, y); g.fillStyle = fill; g.fillText(t, x, y); };
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const L of labels) { g.save(); g.translate(X(L.x), Z(L.z)); g.rotate(L.ang); text(g, L.name, 0, 0, 'bold 10px Arial', '#2b2b2b'); g.restore(); }
  for (const L of regions) text(g, L.name, X(L.x), Z(L.z), 'bold 15px Arial', L.col, 'rgba(255,255,255,0.6)', 3);
  for (const L of places) {
    g.fillStyle = '#7a1f3d'; g.beginPath(); g.arc(X(L.x), Z(L.z), 3.5, 0, 7); g.fill();
    text(g, L.name, X(L.x), Z(L.z) + 11, 'bold 10px Arial', '#3a1020');
  }
  mapBase = c;
  // big map: the whole play area at 0.5 px/m with its own (readable) labels
  const b = document.createElement('canvas'); b.width = Math.ceil(img.width * MAP.bs); b.height = Math.ceil(img.height * MAP.bs);
  const bg = b.getContext('2d');
  bg.imageSmoothingEnabled = true; bg.imageSmoothingQuality = 'high';
  bg.drawImage(raw, 0, 0, img.width, img.height, 0, 0, b.width, b.height);
  const BX = x => (x - MAP.x0) * MAP.bs, BZ = z => (z - MAP.z0) * MAP.bs;
  bg.textAlign = 'center'; bg.textBaseline = 'middle'; bg.lineJoin = 'round';
  const bigPlaced = [];
  for (const L of labels) {
    if (bigPlaced.some(p => (p.name === L.name && Math.hypot(p.x - L.x, p.z - L.z) < 420) || Math.hypot(p.x - L.x, p.z - L.z) < 70)) continue;
    bigPlaced.push(L);
    bg.save(); bg.translate(BX(L.x), BZ(L.z)); bg.rotate(L.ang); text(bg, L.name, 0, 0, 'bold 10px Arial', '#222'); bg.restore();
  }
  for (const L of regions) text(bg, L.name, BX(L.x), BZ(L.z), 'bold 16px Arial', L.col, 'rgba(255,255,255,0.6)', 3);
  for (const L of places) {
    bg.fillStyle = '#7a1f3d'; bg.beginPath(); bg.arc(BX(L.x), BZ(L.z), 3.5, 0, 7); bg.fill();
    text(bg, L.name, BX(L.x), BZ(L.z) + 11, 'bold 11px Arial', '#3a1020');
  }
  bigBase = b;
}
function drawMinimap() {
  if (!mapBase) return;
  const S = 220, s = 1.35;
  mm.save();
  mm.fillStyle = 'rgb(196,192,178)'; mm.fillRect(0, 0, S, S);
  mm.translate(S / 2, S / 2);
  mm.scale(s, s);
  // only the visible window of the 1 px/m base
  const half = S / 2 / s + 2, sx = Math.floor(player.x - MAP.x0 - half), sz = Math.floor(player.z - MAP.z0 - half), sw = Math.ceil(half * 2);
  mm.drawImage(mapBase, sx, sz, sw, sw, sx - (player.x - MAP.x0), sz - (player.z - MAP.z0), sw, sw);
  water?.drawMap?.(mm, player.x, player.z);   // the bull shark zones, while you're in the river (src/water/index.js)
  const dot = (x, z, col, r = 3) => { mm.fillStyle = col; mm.beginPath(); mm.arc(x - player.x, z - player.z, r, 0, 7); mm.fill(); };
  // Lime scooters in range: lime-green dots (darker = tipped over) with a dark rim so they read on park green too
  for (const fallen of [false, true]) {
    mm.beginPath();
    for (const sc of scooters) {
      if (sc === player.riding || sc.fallen !== fallen || Math.abs(sc.x - player.x) > 90 || Math.abs(sc.z - player.z) > 90) continue;
      const x = sc.x - player.x, z = sc.z - player.z; mm.moveTo(x + 2.2, z); mm.arc(x, z, 2.2, 0, 7);
    }
    mm.fillStyle = fallen ? '#2a7d1f' : '#2fd12a'; mm.strokeStyle = '#0d3a08'; mm.lineWidth = 0.8; mm.fill(); mm.stroke();
  }
  for (const c of crackheads) if (c.state !== 'gone' && c.dist < 70) dot(c.x, c.z, c.state === 'aggro' ? '#ff2020' : '#d88', 2.8);
  eshays?.drawMap(dot);
  if (police?.mesh) dot(police.mesh.position.x, police.mesh.position.z, '#2050ff', 4);   // (your 000 call's unit, on its way and there)
  for (const u of crime?.S.units || []) dot(u.x, u.z, Math.floor(time * 4) % 2 ? '#2050ff' : '#ff2020', 4);
  swat?.drawMap(mm, player.x, player.z, time);   // BearCats, SERT operators, POLAIR
  const m = !missions?.active && STOPS[player.done];
  if (m) {
    let dx = m.x - player.x, dz = m.z - player.z; const d = Math.hypot(dx, dz), lim = 72;
    if (d > lim) { dx *= lim / d; dz *= lim / d; }
    mm.fillStyle = '#f2c418'; mm.strokeStyle = '#000'; mm.lineWidth = 1;
    mm.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 - Math.PI / 2, r = k % 2 ? 2.4 : 5.5; mm.lineTo(dx + Math.cos(a) * r, dz + Math.sin(a) * r); } mm.closePath(); mm.fill(); mm.stroke();
  }
  if (online?.active) {   // the other players: an orange dot, held at the edge when they're off the map (as the stop star)
    mm.fillStyle = '#ff8c1a'; mm.strokeStyle = '#fff'; mm.lineWidth = 1.2;
    for (const r of online.remotes.values()) {
      if (!r.n || !(r.px === r.px)) continue;
      let dx = r.px - player.x, dz = r.pz - player.z; const d = Math.hypot(dx, dz), lim = 74;
      if (d > lim) { dx *= lim / d; dz *= lim / d; }
      mm.beginPath(); mm.arc(dx, dz, d > lim ? 2.6 : 3.4, 0, 7); mm.fill(); mm.stroke();
    }
  }
  mm.restore();
  missions?.drawMap(mm, (x, z) => [110 + (x - player.x) * s, 110 + (z - player.z) * s], { clip: { cx: 110, cy: 110, r: 110 }, scale: s });
  faults?.drawMinimap(mm, player.x, player.z, s);   // reported faults (src/faults.js)
  // player arrow
  mm.save(); mm.translate(S / 2, S / 2);
  mm.rotate(Math.atan2(Math.cos(player.heading), Math.sin(player.heading)) + Math.PI / 2);
  mm.fillStyle = '#7a1f3d'; mm.strokeStyle = '#fff'; mm.lineWidth = 2;
  mm.beginPath(); mm.moveTo(0, -8); mm.lineTo(6, 6); mm.lineTo(0, 3); mm.lineTo(-6, 6); mm.closePath(); mm.fill(); mm.stroke();
  mm.restore();
}
function drawBigMap() {
  const c = $('bigmapCanvas'); c.width = bigBase.width; c.height = bigBase.height;
  const g = c.getContext('2d'); g.drawImage(bigBase, 0, 0);
  const X = x => (x - MAP.x0) * MAP.bs, Z = z => (z - MAP.z0) * MAP.bs;
  const m = !missions?.active && STOPS[player.done];
  g.lineWidth = 3; g.strokeStyle = '#fff';
  if (m) { g.fillStyle = '#f2c418'; g.beginPath(); g.arc(X(m.x), Z(m.z), 8, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#000'; g.font = 'bold 13px Arial'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeText(m.text, X(m.x), Z(m.z) - 16); g.fillText(m.text, X(m.x), Z(m.z) - 16); }
  missions?.drawMap(g, (x, z) => [X(x), Z(z)], { big: true, scale: MAP.bs });
  faults?.drawBigMap(g, X, Z);
  if (online?.active) {   // the other players, named
    g.textAlign = 'center'; g.font = 'bold 12px Arial';
    for (const r of online.remotes.values()) {
      if (!r.n || !(r.px === r.px)) continue;
      g.fillStyle = '#ff8c1a'; g.strokeStyle = '#fff'; g.lineWidth = 3;
      g.beginPath(); g.arc(X(r.px), Z(r.pz), 6, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#5a2a00'; g.strokeText(r.name || 'Player', X(r.px), Z(r.pz) - 13); g.fillText(r.name || 'Player', X(r.px), Z(r.pz) - 13);
    }
  }
  g.fillStyle = '#7a1f3d'; g.strokeStyle = '#fff'; g.lineWidth = 3;
  g.beginPath(); g.arc(X(player.x), Z(player.z), 7, 0, 7); g.fill(); g.stroke();
}

// ------------------------------------------------------------------ HUD update
let lastPlace = '', placeT = 0, hudT = 0;
const v3 = new THREE.Vector3();
function updateHUD(dt) {
  updateMic(); drawCaptions(); perfHud.update(dt); hudTidy?.update(dt);                           // (Speech.tick: in simulateStep, game time)
  toastT -= dt; setStyle(hud.toast, 'opacity', toastT > 0 ? '1' : '0');
  setStyle(hud.hp, 'width', Math.round(player.hp * 10) / 10 + '%');           // (a tenth of a percent: no visible step)
  // bubbles
  for (const c of crackheads) {
    c.bubbleT -= dt;
    if (c.bubbleT > 0 && c.state !== 'gone' && c.dist < 40) {
      v3.set(c.x, LY.groundY(c.x, c.z) + 2.3, c.z).project(camera);
      if (v3.z < 1) { setStyle(c.bubble, 'display', 'block'); setStyle(c.bubble, 'left', ((v3.x + 1) / 2 * view.w).toFixed(1) + 'px'); setStyle(c.bubble, 'top', ((1 - v3.y) / 2 * view.h).toFixed(1) + 'px'); }
      else setStyle(c.bubble, 'display', 'none');
    } else setStyle(c.bubble, 'display', 'none');
  }
  hudT -= dt;
  if (hudT > 0) return;
  hudT = 0.1;
  hud.wallet.textContent = '$' + player.money.toFixed(2);
  hud.cred.textContent = `Stops ${player.done}/${STOPS.length} · Crackheads fought off: ${player.cred}`;
  const place = W.placeName(player.x, player.z);
  if (place !== lastPlace) { lastPlace = place; hud.place.textContent = place; placeT = 4; }
  placeT -= 0.1; hud.place.style.opacity = placeT > 0 ? 1 : 0.35;
  const hh = Math.floor(gameMinutes / 60) % 24, mi = Math.floor(gameMinutes % 60);
  hud.clock.textContent = `${((hh + 11) % 12) + 1}:${String(mi).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'} AEST · ${weatherText()}`;
  // Lime panel
  const fh = ferry?.hud();   // at a CityCat's helm (src/ferry/index.js)
  if (fh) {
    hud.lime.classList.remove('hidden');
    hud.lime.querySelector('.brand').textContent = fh.brand;
    hud.kmh.textContent = fh.kmh;
    hud.zone.textContent = crime.S.wanted ? 'WANTED ' + '★'.repeat(crime.S.wanted) : fh.sign;
    hud.zone.className = crime.S.wanted ? 'noride' : 'road';
    const hEl = hud.helmet || (hud.helmet = $('helmet')); if (hEl) hEl.style.display = 'none';
    hud.fare.textContent = fh.help; hud.battery.textContent = fh.help2;
  } else if (player.driving) {
    hud.lime.classList.remove('hidden');
    const bh = busjack?.hud(player.driving);
    hud.lime.querySelector('.brand').textContent = bh ? bh.brand : online?.active ? `${online.room || 'the room'}'s ${CAR_NAMES[player.driving.mesh?.userData?.model] || player.driving.type}` : player.driving.police ? 'QPS (stolen)' : 'stolen ' + (CAR_NAMES[player.driving.mesh?.userData?.model] || player.driving.type.replace('_', ' '));   // (online: one of the room's shared cars, nobody's to steal)
    hud.kmh.textContent = Math.round(Math.abs(player.driving.v) * 3.6);
    hud.zone.textContent = online?.active ? `${online.players} online` : crime.S.wanted ? 'WANTED ' + '★'.repeat(crime.S.wanted) : 'Nobody saw… yet';
    hud.zone.className = crime.S.wanted ? 'noride' : 'road';
    const hEl = hud.helmet || (hud.helmet = $('helmet')); if (hEl) hEl.style.display = 'none';   // (the Lime helmet line)
    hud.fare.textContent = bh ? bh.help : 'W/S drive · A/D steer · Space handbrake'; hud.battery.textContent = bh ? bh.help2 : player.driving.police ? 'H horn · Y siren · Z/X blinkers · E get out' : 'H horn · Z/X blinkers · E get out';
  } else if (player.riding) {
    const eb = player.riding.ebike, dh = eb ? delivery.hud(player.riding) : null;
    hud.lime.querySelector('.brand').textContent = eb ? dh.brand : 'lyme';
    hud.lime.classList.remove('hidden');
    const z = player.zone;
    hud.kmh.textContent = Math.round(player.riding.v * 3.6);
    hud.zone.textContent = eb ? z.name : rideZoneLabel(z); hud.zone.className = z.cls;
    const hEl = hud.helmet || (hud.helmet = $('helmet')), hh = !eb && helmet ? helmet.hud() : null;   // the Lime helmet (src/helmet.js)
    if (hEl) { hEl.style.display = hh ? '' : 'none'; if (hh) { hEl.textContent = hh.text; hEl.className = hh.cls; } }
    if (eb) { hud.fare.textContent = dh.help; hud.battery.textContent = dh.help2; }
    else {
      const mins = Math.ceil(player.rideT / 60);
      hud.fare.textContent = `${Math.floor(player.rideT / 60)}:${String(Math.floor(player.rideT % 60)).padStart(2, '0')} · est. $${(UNLOCK + mins * PER_MIN).toFixed(2)}`;
      hud.battery.textContent = `🔋 ${Math.round(player.riding.battery)}%`;
    }
  } else hud.lime.classList.add('hidden');
  // prompts
  let prompt = '';
  const ov = online?.active && !player.riding && !player.driving && !online.seated && !limeRide.busy ? online.nearestVehicle(3.6) : null;   // (online: one of the room's cars in reach - E takes it first, interact())
  if (limeRide.busy) prompt = '';     // stepping on / off
  else if (online?.active && player.driving) prompt = Math.abs(player.driving.v) > 3 ? 'Slow down to get out' : 'E — get out';
  else if (online?.active && online.seated) prompt = 'E — get out';
  else if (ov) prompt = ov.driver ? 'E — ride along' : 'E — take this car';
  else if (online?.active && !player.riding && !player.driving && !online.seated && online.nearestRider?.(2.4)) prompt = 'E — hop on the back';
  else if (player.riding) prompt = player.riding.ebike ? delivery.prompt() : (player.riding.v > 1.5 ? '' : (W.inMall(player.x, player.z) ? 'No parking in the Mall' : 'E — end ride & park'));
  else {
    const dp = delivery?.prompt() || (streetLife?.bikeNear?.(player.x, player.z, 2.4) ? "E — take the kid's e-bike" : '');
    if (dp) prompt = dp;
    else {
      const sc = nearestScooter(2.2);
      if (sc) prompt = sc.fallen ? 'E — stand the Lyme back up' : `E — unlock Lyme ($1.00 + ${Math.round(PER_MIN * 100)}c/min) · 🔋${Math.round(sc.battery)}%`;
      if (crime?.canEnter() && !nearestScooter(1.2)) { const nc = crime.nearestCar?.(); prompt = busjack?.enterPrompt(nc) || 'E — steal this ' + (CAR_NAMES[nc?.c?.mesh?.userData?.model] || 'car'); }
      const bp = !nearestScooter(1.2) && !crime?.canEnter() ? streetLife?.prompt() : '';   // a busker in reach (interact() order)
      const tp = chars26?.prompt() || npcAI?.prompt(); if (bp) prompt = bp + (tp ? '   ·   ' + tp : ''); else if (tp && !prompt) prompt = tp;
    }
    const fd = wildlife?.food?.prompt();   // (your food: eat it / SHOO the bin chickens; food in reach: pick it up)
    if (fd) prompt = fd;                   // (E does the food first in interact(): the prompt says so)
    if (weaponFirst()) prompt = weapons.prompt();   // (unless a weapon / your thong is the nearer thing: E takes that)
    const beg = crackheads.find(c => c.state === 'beg' && c.dist < 4);
    if (beg) prompt = 'G — give him $2   ·   F — punch   ·   or just walk off';
    if ((crackheads.some(c => c.state === 'aggro' && c.dist < 30) || eshays?.threat()) && !police?.unit) prompt = (prompt ? prompt + '   ·   ' : '') + 'P — call Triple Zero';
  }
  const fp = !player.riding && !player.driving ? ferry?.prompt() : '';   // a CityCat: board, the helm, step off, the timetable
  if (fp && (ferry?.aboard || !prompt || /^E — board|^E — climb/.test(fp))) prompt = fp;
  hud.prompt.textContent = prompt;
}

// ------------------------------------------------------------------ crossing beepers (real signalised junctions)
const xing = { j: null, state: 'R', since: 9 };
function crossingSound(dt) {
  const J = LY.nearestJunction(player.x, player.z, 26);
  if (!J) { xing.j = null; return; }
  const j = J.j;
  let st = 'R';
  for (let g = 0; g < (j.groups || 1); g++) if (RN.walkState(j.id, g, time) === 'G') { st = 'G'; break; }
  if (j !== xing.j) { xing.j = j; xing.state = st; xing.since = 9; }
  else if (st !== xing.state) { xing.state = st; xing.since = 0; }
  else xing.since += dt;
  sfx.crossing(J.d, st, xing.since);
}

// ------------------------------------------------------------------ main loop
const obstacles = [];
const playerOb = { x: 0, z: 0, r: 0.35, kind: 'player', push: null, car: null };
const pushPlayer = (dx, dz) => { player.x += dx; player.z += dz; };
const pushDriving = (dx, dz) => { player.driving.x += dx; player.driving.z += dz; };
// Real time -> game time (src/frameclock.js): the time since the last frame is simulated in sub-steps of at most 0.05 s
// (so at 10-15 FPS the city runs at the right speed instead of in slow motion), at most 0.25 s of it per frame, and a
// gap of more than a second (a background tab coming back) is not caught up. One render per frame, after the last step.
let menuViewDirty = true;
addEventListener('resize', () => { menuViewDirty = true; });
let last = performance.now(), manualClock = false;   // manualClock: __game.loopAt drives the loop (frame-timing tests)
const pace = {};                                  // (the phones' frame cap: src/frameclock.js paceFrame)
const pausedDraw = createPausedDrawGate();
const refresh = refreshMeter();                   // (the display's refresh, measured: the cap is a whole number of refreshes)
function loop(now) {
  requestAnimationFrame(loop);
  refresh.sample(now);
  if (!manualClock) {
    // (all devices: capped at the selected rate; phones at most 60, on the cap's own phase - src/frameclock.js paceFrame: the
    //  old "at least 1/30 s - 0.5 ms since the last frame" drew at 25 FPS on a 100 Hz screen and dropped a whole slot
    //  - a 50 ms frame - whenever WebKit's timestamp came a hair early)
    if (started && !document.hidden && !graphicsLost) {
      // (the cap held to a whole number of the display's refreshes: src/frameclock.js capPeriod - an even frame time, no judder)
      if (!paceFrame(pace, now, capPeriod(Math.min((TOUCH || LITE) ? 60 : 144, GFX.value('targetFps') || 30), refresh.hz))) return;
    } else pace.last = undefined;
    advance(now);
  }
}
function advance(now) {
  if (document.hidden || graphicsLost) { last = now; return; }
  const real = (now - last) / 1000; last = now;
  if (memoryLab && started && memoryLab.mode !== 'normal') {
    memoryLab.advance();
    if (memoryLab.mode === 'render') { render(); memoryLab.render(); }
    else if (memoryLab.mode === 'simulation' || memoryLab.mode === 'present') {
      const { n, dt } = simSteps(real);
      for (let i = 0; i < n; i++) { simulateStep(dt); memoryLab.step(); }
      if (memoryLab.mode === 'present') presentFrame(n * dt);
    }
    return;
  }
  adaptive.sample(real * 1000, started && !paused && !document.hidden && $('bigmap').classList.contains('hidden'));
  const ON_ = !!online?.active;
  const { n, dt } = ON_ ? online.steps(real) : simSteps(weapons?.wheel.open ? real * 0.3 : real);   // (the weapon wheel open: time slows, GTA-style; online: the room's fixed ticks - what moves on them is drawn between them: tweenPresent)
  gfxMenu.update();                          // (the Esc menu: shown while paused, when frame() doesn't run)
  if (!started) { if (world && menuViewDirty) { updateCamera(0); render(); menuViewDirty = false; } return; }
  const menuUp = !$('bigmap').classList.contains('hidden') || paused;
  // online the world never stops (the owner, 2026-10-28: as GTA online) - the menu and the map open over it, you just stand
  if (menuUp && online?.active) { for (const k in keys) keys[k] = false; }
  const frozen = menuUp && !online?.active;
  if (frozen) {
    if (pausedDraw(true, menuViewDirty)) { render(); menuViewDirty = false; }
    return;
  }
  pausedDraw(false);
  if (!n && !ON_) { render(); return; }
  for (let i = 0; i < n; i++) {
    const t = Perf.t();
    if (ON_) tweenRestore();                 // (the tweened things back where the last step left them)
    simulateStep(dt);
    if (ON_) tweenCapture();                 // (where this step left them: the far end of the next frames' blend)
    if (t) Perf.step(performance.now() - t);
  }
  saveFlow.tick(n * dt);                     // (play time, the money watch, the autosave clock - it used to run only in frame(), the test path: 2026-10-26)
  const t = Perf.t();
  presentFrame(online?.active ? Math.min(real, 0.2) : n * dt); // online presentation runs every display frame, independently of the 30 Hz simulation
  if (t) Perf.present(performance.now() - t - (Perf._submit ?? 0));   // (the render is timed apart)
  Perf.frame(real * 1000);
  window.BrisbaneDiagnostics?.sample({ frameMs: real * 1000, playing: started ? 1 : 0,
    calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures,
    width: renderer.domElement.width, height: renderer.domElement.height });
  if (TOUCH || LITE) {
    playFrames++;
    if (playFrames % 150 === 0) crumb('play: running (mobile safety build)');
    // (10 minutes of play survived: the "last visit died" flag goes - src/device.js bs.lite; an Android phone is back on
    //  its own tier next visit. The lighter preset a crash chose stays saved: the player can raise it. 2026-10-18)
    if (!liteFlagCleared && started && time > 600) { liteFlagCleared = true; try { localStorage.removeItem('bs.lite'); } catch { /* no storage */ } }
  }
}
let carHit = null;   // the AI car hitting the player right now (hurtPlayer -> Ragdolls.hit)
function onTrafficHit(ob, car) {
  if (online?.active) return;   // (online beta: the traffic on this screen is local - it cannot touch the room's bodies or cars)
  if (ob.kind === 'player' && player.driving) {
    if (!crime.S.crashT || time - crime.S.crashT > 0.6) {
      // nudging the car ahead in a CBD queue is not a crime; a real hit (closing speed > ~15 km/h) is
      const hard = Math.abs(player.driving.v - car.v) > 4;
      crime.S.crashT = time; sfx.crash(undefined, undefined, Math.abs(player.driving.v - car.v)); cam.shake = Math.min(1, cam.shake + (hard ? 0.4 : 0.15)); player.driving.v *= player.driving.profile?.hitKeep ?? 0.5;
      if (hard) crime.crime('crash', 0.3);
    }
    return;
  }
  if (ob.kind === 'player' && player.down <= 0 && !online?.active) { carHit = car; hurtPlayer(12 + car.v * 3.5, car.x, car.z, 'car'); carHit = null; sfx.crash(); subtitle(pick(car.police ? ['QPS: "Get off the road, mate!"', 'You got cleaned up by a QPS car.'] : ['Driver: "Are you blind?! Get off the road!"', 'Driver: "Jesus, mate!"', "You got cleaned up by a " + (car.type === 'bus' || car.type === 'glider' ? 'Brisbane bus.' : car.type === 'ute' ? 'ute.' : 'car.')])); }   // (a QPS car's driver is an officer: src/osm/traffic.js c.police)
  if (ob.kind === 'eshay') eshays?.carHit(ob, car);
  if (ob.kind === 'crackhead' && ob.c.state !== 'down') { ob.c.hit(100, car.x, car.z, false); if (ob.c.state === 'down') Ragdolls.hit(ob.c.h, ob.c, { car, key: 't', state: 'down', onUp: upAndFlee }); if (ob.c.dist < 40) subtitle('Ooh — he just got cleaned up by a car.'); }
}
// knockable street furniture: every vehicle that could hit a pole this frame, before any of them moves
const knockVehicles = [];
let _knockShadow = null;   // (online: knock.js writes its speed loss to this prototype-chained shadow, never to the room's car)
function knockShadow(car) { if (!_knockShadow || Object.getPrototypeOf(_knockShadow) !== car) { _knockShadow = Object.create(car); _knockShadow.knockByRoom = true; } delete _knockShadow.v; return _knockShadow; }
// Online, knocked street furniture is the room's (src/sim/knockrules.js): the props it (or my own prediction) knocks
// over fall here as solo, out of world.col; one whose cell isn't drawn yet leaves world.col now and lies down on arrival
const knockLater = new Set();
function localKnockRec(i, x, z, k) {
  const R = knock?.reg?.recs; if (!R) return null;
  const r = R[i]; if (r && r.k === k && Math.abs(r.x - x) < 0.5 && Math.abs(r.z - z) < 0.5) return r;   // (the same registry order: the same bake)
  let best = null, bd = 0.5; for (const q of R) { if (q.k !== k) continue; const d = Math.abs(q.x - x) + Math.abs(q.z - z); if (d < bd) { bd = d; best = q; } }
  return best;
}
function knockVisual(i, x, z, k, car, sp, mine) {
  const rec = localKnockRec(i, x, z, k); if (!rec || rec.down || knockLater.has(rec)) return;
  const s = (car.v || 0) < 0 ? -1 : 1, dx = Math.sin(car.heading) * s, dz = Math.cos(car.heading) * s, mass = car.profile?.mass || 1.5;
  if (rec.bound && knock.knock(rec, mine ? knockShadow(car) : car, sp, mass, dx, dz)) {
    if (mine) cam.shake = Math.min(1, cam.shake + Math.min(0.35, 0.05 + (1 - knockKeep(KNOCK_KINDS[rec.k]?.loss || 0, mass)) * 0.8));   // (knock.js shakes only for player.driving itself)
    return;
  }
  for (const slot of rec.slots) if (slot.live) { world.col.remove(slot.o); slot.live = false; slot.owner = rec; }
  knockLater.add(rec);
}
function knockRespawn(i, x, z, k) {
  const rec = localKnockRec(i, x, z, k); if (!rec) return;
  if (knockLater.delete(rec)) { for (const slot of rec.slots) if (!slot.live) { const n = readdCollider(world.col, slot.o); if (n) { slot.o = n; slot.live = true; } } return; }
  if (rec.down) knock.respawn(rec);
}
function knockArrived() {   // (a prop the room knocked while its cell wasn't drawn here: lying down once it is)
  if (!knockLater.size) return;
  let n = 0;
  for (const rec of knockLater) {
    if (++n > 8) break;
    if (!rec.bound) continue;
    knockLater.delete(rec);
    knock.knock(rec, { x: rec.x - 2.6, z: rec.z, heading: Math.PI / 2, v: 3, len: 4.6, wid: 1.9, profile: { mass: 1.5 } }, 3, 1.5, 1, 0);
  }
}
function updateKnock(dt) {
  if (!knock) return;
  knockVehicles.length = 0;
  if (player.driving && !player.driving.elevated) knockVehicles.push(online?.active ? knockShadow(player.driving) : player.driving);   // (not the street under a deck; online: a shadow of the room's car - the furniture flies, the speed loss lands on the shadow, the room knows no furniture)
  const ms = player.driving && !player.driving.elevated ? busjack?.metroSections?.(player.driving) : null; if (ms) knockVehicles.push(ms[0], ms[1]);   // (the Metro's sections behind: src/busjack.js)
  const units = crime ? crime.S.units : null;
  if (units) for (let i = 0; i < units.length; i++) if (!units[i].elevated) knockVehicles.push(units[i]);
  const sert = typeof swat !== 'undefined' && swat ? (swat.S?.trucks || swat.trucks) : null;   // SERT Bearcats (src/swat.js)
  if (sert) for (let i = 0; i < sert.length; i++) knockVehicles.push(sert[i]);
  knock.update(dt, knockVehicles);
  if (online?.active) knockArrived();
  if (ms) busjack.knockDone();
}
// The frame is split in two (performance stage five):
//   simulateStep(dt)  the game itself, every sub-step: movement, collisions, the crowd, traffic, combat, police,
//                     missions, objectives, dialogue timers. Game time advances here.
//   presentFrame(fdt) what you see and hear, once per displayed frame after its steps (fdt: the game time they
//                     covered): lighting, the camera and the sun's shadow, vehicle LOD and people culling, the audio
//                     listener and loops, the HUD, the minimap, the render.
// A slow frame (several catch-up steps) no longer repeats the camera, culling, audio and HUD work for every step.
// Gameplay never reads render visibility: traffic obstacles are the people near enough to be simulated, drawn or not.
let simSiren = 0;                                // (the police siren level from the last step, for the audio)
/** one simulation step of dt seconds (the game, not its presentation) */
function simulateStep(dt) {
  time += dt; gameMinutes += online?.active ? online.minuteRate() * dt : dt / 6;   // (online: the room's pace - src/sim/clock.js, a short night)
  LOD.x = camera.position.x; LOD.z = camera.position.z;
  let pt = Perf.t();                         // (Perf laps: each system's time, when the recorder is on)
  updateKnock(dt);
  updatePlayer(dt);
  if (online?.active) online.afterStep();   // (the input and the body of this tick, to the room; its answers applied)
  cullScooters(dt);
  pt = Perf.lap(SYS.player, pt);
  for (const c of crackheads) { if (online?.active && !online.ownsNpc(c)) { if (c.h) c.h.root.visible = false; continue; } c.update(dt); }   // (online: a home crackhead runs on the nearest player's screen - src/multiplayer/online.js ownsNpc)
  eshays?.update(dt);
  updateRoamers(dt);
  updateRigs(dt);                            // over the resident-rig budget: the lowest-priority far bodies go
  pt = Perf.lap(SYS.gangs, pt);
  player.viewX = Math.sin(cam.yaw); player.viewZ = Math.cos(cam.yaw);   // peds refill the street behind the camera
  npcLife?.preUpdate(dt);                    // goals -> actions: commands only, no body moves here (src/npc/activities.js)
  pt = Perf.lap(SYS.npcLife, pt);
  peds.update(dt, time, player);
  pt = Perf.lap(SYS.peds, pt);
  locals.update(dt, player);
  chars26?.update(dt);                       // the 2026 characters: who's out, their bodies, their sequences
  if (calorie) {                             // Calories Guy: the solo game only (the online mode has the room's people)
    if (online?.active) { calorie.dispose(); calorie = null; if (window.__game) window.__game.calorie = null; }
    else {
      calorie.update(dt);
      if (TRY_CALORIE && started && !calorie.tried) { const m = calorie.meetAt(); if (m) { calorie.tried = true; window.__game.teleport(m.x, m.z, m.heading); } }
    }
  }
  pt = Perf.lap(SYS.locals, pt);
  weapons?.update(dt);                       // thrown / swung weapons (src/weapons.js; idle unless one is held or flying)
  hitReact?.update(dt);                      // (the weapon-hit lines' cooldowns, a passer-by's laugh a beat later)
  combat?.update(dt);                        // fights: after the crowd moved, before the NPC brains (src/combat.js)
  pt = Perf.lap(SYS.combat, pt);
  npcLife?.postUpdate(dt);                   // what really happened: arrived, sat, the player got there -> results
  pt = Perf.lap(SYS.npcLife, pt);
  obstacles.length = 0;
  // (a car up on a deck - or you on foot up there - is out of reach of the street traffic below; playerOb.car: traffic
  //  tests the car's real box)
  // (on foot, playerOb.y = your level: the traffic meets you only at it - the cars on the expressway when you're up on
  //  it, never the street's under it (map fault f0024: you were taken out of the traffic altogether up there, so the
  //  deck's cars drove through you and couldn't be stolen); src/osm/traffic.js LEVEL_GAP)
  const upOnDeck = !!player.driving?.elevated;
  playerOb.x = photo || upOnDeck ? 1e6 : player.x; playerOb.z = photo || upOnDeck ? 1e6 : player.z; playerOb.r = player.riding ? 0.5 : PLAYER_R; playerOb.push = player.driving ? (online?.active ? null : pushDriving) : pushPlayer;   // (online: a shove on foot reaches the room as a nudge; the room's car is moved by nothing local)
  playerOb.y = player.driving ? undefined : player.y;
  playerOb.car = player.driving || null;
  obstacles.push(playerOb);
  for (const c of crackheads) if (c.state !== 'gone' && W.isRoad(c.x, c.z)) obstacles.push(roadObstacles.roamer(c));
  eshays?.obstacles(obstacles);
  // (people near enough to be simulated are in the traffic's way whether or not they're drawn: culled off-screen, down,
  //  or fighting. Was p.h.root.visible, which a person lying on a road behind the camera didn't have)
  const pedR = peds.o?.hideDist ?? 125;
  for (const p of peds.list) if (Math.abs(p.x - player.x) <= pedR && Math.abs(p.z - player.z) <= pedR && W.isRoad(p.x, p.z)) obstacles.push(roadObstacles.pedestrian(p));
  crime.obstacles(obstacles);
  busjack.obstacles(obstacles);
  swat?.obstacles(obstacles);
  pt = Perf.lap(SYS.obstacles, pt);
  delivery?.update(dt, time, obstacles);   // delivery riders on e-bikes (src/delivery.js): ride, chase, fall, cull
  streetLife?.update(dt, time, obstacles); // Lime riders, kids, takeovers (on the road: obstacles), buskers (src/streetlife/*)
  pt = Perf.lap(SYS.delivery, pt);
  npcAI?.update(dt);                         // Mick: perception -> agent service -> reaction
  pt = Perf.lap(SYS.npcAI, pt);
  if (online?.active) { if (localTrafficOn) { localTrafficOn = false; for (const c of traffic.cars) if (c.mesh) c.mesh.visible = false; } }   // (online: the room's traffic, not this screen's)
  else { if (!localTrafficOn) { localTrafficOn = true; for (const c of traffic.cars) if (c.mesh) c.mesh.visible = true; } traffic.update(dt, time, obstacles, onTrafficHit, sfx, player); }
  if (!online?.active) taxis?.update(dt);   // a cab hailed, pulling up, a fare getting out (src/taxis.js; online the cabs are the room's traffic)
  busService?.update(dt);                    // people walking to the stops, onto the buses (src/busservice.js)
  updateHotspot(dt);                         // where the patrol car drifts (src/osm/traffic.js)
  pt = Perf.lap(SYS.traffic, pt);
  ibises?.update(dt, player, sfx);
  wildlife?.update(dt);                      // birds, swoops, lunch thieves, possums (src/wildlife/*)
  overheard?.update(dt);                     // a bit of someone's phone call as you pass (after the crowd has moved)
  moments?.update(dt);                       // bin chickens, magpies, hats
  Sequences.update(dt);                      // conversation sequences: the next line when the last one ends, aborts, scenes
  pt = Perf.lap(SYS.ambient, pt);
  world.update(online?.active ? online.roomTime() : time, dt);   // (online: the signal lenses on the room's clock, as its traffic lights are)
  world.focus(camera.position.x, camera.position.z);
  knock?.afterFocus();
  pt = Perf.lap(SYS.world, pt);
  simSiren = Math.max(updatePolice(dt), crime.S.sirenLevel, swat?.sirenLevel || 0, online?.active ? online.sirenLevel : 0);
  crime.update(dt);
  busjack.update(dt);
  vdamage?.update(dt);                       // smoke, fire fuses, explosions, debris (after every vehicle moved and crashed)
  splashFx?.update(dt);                      // spray and foam where someone went into the river (src/splash.js)
  water?.update(dt);                         // sharks, jet skis, a car going under, wakes and ripples (src/water/*)
  ferry?.update(dt);                         // the CityCats, your one at the helm, its wakes; you on its deck (src/ferry/*)
  river?.update(dt);                         // kayaks, rowers, tinnies, cruisers giving way to the ferries (src/river/*)
  helmet?.update(dt);                        // the helmet on your head: a rebuilt body, a new outfit's cap (src/helmet.js)
  swat?.update(dt);
  radio?.update(dt, player.driving?.type ?? null);
  pt = Perf.lap(SYS.police, pt);
  bodies?.update(dt);    // nobody inside anybody (src/bodies.js): after everyone moved, before the ragdolls and the camera
  colView?.update();     // (the contact debug view, when it is on: F7)
  pt = Perf.lap(SYS.bodies, pt);
  Ragdolls.update(dt);   // after every owner posed its Human; before the camera follows the player's body
  pt = Perf.lap(SYS.ragdolls, pt);
  missions?.update(dt);
  pt = Perf.lap(SYS.missions, pt);
  updateStops();                             // (the objective: reached it -> next one, $10)
  Speech.tick(dt);                           // subtitles expire, delayed NPC reactions fire, the voice queue moves (game time)
  Perf.lap(SYS.hud, pt);
}
// Trouble the patrol car drifts towards between jobs (src/osm/traffic.js hotspot): you, while wanted; else a crackhead
// having a go at someone, or an eshay pack causing grief near you. Looked at once a second.
let hotT = 0;
function updateHotspot(dt) {
  if ((hotT -= dt) > 0 || !traffic) return;
  hotT = 1;
  let h = null;
  if (crime?.S?.wanted > 0) h = { x: player.x, z: player.z };
  else {
    const c = crackheads.find(k => k.state === 'aggro' && k.dist < 250);
    if (c) h = { x: c.x, z: c.z };
    else if (eshays?.threat?.()) h = { x: player.x, z: player.z };
  }
  traffic.hotspot = h;
}
// Online on a Lime / an e-bike: the ride step places the bike and the rider once a room tick (30 Hz); drawn there, they
// moved every other frame on a 60 Hz screen and 0-1-2 ticks a frame on a phone (the judder the car had). Each frame
// they are shifted to the eased pose between the last two ticks (online.renderPose), the shift taken back first when no
// tick has placed them again since (it must never pile up).
const rideShift = { seq: -1, dx: 0, dz: 0, dh: 0, objs: [] };
function smoothRide() {
  const seq = online.seq, objs = rideShift.objs;
  if (rideShift.seq === seq) for (const o of objs) { o.position.x -= rideShift.dx; o.position.z -= rideShift.dz; o.rotation.y -= rideShift.dh; }
  objs.length = 0; rideShift.dx = rideShift.dz = rideShift.dh = 0; rideShift.seq = seq;
  const sc = player.riding;
  if (!sc || limeRide.stepping || player.down > 0) return;
  const rp = online.renderPose, dx = rp.x - player.x, dz = rp.z - player.z;
  if (!(Math.abs(dx) + Math.abs(dz) < 3)) return;   // (a teleport: as it is)
  let dh = rp.heading - player.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
  if (pHuman?.root) objs.push(pHuman.root);
  if (sc.root && sc.root !== pHuman?.root) objs.push(sc.root);
  for (const o of objs) { o.position.x += dx; o.position.z += dz; o.rotation.y += dh; }
  rideShift.dx = dx; rideShift.dz = dz; rideShift.dh = dh;
}
// Online the game steps on the room's 30 Hz ticks; what moves on its own between them - the police cars and their
// officers, SERT's trucks and men and POLAIR, the CityCats and the jet skis, crackheads and eshays, and you while the
// water, a vault or a CityCat has you - was drawn where each tick left it: on a 60 Hz screen a move every other frame,
// on a phone 0, 1 or 2 ticks a frame (the owner, 2026-10-28: "police chasing me ... same car issues"). Each is drawn
// between the last two ticks instead (the alpha of online.steps), and put back where the tick left it before the next
// one steps (so no system ever reads a drawn, in-between place). Pooled, no allocation a frame.
const TW = { map: new Map(), pool: [], stamp: 0, P: { px: 0, py: 0, pz: 0, cx: 0, cy: 0, cz: 0, seq: -1, on: false }, view: { x: 0, y: 0, z: 0, heading: 0 }, list: [] };
const _tq = new THREE.Quaternion();
function tweenTargets(L) {
  L.length = 0;
  const add = o => { if (o && o.isObject3D && o.parent) L.push(o); };
  for (const u of crime?.S.units || []) add(u.mesh);
  for (const o of crime?.S.officers || []) add(o.h?.root);
  const ss = swat?.S; if (ss) { for (const T of ss.trucks || []) add(T.mesh); for (const o of ss.officers || []) add(o.h?.root); add(ss.heli?.group); }
  for (const F of ferry?.svc?.ferries || []) add(F.mesh);
  for (const J of water?.skis || []) add(J.mesh);
  for (const c of crackheads) if (online?.ownsNpc?.(c)) add(c.h?.root);
  for (const m of eshays?.list || []) add(m.h?.root);
  if (player.vault || water?.active || ferry?.aboard) add(pHuman?.root);
  return L;
}
function tweenRestore() {   // (before a tick: everything where the last tick left it)
  for (const [o, e] of TW.map) { o.position.copy(e.c); o.quaternion.copy(e.cq); }
}
function tweenCapture() {   // (after a tick: its place is the blend's far end; the near end the tick before's, if it was there)
  const L = tweenTargets(TW.list), st = ++TW.stamp;
  for (let i = 0; i < L.length; i++) {
    const o = L[i]; let e = TW.map.get(o), fresh = !e;
    if (!e) { e = TW.pool.pop() || { p: new THREE.Vector3(), c: new THREE.Vector3(), pq: new THREE.Quaternion(), cq: new THREE.Quaternion(), st: 0 }; TW.map.set(o, e); }
    if (!fresh && e.c.distanceToSquared(o.position) < 25) { e.p.copy(e.c); e.pq.copy(e.cq); }   // (moved under 5 m: blended; a jump: as it is)
    else { e.p.copy(o.position); e.pq.copy(o.quaternion); }
    e.c.copy(o.position); e.cq.copy(o.quaternion); e.st = st;
  }
  for (const [o, e] of TW.map) if (e.st !== st) { TW.map.delete(o); TW.pool.push(e); }   // (gone from the list: let go, as it stands)
  const P = TW.P; P.px = P.on ? P.cx : player.x; P.py = P.on ? P.cy : player.y; P.pz = P.on ? P.cz : player.z; P.cx = player.x; P.cy = player.y; P.cz = player.z; P.on = true;
}
function tweenPresent() {   // (each frame: drawn between the two)
  const a = online.alpha ?? 1;
  for (const [o, e] of TW.map) {
    o.position.lerpVectors(e.p, e.c, a);
    _tq.copy(e.pq).slerp(e.cq, a); o.quaternion.copy(_tq);
  }
  const P = TW.P, v = TW.view;
  v.x = P.px + (P.cx - P.px) * a; v.y = P.py + (P.cy - P.py) * a; v.z = P.pz + (P.cz - P.pz) * a; v.heading = player.heading;
}
/** once per displayed frame, after its simulation steps; fdt: the game time they covered */
function presentFrame(fdt) {
  online?.present(fdt);                     // (the other players, the correction easing out)
  const freeBody = !!(player.vault || water?.active || ferry?.aboard);
  if (online?.active && !player.driving && !player.riding && !(player.down > 0) && !limeRide.stepping && !freeBody && !player.seated) {
    const p = online.renderPose; pHuman.setPos(p.x, p.y + player.stepY, p.z, p.heading);
  }
  if (online?.active && !window.__noTween) { smoothRide(); tweenPresent(); }   // (__noTween: the probes compare; on a Lime / an e-bike, and everything that moves on its own: drawn between the room's ticks, as a car)
  let pt = Perf.t();
  updateDayNight();                          // (lighting from the game time the steps reached; sets the sun direction)
  updateClock();
  pt = Perf.lap(SYS.daynight, pt);
  updateCamera(fdt);                         // (after the ragdolls posed the player's body; moves the sun's shadow too)
  sight.update(camera);                      // (src/sight.js: what the next steps' spawns and removals keep out of)
  delivery?.present();                      // (riders the step's cull left hidden who are in view now: shown this frame)
  water?.present(fdt);                       // (the underwater tint, the shark music: from where the camera is now)
  river?.present(fdt, camera);               // (the river craft's instances, bobbing, paddles, wakes: src/river/*)
  pt = Perf.lap(SYS.camera, pt);
  updateVehicleLOD();
  if (vlights) {   // your Lime / e-bike and the delivery riders' e-bikes: a lamp front and back (Limes ride lit day and night)
    if (player.riding) vlights.bike(player.x, player.y || 0, player.z, player.riding.ry ?? player.heading, player.riding.ebike ? 'bike' : 'scooter');   // (f0006: a Lime's own lamp spots)
    for (const r of delivery?.riders || []) if (r.state === 'ride' && r.vis) vlights.bike(r.x, r.y || 0, r.z, r.ry);
  }
  streetLife?.present(fdt, vlights);         // the riders posed on their (instanced) Limes / e-bikes, and their lamps
  vlights?.update(fdt, time, { dark: carDark, lit: carLit });   // every vehicle's lamps, from where it is now
  fxLightsUpdate(fdt);                       // the effect lights counted while one is lit (src/fxlights.js)
  skipEmptyDraws(fdt);
  farCull(fdt);
  cullPeople();
  crowd?.present(fdt, camera);               // who is on a rig and who is the GPU crowd, and the crowd's draw (src/crowd)
  if (crowd) peds?.presented?.();            // (batched walkers: at most once a displayed frame - src/osm/peds.js)
  pt = Perf.lap(SYS.lodCull, pt);
  sfx.update(fdt, { riding: !!player.riding || !!player.driving, speed: player.riding ? player.riding.v : player.driving ? engineNote(player.driving) : 0, throttle: player.throttle || 0, wheelie: wheelie.rev, siren: simSiren, listener: player, nearTrees: true });
  crossingSound(fdt);
  pt = Perf.lap(SYS.audio, pt);
  updateHUD(fdt);
  pt = Perf.lap(SYS.hud, pt);
  drawMinimap();
  if (online?.active && (bigMapT -= fdt) <= 0) { bigMapT = 1; if (!$('bigmap').classList.contains('hidden')) drawBigMap(); }   // (online the world goes on behind the open map: the players on it move)
  Perf.lap(SYS.minimap, pt);
  render();
}
/** one step and its presentation (debug and tests: __game.tick, __game.photo); draw = false: the step only */
// (the crash crumb, src/launch.js: which step of starting play a phone died at, read at the next visit)
const crumb = v => LoadCrumb.set(v);       // (per tab: src/loadcrumb.js)
let playFrames = 0, fxWarming = false, keepCrumb = false, liteFlagCleared = false;   // (the crash crumb: how far into play a phone got)
// (a tab closed or left normally is not a crash: the crumb goes; a tab the OS killed never gets here; a graphics reset
//  reloads the page on purpose and keeps its crumb)
if (typeof window !== 'undefined') window.addEventListener('pagehide', () => { if (!keepCrumb) LoadCrumb.clear(); });
function frame(dt, draw = true) {
  saveFlow.tick(dt);                         // (play time, the money watch, the autosave clock: a few comparisons)
  simulateStep(dt); if (draw) presentFrame(dt);
  if (started) { playFrames++; if (playFrames === 1) crumb('play: the first frame drawn'); else if (playFrames === 30) crumb('play: the first second'); else if (playFrames % 150 === 0 && playFrames <= 54000) crumb(`play: ${Math.round(playFrames / 30)} s in${fxWarming ? ' (effect lights warming up)' : ''}`); }
}

// ------------------------------------------------------------------ the Esc menu: graphics settings, and the overlay
// Shown while the game is paused (Esc). Clicks on it stay on it (only the game canvas resumes); every change applies at
// once and is saved for this browser (src/graphics.js).
const gfxMenu = (() => {
  const el = $('gfx'), presets = el.querySelector('.presets'), info = el.querySelector('.info');
  for (const k of MENU_PRESETS) {
    const p = PRESETS[k];
    const b = document.createElement('button'); b.dataset.preset = k; b.textContent = p.label; presets.append(b);
    // (phones: the presets past the device's ceiling - src/graphics.js DEVICE_MAX - shown, but not to be picked)
    if (clampPreset(k, GFX_DEVICE) !== k) { b.disabled = true; b.title = "Not in an app's browser: open the game in Safari or Chrome"; b.textContent = p.label + ' ✕'; }
    else if ((TOUCH || LITE) && RISKY.includes(k)) { b.title = 'May crash on older iPhones'; b.textContent = p.label + ' ⚠'; }
  }
  const box = name => el.querySelector(`input[name="${name}"]`), fps = el.querySelector('select[name="targetFps"]');
  for (const f of TARGET_FPS) fps.append(new Option(`${f} FPS`, f));
  function refresh() {
    const s = GFX.settings, r = GFX.resolved;
    for (const b of presets.children) b.classList.toggle('on', b.dataset.preset === menuPreset(s.preset));
    for (const n of ['gtao', 'bloom', 'overlay', 'adaptive']) box(n).checked = r[n];
    fps.value = String(r.targetFps); fps.disabled = false;
    const range = GFX.minDpr() < GFX.maxDpr() ? `${GFX.minDpr().toFixed(2)}–${GFX.maxDpr().toFixed(2)}` : 'no room on this preset';
    info.textContent = `Resolution ×${GFX.dpr.toFixed(2)}${r.adaptive ? ` (adaptive: ${range})` : ''} · shadows ${r.shadowMap} px over ${r.shadowWidth} m · decoration ${Math.round(r.decor * 100)}%`
      + (LITE ? ' · Phone safety: 512px shadows; post effects off.' : '')
      + (maxPresetFor(GFX_DEVICE) ? ` · In an app's browser the game runs ${PRESETS[maxPresetFor(GFX_DEVICE)].label} at most.` : (TOUCH || LITE) && RISKY.includes(s.preset) ? ' · ⚠ Quality uses more memory on older phones.' : '')
      + (s.preset !== populationPreset ? ' � Reload to apply crowd, traffic and city-distance changes.' : '')
      + (r.adaptive && adaptive.cpuBound ? ' · The processor is the limit right now, so a lower resolution would not help: it stays sharp.' : '');
  }
  const changed = () => { menuViewDirty = true; pace.last = undefined; adaptive.reset('settings'); refresh(); perfHud.sync(); };
  presets.addEventListener('click', e => { const k = e.target.dataset?.preset; if (!k || e.target.disabled || clampPreset(k, GFX_DEVICE) !== k) return; const s = { ...GFX.settings, preset: k, gtao: null, bloom: null }; GFX.apply(s); saveGraphics(s); changed(); });
  for (const n of ['gtao', 'bloom', 'overlay', 'adaptive']) box(n).addEventListener('change', e => { GFX.set(n, e.target.checked); changed(); });
  fps.addEventListener('change', () => { GFX.set('targetFps', +fps.value); changed(); });
  el.querySelector('.resume').addEventListener('click', () => { paused = false; toast('', 0); lockPointer(); });
  let shown = null;
  return {
    refresh,
    update() {
      const on = started && paused && $('bigmap').classList.contains('hidden');
      if (on === shown) return;
      shown = on; el.classList.toggle('hidden', !on);
      hud.toast.style.visibility = on ? 'hidden' : '';   // (the menu says it's paused: not the "PAUSED" toast behind it too)
      if (on) { refresh(); saveFlow.onPause(); }
    },
  };
})();
// the performance overlay (Esc menu): live numbers from the recorder, twice a second
const perfHud = (() => {
  const el = $('perfhud');
  let t = 0, mine = false, shown = false;
  const top = [];                                    // (the costliest systems' rows: Perf.topSystems reuses them)
  return {
    sync() {
      shown = !!GFX.resolved?.overlay;
      el.classList.toggle('hidden', !shown);
      if (shown && !Perf.on) { Perf.start('overlay'); mine = true; }
      if (!shown && mine) { Perf.stop(); mine = false; }
    },
    update(dt) {
      if (!!GFX.value('overlay') !== shown) this.sync();   // (turned on or off from anywhere: the menu, __game.gfx.set)
      if (!shown || (t -= dt) > 0) return;
      t = 0.5;
      const r = Perf.recent(120); if (!r) return;
      el.textContent = `${r.fps.toFixed(0)} fps  ·  p95 ${r.p95.toFixed(1)} ms\nsim ${r.sim.toFixed(1)}  ·  CPU submit ${r.submit.toFixed(1)}  ·  GPU ${r.gpu == null ? '—' : r.gpu.toFixed(1)} ms\n`
        + `${Math.round(r.calls)} draw calls  ·  ${(r.tris / 1e6).toFixed(1)} M tris\n`
        + `systems p50/p95 ms: ${Perf.topSystems(120, 4, top).map(s => `${s.name} ${s.p50.toFixed(1)}/${s.p95.toFixed(1)}`).join('  ·  ') || '—'}\n${GFX.resolved.label}  ·  res ×${GFX.dpr.toFixed(2)}${GFX.resolved.adaptive ? ` auto (${GFX.resolved.targetFps})` : ''}${GFX.resolved.adaptive && adaptive.cpuBound ? '  ·  CPU-bound' : ''}`;
    },
  };
})();
perfHud.sync();
// ------------------------------------------------------------------ boot
// the performance recorder: what it counts besides frame times (people and vehicles that exist vs are drawn)
Perf.attach({
  renderer,
  actors: () => {
    const vis = list => { let v = 0; for (const o of list) if ((o.h?.root || o.mesh || o.root)?.visible) v++; return v; };
    const out = {};
    if (peds) out.pedestrians = [peds.list.length, vis(peds.list)];
    if (locals) out.seated = [locals.list.length, vis(locals.list)];
    out.crackheads = [crackheads.length, vis(crackheads)];
    if (eshays?.list) out.eshays = [eshays.list.length, vis(eshays.list)];
    if (traffic?.cars) out.traffic = [traffic.cars.length, vis(traffic.cars)];
    if (crime?.S) { out.policeCars = [crime.S.units.length, vis(crime.S.units)]; out.officers = [crime.S.officers.length, vis(crime.S.officers)]; }
    return out;
  },
  extra: () => ({ preset: GFX.resolved?.name, dpr: GFX.dpr, adaptive: GFX.resolved?.adaptive, targetFps: GFX.resolved?.targetFps, cpuBound: adaptive.cpuBound, shadowMapSize: sun.shadow.mapSize.x, shadowCamera: [sun.shadow.camera.right - sun.shadow.camera.left, sun.shadow.camera.top - sun.shadow.camera.bottom],
    bloom: bloom.enabled, gtao: gtao.enabled, gameMinutes: Math.round(gameMinutes), wanted: crime?.S?.wanted ?? 0 }),
});
if (/[?&]perf\b/.test(location.search)) addEventListener('load', () => setTimeout(() => Perf.start('url'), 0));
const startBtn = $('startBtn');
setTimeout(async () => {
  try {
    startBtn.textContent = 'Loading the Brisbane map…';
    const worldP = loadWorld();
    const assetsP = loadAssets();
    const hdriP = loadSkyHDRI(renderer).catch(err => { console.warn('HDRI sky unavailable, using the procedural sky', err); return null; });
    W = await worldP;
    LY.setWorld(W);
    startBtn.textContent = 'Loading models…';
    await assetsP;
    hdri = await hdriP;
    if (hdri) {
      sky.material = makeSkyMaterial(hdri, sunDir);
      envScene.children[0].material = sky.material;
      DAY.fog.copy(hdri.horizonColor);
      LIGHT.hemiDay = 0.3; LIGHT.sunDay = 2.8;
    }
    await build(label => { startBtn.textContent = label; });
    await loadStep('phone textures');
    // the ground and the backdrop skyline never move: their matrices are composed once, not every frame
    for (const c of scene.children) if (c.name === 'ground' || c.name === 'osm-backdrop-buildings') c.traverse(o => { if (o.matrixAutoUpdate) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
    if (TOUCH) {                               // (phones / tablets: before the shaders warm up and the GPU gets them)
      const r = phoneTextures([scene, A], { budgetMs: Infinity, ...PHONE_TEX }); console.info(`[phone] ${r.n} textures shrunk, ~${r.savedMB} MB of GPU memory saved`);
      A.lateLoad?.then(() => phoneTextures([scene, A], PHONE_TEX)).catch(() => {});
    }
    await loadStep('static geometry');
    // Every device: the static city's vertex copies leave JS memory once they're on the GPU (not what knock.js or the
    // asset models need): ~490 MB less JS heap, and the major GCs that walk it shorter (?keepgeo: keep them, to compare)
    if (!/[?&]keepgeo\b/.test(location.search)) {
      const assetGeos = new Set(); const walk = (x, d = 0) => { if (!x || d > 4) return; if (x.isObject3D) { x.traverse(o => o.geometry && assetGeos.add(o.geometry)); return; } if (typeof x === 'object' && !ArrayBuffer.isView(x)) for (const v of Object.values(x)) walk(v, d + 1); };
      walk(A);
      knock?.keepBatchSlices?.();               // (each knockable prop's own slice of its chunk, first: src/knock.js)
      const g = freeStaticGeometry(scene, { skip: o => assetGeos.has(o.geometry) });
      console.info(`[memory] ${g.geometries} static geometries: ~${g.MB} MB of vertex copies dropped after upload`);

    }
    await loadStep(null);
    if (LITE) {                                // (an iPhone: the city's vertex copies go to the GPU now, before the shader
      // warm-up, so ~365 MB of them aren't held through it; the one draw compiles the programs it meets on the way)
      startBtn.textContent = 'Parking the CityCats…';
      renderer.shadowMap.needsUpdate = true;    // (the shadow map first: a draw before it exists trips WebGL's sampler check)
      // (in batches with a pause between, 2026-10-18: one draw of everything at once grew Safari's page process by ~0.5 GB
      //  - the load's peak, where iPhone tabs died. The pause first lets the stage crumb say where we are; ?chunkup=0: one draw)
      await loadStep(null, 1000);   // (the build's leftovers collected before the GPU uploads start)
      const t = performance.now(), lods = (() => { const l = []; scene.traverse(o => o.isLOD && l.push(o)); return l; })();
      // (?upbatch=N meshes a pass, ?upmb=N MB of vertex data a pass instead, ?uppause=ms between passes: test knobs)
      const upQ = new URLSearchParams(location.search), upMs = +(upQ.get('uppause') ?? 40);
      // (lite: the upload draws with the effect lights hidden and the sky's environment map set, as the lite warm-up has
      //  them - else it compiles ~99 programs no lite frame ever binds: 237 -> 140 at ready, ~5 s and ~100 MB of GPU process
      //  off the load. ?upnofx=0 / =1 forces it off / on)
      if (upQ.get('upnofx') === '1' || (LITE && upQ.get('upnofx') !== '0')) { fxLightsShow(false); fxLightsAllow(false); updateDayNight(); }
      const upOpts = { batch: +(upQ.get('upbatch') || 80), batchMB: +(upQ.get('upmb') || 0), pause: () => new Promise(r => setTimeout(r, upMs)) };
      const u = /[?&]chunkup=0\b/.test(location.search) ? uploadStatic(renderer, scene, camera, lods) : await uploadStaticChunked(renderer, scene, camera, lods, upOpts);
      console.info(`[memory] lite: ${u.meshes} static meshes uploaded before the warm-up${u.passes ? ` in ${u.passes} passes` : ''} (${Math.round(performance.now() - t)} ms)`);
      // (the textures that just went up: their CPU copies go now, not held through the shader warm-up - 2026-10-18)
      if (FREE_TEX) { const f = freeUploadedTextures(renderer, [scene], FREE_TEX_OPTIONS); console.info(`[memory] lite: ${f.textures} textures' CPU copies dropped before the warm-up: ~${f.MB} MB`); }
      for (let i = 0; i < 12; i++) await new Promise(r => setTimeout(r, 100));   // (~1.2 s of idle: the collector's chance before the warm-up allocates again)
    }
    await loadStep(null);
    await warmShaders(label => { startBtn.textContent = label; });
    await loadStep('final upload');
    // (after the shaders: drawn with programs already built, this is buffer uploads only - before them it built ~450
    //  programs one by one, 12 s). Every far chunk's buffers go up now, not on the frame you first see it.
    { const t = performance.now(), u = uploadStatic(renderer, scene, camera, (() => { const l = []; scene.traverse(o => o.isLOD && l.push(o)); return l; })()); console.info(`[memory] ${u.meshes} static meshes uploaded at once (${Math.round(performance.now() - t)} ms)`); }
    await loadStep('texture copies');
    if (FREE_TEX) { const f = freeUploadedTextures(renderer, [scene], FREE_TEX_OPTIONS); console.info(`[memory] ${f.textures} textures' CPU copies dropped after upload: ~${f.MB} MB`); }
    // Never allocate throwaway buffers to force GC: Safari can terminate the tab
    // before collection. Yield without increasing the live memory footprint.
    await new Promise(resolve => setTimeout(resolve, 0));
    await loadStep(null);
    Perf.loaded(performance.now());            // (ms from opening the page to "Start": loading, kept apart from play)
    player.heading = SPAWN.heading;
    cam.yaw = SPAWN.heading; cam.x = player.x - Math.sin(SPAWN.heading) * 5; cam.y = player.y + 3; cam.z = player.z - Math.cos(SPAWN.heading) * 5;
    if (graphicsLost) throw new Error('Graphics context lost during loading');
    startBtn.disabled = false; startBtn.textContent = 'Play';   // (style.css draws the ▶)
  if (CONFIG.online) { $('onlineBtn')?.classList.remove('hidden'); refreshOnlineCount(); }   // (the online beta: where its game server exists; how many are on it now)
    $('title').classList.add('city-ready');
  } catch (err) {
    const stageAt = startBtn.textContent;     // (the boot supervisor, index.html: the stage it stopped at, Reload; a city manifest failure has said so already)
    console.error(err); window.__boot?.fail(stageAt, err, { kind: 'load' }); startBtn.textContent = 'Brisbane could not load.';
    $('launch-retry').classList.remove('hidden');
    $('launch-device').textContent = 'Check your connection and try again. If it keeps happening, try another browser.';
  }
  requestAnimationFrame(loop);
}, 50);
// ---- the online mode (beta): other players in the same city, on foot - src/multiplayer/online.js, loaded only when chosen
let onlineWanted = CONFIG.online && /[?&]online=1\b/.test(location.search);   // (not on the main site: src/config.js online)
$('onlineBtn')?.addEventListener('click', () => { try { sfx.start(); if (TOUCH) unlockAudio(sfx); } catch { /* silent */ } gateOnline(); });   // (the sound starts inside this tap: play begins later, after the connecting screen, outside any gesture - iOS would stay silent)
// Play online: the title screen stays up, saying what it is doing, until the room has us - signed in, the room's streets
// loaded, joined, the first snapshots in and the room's cars near us built - and only then does play begin (it used to start
// play at once and connect underneath: "Online: connecting" in the game, everything popping in, a jolt to the room's spot).
// Fails: back to the title with the reason and both buttons (solo still plays).
let gating = false;
// how many are playing online now (the lobby's rooms: server/lobby.mjs), on the title screen every 30 s until play starts
let countTimer = 0, onlineFull = false;
async function refreshOnlineCount() {
  clearTimeout(countTimer);
  if (started || !CONFIG.online) return;
  const el = $('online-count'); if (!el) return;
  try {
    const m = /[?&]mp=([^&]+)/.exec(location.search), base = (m ? decodeURIComponent(m[1]) : CONFIG.mpService || '').replace(/\/$/, '');
    const r = await fetch(base + '/rooms', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json(), n = (j.rooms || []).reduce((a, q) => a + (q.count | 0), 0), btn = $('onlineBtn');
      onlineFull = !!j.full;
      if (btn) {
        btn.innerHTML = '<span class="mp-label">Play online (beta)</span><span class="mp-count"></span>';
        btn.querySelector('.mp-count').textContent = onlineFull ? `FULL · ${n} playing` : n === 1 ? '1 playing now' : `${n} playing now`;
        btn.classList.toggle('mp-full', onlineFull);
      }
      const nm = lsGet('bs.mp.name');
      el.innerHTML = nm ? 'Online as <b></b> · <a id="online-rename">change name</a>' : '';
      if (nm) { el.querySelector('b').textContent = nm; el.querySelector('#online-rename').onclick = () => askCode(null, true); }
      el.classList.toggle('hidden', !nm);
    }
  } catch { /* offline: no line */ }
  countTimer = setTimeout(refreshOnlineCount, 30000);
}
// the online test code (the owner's, 2026-10-27): asked once, kept on this device, checked by the online service (server/worker.mjs)
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } }, lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* private mode */ } };
function onlineCode() { const m = /[?&]code=([^&]+)/.exec(location.search); return m ? decodeURIComponent(m[1]) : lsGet('bs.mp.code') || ''; }
// Two steps (the owner, 2026-10-28: "first put the code and then ask them for the name"): the code alone, then the name.
function askCode(msg, renameOnly = false) {
  const f = $('online-code'), inp = $('online-code-input'), nm = $('online-name-input'); if (!f || !inp) return;
  const step = !onlineCode() && !renameOnly ? 'code' : 'name';
  $('launch-device').textContent = msg || (step === 'code' ? 'Type the online test code to join.' : 'Now pick a name the others will see.');
  inp.hidden = $('online-code-label').hidden = step !== 'code';
  if (nm) { nm.hidden = $('online-name-label').hidden = step !== 'name'; nm.value = lsGet('bs.mp.name') || ''; }
  if (step === 'code') inp.value = '';
  $('online-code-go').textContent = step === 'code' ? 'Next' : 'Join';
  f.dataset.rename = renameOnly ? '1' : ''; f.dataset.step = step;
  f.classList.remove('hidden'); try { (step === 'code' ? inp : nm).focus(); } catch { /* */ }
}
$('online-code')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = $('online-code'), name = ($('online-name-input')?.value || '').replace(/\s+/g, ' ').trim().slice(0, 16), code = ($('online-code-input')?.value || '').trim();
  if (f.dataset.step === 'code') {   // (step one: the code; then the name, unless this device has one already)
    if (!code) { $('launch-device').textContent = 'Type the online test code.'; return; }
    lsSet('bs.mp.code', code);
    if (!lsGet('bs.mp.name')) { askCode(); return; }
    f.classList.add('hidden'); $('launch-device').textContent = ''; gateOnline(); return;
  }
  if (!name) { $('launch-device').textContent = 'Type a name the others will see.'; return; }
  lsSet('bs.mp.name', name);
  f.classList.add('hidden'); $('launch-device').textContent = '';
  if (f.dataset.rename === '1') { refreshOnlineCount(); return; }
  gateOnline();
});
async function gateOnline() {
  if (gating || started) return;
  const testRoom = /[?&]mp=/.test(location.search);   // (a local test room (?mp=) needs no code and no name form)
  if (CONFIG.online && !testRoom && (!onlineCode() || !(lsGet('bs.mp.name') || /[?&]name=/.test(location.search)))) { askCode(); return; }
  if (onlineFull && !testRoom) { $('launch-device').textContent = "Online is full right now: every room's taken. Try again in a minute, or press Play for solo."; refreshOnlineCount(); return; }
  gating = true; onlineWanted = true;
  const title = $('title'), stage = $('launch-stage'), device = $('launch-device'), bar = document.querySelector('#launch-loading progress');
  const say = t => { if (stage) stage.textContent = t; };
  title.classList.add('mp-connecting'); device.textContent = ''; if (bar) bar.removeAttribute('value');
  say('Signing in to Brisbane online…');
  const fail = msg => {
    try { online?.stop?.(); } catch { /* */ } online = null; onlineWanted = false;
    title.classList.remove('mp-connecting'); device.textContent = msg; gating = false;
  };
  const slow = setTimeout(() => { if (gating) say('Loading the room\'s streets…'); }, 1500);
  const o = await startOnline();
  clearTimeout(slow);
  if (!o) {
    const why = onlineFail, check = /turnstile/i.test(why);
    if (/session 403 code/.test(why)) { lsSet('bs.mp.code', null); fail(''); askCode("That code isn't right. Type the online test code again."); return; }
    return fail((check ? 'The security check did not finish on this browser (a content blocker or private mode can stop it). Try again, or press Play for solo.'
      : 'Could not reach the online room. Check your connection and try again, or press Play for solo.') + (why ? ` [${why}]` : ''));
  }
  const t0 = performance.now(); let onAt = 0;
  const ok = await new Promise(resolve => {
    const tick = () => {
      if (!online) return resolve(false);
      const s = online.stats(), el = performance.now() - t0;
      if (s.status === 'full') say(s.statusText || 'Every room is full: waiting for a spot…');
      else if (s.status === 'on') {
        if (!onAt) onAt = performance.now();
        say(`Syncing cars and players in ${s.room || 'the room'}…`);
        try { online.present(0.05); } catch (err) { console.warn('online warm', err); }   // (the room's cars and people near us built now, a few at a time, not on play's first frames)
        if (s.recv >= 8 && performance.now() - onAt > 1200) return resolve(true);
      } else if (s.status === 'hello') say('Joining a room…');
      else if (s.status === 'off') return resolve(false);
      if (el > 25000) return resolve(false);
      setTimeout(tick, 50);
    };
    tick();
  });
  if (!ok) return fail('Could not join an online room in time. Try again, or press Play for solo.');
  say('Here we go…');
  title.classList.remove('mp-connecting'); gating = false;
  startBtn.click();
}
// this game's people for the others in the room (src/multiplayer/npcs.js): what each list runs, as the room is told it
const CRACK_STATES = ['loiter', 'beg', 'aggro', 'down', 'flee', 'calm', 'gone', 'windup'];
// a person is in the world for the others when their body is awake and either drawn or merely off this screen (cullPeople hides the
// ones behind the camera: they are still there) - never when put away (Human.sleep) or hidden on purpose by their own system
const npcShown = h => !!h && !h.asleep && (h.root.visible || h.onScreen === false);
function registerOnlineNpcs() {
  if (!online || online.npcsRegistered) return; online.npcsRegistered = true;
  online.npcSource({ kind: 'crackhead', list: () => crackheads, active: c => c.state !== 'gone' && !!c.h && !c.h.asleep && online.ownsNpc(c),
    pose: (c, o) => { o.x = c.x; o.z = c.z; o.y = LY.groundY(c.x, c.z); o.heading = c.heading; o.anim = c.state === 'down' ? 4 : 0; o.state = Math.max(0, CRACK_STATES.indexOf(c.state)); o.flags = moveFlags(c.h); },   // (flags: his swings, seen by the others - src/multiplayer/npcs.js)
    hit: (c, from, kind, power) => c.hit(Math.max(5, Math.min(60, power)), from.x, from.z, false) });
  online.npcSource({ kind: 'officer', list: () => crime?.S.officers || [], active: o => npcShown(o.h),
    pose: (o, out) => { out.x = o.x; out.z = o.z; out.y = Number.isFinite(o.y) ? o.y : LY.groundY(o.x, o.z); out.heading = o.heading; out.anim = o.down > 0 ? 4 : 0; out.state = o.officer ? 1 : 0; out.flags = (o.aiming ? 1 : 0) | (o.civilian ? 2 : 0); } });
  online.npcSource({ kind: 'unit', list: () => crime?.S.units || [], active: u => !!u.mesh,
    pose: (u, o) => { o.x = u.x; o.z = u.z; o.y = Number.isFinite(u.y) ? u.y : LY.groundY(u.x, u.z); o.heading = u.heading; o.anim = 0; o.speed = Math.abs(u.v || 0); o.state = 0; const lt = lightsOf(u.mesh); o.flags = lt && lt.beacon ? 1 : 0; } });
  online.npcSource({ kind: 'eshay', list: () => eshays?.list || [], active: m => npcShown(m.h) && m.present !== false && m.state !== 'gone',
    pose: (m, o) => { o.x = m.x; o.z = m.z; o.y = LY.groundY(m.x, m.z); o.heading = m.heading || 0; o.anim = m.h.rag || m.down > 0 ? 4 : 0; o.state = m.state === 'flee' ? 1 : 0; o.flags = moveFlags(m.h); } });
  online.npcSource({ kind: 'kebab', list: () => (chars26?.chasing ? [chars26.chasing] : []), active: c => !!c.h,
    pose: (c, o) => { o.x = c.x; o.z = c.z; o.y = LY.groundY(c.x, c.z); o.heading = c.heading || 0; o.anim = 0; o.state = 1; o.flags = 0; } });
  online.npcSource({ kind: 'swat', list: () => swat?.officers || [], active: o => npcShown(o.h),
    pose: (o, out) => { out.x = o.x; out.z = o.z; out.y = Number.isFinite(o.y) ? o.y : LY.groundY(o.x, o.z); out.heading = o.heading || 0; out.anim = o.down > 0 ? 4 : 0; out.state = 0; out.flags = o.aim > 0.5 ? 1 : 0; } });
  const myBike = [];
  online.npcSource({ kind: 'lime', list: () => { myBike.length = 0; if (player.riding && !player.riding.ebike) myBike.push(player.riding); return myBike; }, active: () => true,
    pose: (sc, o) => { o.x = player.x; o.z = player.z; o.y = player.y; o.heading = player.heading; o.anim = 0; o.speed = Math.abs(sc.v || 0); o.state = 0; o.flags = 0; } });
  const myEbike = [];
  online.npcSource({ kind: 'ebike', list: () => { myEbike.length = 0; if (player.riding && player.riding.ebike) myEbike.push(player.riding); return myEbike; }, active: () => true,
    pose: (sc, o) => { o.x = player.x; o.z = player.z; o.y = player.y; o.heading = player.heading; o.anim = 0; o.speed = Math.abs(sc.v || 0); o.state = 0; o.flags = 0; } });
  online.npcSource({ kind: 'truck', list: () => swat?.trucks || [], active: t => !!t.mesh,
    pose: (t, o) => { o.x = t.x; o.z = t.z; o.y = Number.isFinite(t.y) ? t.y : LY.groundY(t.x, t.z); o.heading = t.heading || 0; o.anim = 0; o.speed = Math.abs(t.v || 0); o.state = 0; o.flags = 1; } });
}
let onlineFail = '';   // (why the last start failed: the connecting screen shows it)
async function startOnline() {
  if (online) return online;
  onlineFail = '';
  const q = k => { const m = new RegExp('[?&]' + k + '=([^&]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; };
  const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };
  try {
    const { createOnline } = await import('./multiplayer/online.js');
    const service = q('mp') || CONFIG.mpService;
    online = createOnline({ player, world: SIMW, scene, Human, population: rigs, service,
      turnstile: CONFIG.aiAuth && !q('mp') ? turnstileSource(CONFIG.turnstileSiteKey) : null, previousToken: ls('bs.mp.prev'), onToken: t => ls('bs.mp.prev', t),
      name: q('name') || ls('bs.mp.name') || 'Player', look: JSON.stringify(pHuman?.look || PLAYER_LOOK), toast: (t, secs) => toast(t, secs),
      footIn: FOOT_IN, onFoot: () => stepOnFoot, getYaw: () => cam.yaw, maxRigs: (TOUCH || LITE) ? 8 : 24, lag: +q('mplag') || 0,
      W, packUrl: BAKE_TIER === 'd40' ? null : 'assets/world/d40/sim.bin', accessCode: () => onlineCode(),
      makeVehicleMesh, disposeVehicle, poseVehicle, vehicleProfile: simVehicleProfile, driveVehicle: simDriveVehicle, driveIn: DRIVE_IN,
      takeWheel: car => crime.takeWheel(car), leaveWheel: () => crime.leaveWheel(), isDriving: () => !!player.driving,
      getMinutes: () => gameMinutes, setMinutes: m => { gameMinutes = Math.floor(gameMinutes / 1440) * 1440 + m; },   // (the room's clock drives the sky)
      parkedLights: m => lightsOff(m, 'parked'),   // (a parked car's lamps are off)
      // another player's car: its lamps and damage as their game has them; yours: what to tell the room (src/multiplayer/online.js vlook / sendVState)
      carLampBits: m => { const L = lightsOf(m); return L ? (L.left || L.hazard ? 8 : 0) | (L.right || L.hazard ? 16 : 0) | (L.beacon ? 32 : 0) : 0; },
      setCarLamps: (m, f) => { const L = lightsOf(m); if (!L) return; const l = !!(f & 8), r = !!(f & 16); L.brake = !!(f & 4); L.hazard = l && r; L.left = l && !r; L.right = r && !l; L.beacon = !!(f & 32); L.who = 'online'; },
      carDamageLevel: m => vdamage?.levelOf?.(m) || 0,
      mirrorCarDamage: (e, lv) => vdamage?.mirror?.({ mesh: e.mesh, type: e.type }, lv),
      knockRecs: () => knock?.reg?.recs ? knock.reg.recs.map(r => ({ k: r.k, x: r.x, z: r.z, o: r.slots.map(s => s.o) })) : null, knockKinds: KNOCK_KINDS,
      knockVisual, knockRespawn, isFree: () => bodyFree || !!player.vault || !!water?.active || !!ferry?.aboard,   // (the water / a vault has the body: the room follows it - also between steps, when a snapshot is checked)
      localParkedGone: (x, z) => { for (const p of traffic?.visual || []) if (p.box && Math.abs(p.x - x) < 1.2 && Math.abs(p.z - z) < 1.2) { try { world.col.remove(p.box); } catch { /* */ } p.box = null; } },   // (a bay the room emptied: this screen's own parked car there stops being solid too - a d40 phone predicts against world.col)
      onMesh: m => trimVehicleShadows(m),          // (every car mesh the online mode makes: dressed as this screen's own)
      project: (x, y, z, out) => { _tagV.set(x, y, z).project(camera); out.x = _tagV.x; out.y = _tagV.y; out.z = _tagV.z; return out; },   // (name tags: a world point to the screen)
      clearKeys: () => { for (const k in keys) keys[k] = false; },
      stage: stageEl(), viewSize: () => view.size(),   // (the in-game UI's home: #stage turns with the game on a phone held upright; the game's own size for the tags)
      npcLook: kind => (kind === 'officer' || kind === 'swat' ? crime.officerLook() : kind === 'eshay' && eshays?.look ? eshays.look() : kind === 'kebab' ? playerLook?.() || {} : crackheadLook()), carBeacon: (m, on) => { const lt = lightsOf(m); if (lt && lt.beacon !== on) lt.beacon = on; }, carPose: (m, speed, dt) => animateVehicleWheels(m, speed, 0, dt),
      wanted: () => crime?.S.wanted | 0, isDown: () => player.down > 0 || !!pHuman?.rag, rideV: () => player.rideV || 0,
      makeBikeMesh: kind => { try { return kind === 'lime' ? makeScooter() : kind === 'ebike' ? new THREE.Mesh(ebikeGeometry(), _ebikeMat || (_ebikeMat = new THREE.MeshLambertMaterial({ vertexColors: true }))) : null; } catch { return null; } },   // (a scooter / an e-bike under another player's body)
      onStopped: () => { if (online && !online.active) online = null; },   // (back to solo: the instance and its pack go; Online again makes a fresh one)
      carCrash: (car, closing, nx, nz, other, dv, px, pz) => { try { sfx.crash(undefined, undefined, closing); } catch { sfx.crash(); } cam.shake = Math.min(1, cam.shake + Math.min(1, closing / 14)); try { vdamage?.impact?.(car, dv || closing, px ?? car.x, pz ?? car.z, nx, nz, 'vehicle'); } catch { /* */ } if (closing > 3) crime.crime?.('crash', 0.3); },   // (one of the room's cars: the sound, the shake, the dents from the crush - the physics is the shared contact's, src/sim/carcontact.js)
      hitByCar: c => { if (player.down > 0) return; hurtPlayer(12 + Math.abs(c.v) * 3.5, c.x, c.z, 'car'); sfx.crash(); subtitle(pick(['Driver: "Are you blind?! Get off the road!"', 'Driver: "Jesus, mate!"', 'You got cleaned up by a car.'])); } });   // (a moving room car into you: the knock it gives you rides to the room)
    registerOnlineNpcs();
    const inst = online, went = await inst.start();
    if (!went) { onlineFail = inst.stats?.().failReason || ''; if (!gating) toast('Online mode could not start. Playing solo.', 4); online = null; }
  } catch (err) { console.error('online mode failed to start', err); onlineFail = String(err?.message || err); toast('Online mode could not start. Playing solo.', 4); online = null; }
  return online;
}
startBtn.disabled = true;
startBtn.onclick = () => {
  $('title').classList.add('hidden'); $('hud').classList.remove('hidden');
  started = true; lockPointer(); crumb('play: starting the sound');
  if (onlineWanted) startOnline();          // (Play online: src/multiplayer/online.js)
  Speech.quietFor(6);   // (one voice while the game opens: the welcome line; ambient characters' chatter waits - src/speech.js)
  // (a browser without Web Audio - some embedded WebKit builds - plays silent instead of stopping Play half way)
  try { sfx.start(); } catch (err) { console.warn('audio unavailable', err); }
  if (TOUCH) unlockAudio(sfx);
  crumb('play: the radio');
  // what play adds from now on (a helicopter, the 2026 characters' cars, a late texture's new variant): its programs
  // built on idle time while it's still out of view (src/shaderwatch.js)
  shaderWatch.start();
  // (the effect lights' shaders in the background; an iPhone compiles them when an effect first appears instead)
  if (!LITE) setTimeout(() => { fxWarming = true; warmFxLater().catch(err => console.warn('fx warm', err)).finally(() => { fxWarming = false; }); }, 3000);
  // (Lite: the knocked props' stand-in materials too - warmShaders leaves them out there to keep the loading short, and
  //  the first pole a car knocked over built them on that frame: SignWhite + V:std on a mast-arm pole, a 270 ms frame on
  //  a phone-emulated page in a 4-star chase, 2026-10-17 - warmKnockLite)
  else setTimeout(() => { warmKnockLite().catch(err => console.warn('knock warm', err)); }, 15000);
  if ((TOUCH || FREE_TEX) && !phoneTexTimer) {             // (anything made since the city was built, and from now on: police cars,
    if (TOUCH) phoneTextures([scene, A], PHONE_TEX);    //  the bus, late models arrive in play)
    phoneTexTimer = setInterval(() => {
      if (document.hidden) return;
      if (TOUCH) phoneTextures([A], PHONE_TEX);           // (the models: what play adds is cloned from them)
      if (FREE_TEX && (++freeTexN % 3) === 0) freeUploadedTextures(renderer, [scene], FREE_TEX_OPTIONS);   // (iPhones, every 12 s: textures' CPU copies once the GPU has them)
    }, 4000);
  }               // (iOS: resume + a silent buffer inside this tap; the 'playback' audio session)
  singlePass(scene);                         // (transparent double-sided materials from models: drawn once, not twice a frame)
  if (sfx.ctx) radio ||= createRadio(sfx.ctx, sfx.bus?.radio || sfx.master, { spatial: sfx });   // spatial: a car you leave keeps playing from where it's parked
  Voices.onPlay = secs => radio?.duck(secs + 0.3);   // every spoken line (recorded or TTS, game or missions) ducks the radio
  player.heading = SPAWN.heading; cam.yaw = SPAWN.heading; cam.pitch = 0.12;
  crumb('play: the first frame');
  // Continue (src/saveflow.js): cash, outfit, a validated return spot on foot, a mission's checkpoint; else a fresh start
  try { saveFlow.onPlay(); } catch (err) { console.error('save restore failed', err); }
  if (online?.active) { try { online.placeAtRoom(); } catch (err) { console.warn('online place', err); } }   // (online: the room says where you stand, not the solo save)
  const back = !online?.active && saveFlow.restored?.position && saveFlow.restored.position.how !== 'fallback';
  if (online?.active) subtitle(`You're online in ${online.room || 'Brisbane'}. Say g'day.`, 4);
  else if (back) subtitle(`Welcome back. You're in ${W.placeName(player.x, player.z)}.`, 4);
  else  subtitle('G\'day! You\'re in King George Square, right out the front of Brisbane City Hall.', 4);
  // (the welcome: the radio host in one of its recorded versions, for the hour / the storm - src/variety.js)
  Variety.context = () => ({ hour: (gameMinutes / 60) % 24, storm: missions?.current === 'storm', wanted: crime?.S?.wanted || 0 });
  sfx.say(varyText("G'day mate. Welcome to Brisbane."), { pitch: 0.95, rate: 1 });
  try {                                      // the First Ride welcome for a newcomer; the share card after a pass (src/firstminute.js)
    firstMinute ||= createFirstMinute({ missions, clip: clipMode, touch: TOUCH, host: stageEl(), exitPointer: () => document.exitPointerLock?.() });
    firstMinute?.onPlay();
  } catch (err) { console.warn('first minute unavailable', err); }
  try { NewPlayer.start({ missionId: () => missions?.sys?.run?.def?.id || '', overlayOpen: () => !!firstMinute?.shareOpen, isPaused: () => paused, veteran: () => (missions?.sys?.progress?.rec?.('first')?.wins || 0) > 0 }); } catch (err) { console.warn('new-player grace unavailable', err); }
};
window.__game = {
  wheelie,                                   // wheelies / manuals (src/wheelie.js; tests: tools/test_wheelie.mjs)
  sight,                                     // what the player can see now (src/sight.js): .seen(x, y, z), .stats
  view,                                      // the game's size and turn (src/device.js: a phone held upright plays sideways; tests)
  perf: Perf,                                // development: __game.perf.start('label'), ... .report(), .stop()
  features: Features,                        // development: runtime switches, __game.features.set('wildlife', false) (src/features.js)
  opaqueSort,                                // (development: renderer.setOpaqueSort(null) puts three.js's own order back, for A/B)
  cullPeople,                                // (development: tools/perf/renderbench.mjs culls the frozen crowd for each heading)
  farCars,                                   // distant cars drawn instanced (src/farcars.js; null on the desktop): .stats, .set(false)
  gfx: GFX,                                  // graphics settings: __game.gfx.apply({ preset: 'high' }), .resolved, .dpr
  adaptive,                                  // the adaptive resolution: .log (its decisions), .cpuBound, .spent (s at each ratio)
  shaderWatch,                               // programs built in the background for what play adds: .stats, .now() (src/shaderwatch.js)
  farCulled, VIEW_FAR,                       // phones: the static city wholly inside the fog, not drawn (.hidden, .list)
  composer,                                  // (tests: the post-processing targets match the drawing buffer)
  sun, sunDir, sunShadow,                    // (tests: the sun's shadow placement, tools/perf/shimmer.js)
  get obstacles() { return obstacles; },     // (tests: what the traffic avoids this step, tools/perf/loop.js)
  get shopSpill() { return shopSpill; },     // (stage 9: the shop light patches, by 200 m cell)
  cam,                                       // (tests: the follow camera, cam.tx/ty/tz its wanted spot, tools/perf/camera.js)
  get crime() { return crime; }, get busjack() { return busjack; }, get vdamage() { return vdamage; }, get crash() { return busjack?.crash; }, get radio() { return radio; }, get missions() { return missions; }, get swat() { return swat; },
  Ragdolls, get splash() { return splashFx; },     // (debug: Ragdolls.debug(), .stats.swims; the river splashes)
  get taxis() { return taxis; },             // (debug: .stats, .job, .debugNow(): src/taxis.js)
  get ferry() { return ferry; },             // (debug: __game.ferry.debugState(), .debugBoard('South Bank'), .debugAboard(i, helm), .svc, .net, .stats)
  get river() { return river; },             // (debug: __game.river.debugState(), .debugSpawn('eight'), .list, .stats, .enabled = false)
  get water() { return water; },             // (debug: __game.water.debugDump(), .debugShark(), .debugSki(i), .skis, .sharks, .stats)   // (debug: Ragdolls.debug(), .stats.swims; the river splashes)
  setExposure: v => { EXPOSURE = v; }, LIGHT, hemi, sun, sky,
  tick: (n, dt = 1 / 30, quiet = false) => { for (let i = 0; i < n; i++) frame(dt, !quiet || i === n - 1); },   // (quiet: only the last step is presented - long runs, tools/test_ferry.mjs)
  // debug: frame-timing tests drive the real loop with synthetic timestamps (ms): manualClock(true, t0), then loopAt(t)
  // for each frame after t0, manualClock(false) to hand back to requestAnimationFrame
  manualClock: (on, t0) => { manualClock = !!on; last = t0 ?? performance.now(); return manualClock; },
  loopAt: now => advance(now),
  speech: Speech,
  get paused() { return paused; },
  get online() { return online; }, get simw() { return SIMW; }, startOnline: () => startOnline(),   // the online mode (tests: __game.startOnline(), __game.online.stats())
  interact, punch, giveMoney, call000, rideZone, renderer, scene, camera, player, crackheads, scooters, STOPS, SPAWN,
  get traffic() { return traffic; }, get peds() { return peds; }, get world() { return world; }, get W() { return W; }, get RN() { return RN; },
  get time() { return time; }, get gameMinutes() { return gameMinutes; }, set gameMinutes(v) { gameMinutes = v; },
  get police() { return police; }, cam, keys, LY, respawn, render, drawBigMap, toggleMap,
  start: () => startBtn.onclick(),
  save: saveFlow,                            // the player's save (tests: __game.save.state(), .flush(), .store, .current)
  sfx, audioDebug: (o) => sfx.debug(o),   // spatial audio (src/audio.js): active emitters, distance, gain, cutoff
  pause: () => { paused = true; },             // (tests: the Esc menu without pointer lock)
  memoryLab,
  unpause: () => { paused = false; toast('', 0); },
  // debug: frame a Street View reference shot (data/reference/manifest.json: x, z, compass yaw, pitch down, horizontal fov)
  // (base: the floor under the camera, e.g. a bridge deck; default the ground)
  photo: (x, z, yaw = 0, pitch = 0, hfov = 90, eye = 2.4, base = null) => {
    photo = { x, z, yaw, pitch, hfov, eye, base };
    Object.assign(player, { x, z, vx: 0, vz: 0 });
    world.focus(x, z, true);
    for (const id of ['hud']) $(id).style.visibility = 'hidden';
    frame(1 / 30); frame(1 / 30);
    return W.placeName(x, z);
  },
  get contentCamera() { return contentCam; }, set contentCamera(fn) { contentCam = typeof fn === 'function' ? fn : null; },
  // first-person view (tests: tools/test_pov.mjs): toggle() as the ` key does; state() what's applied
  pov: { toggle: () => togglePov(), state: () => ({ on: pov.on, active: pov.active, bodyHidden: pov.hide, pitchMin: cam.pitchMin }) },
  photoEnd: () => { photo = null; camera.fov = 62; camera.updateProjectionMatrix(); pHuman.root.visible = true; $('hud').style.visibility = ''; },
  // debug: the player's Human, the Lime ride (src/limeride.js: .phase, .rear, .ik.err reach errors), hurtPlayer
  get pHuman() { return pHuman; }, limeRide, hurtPlayer,
  population: rigs,                          // resident rigs: __game.population.stats() (src/population.js; tools/perf/route_soak.mjs)
  // debug: the contact view (src/colview.js: every body capsule and vehicle outline drawn; also F7, ?colview=1)
  colView: on => (colView ? colView.set(on ?? !colView.on) : false),
  get combat() { return combat; },   // debug: __game.combat.debug(), .engage(__game.peds.list[i], 'ped', { mode: 'fight', skill: 0.6 })
  get helmet() { return helmet; },   // debug: __game.helmet.toggle(), .worn
  // debug: put the player somewhere (snapped to walkable ground) facing `heading` (0 = +z / south)
  // (y: the height to put you at - up on a deck when there is one within a step of it there: a fault report made up on
  //  the expressway goes back up there, not to the street under it)
  teleport: (x, z, heading = player.heading, y = null) => {
    if (player.riding) dismount(false);
    abortLimeStep();
    water?.reset();
    ferry?.reset();
    if (Number.isFinite(y) && y - W.groundY(x, z) > 1.2 && world.decks) {
      const f = deckFloor(x, z, y, null);
      if (f.y === f.y && f.road) {
        Object.assign(player, { x, z, y: f.y, vx: 0, vz: 0, vy: 0, heading, stepY: 0, stepV: 0, deckRoad: f.road, vault: null, upT: 0, grounded: true });
        cam.yaw = heading; cam.x = x - Math.sin(heading) * 5; cam.z = z - Math.cos(heading) * 5; cam.y = player.y + 2.5;
        world.focus(x, z, true);
        return W.placeName(x, z);
      }
    }
    const s = W.snapWalkable(x, z, 30, {}, true) || { x, z };
    Object.assign(player, { x: s.x, z: s.z, y: W.groundY(s.x, s.z), vx: 0, vz: 0, heading, stepY: 0, stepV: 0, deckRoad: null, vault: null, upT: 0 });
    cam.yaw = heading; cam.x = s.x - Math.sin(heading) * 5; cam.z = s.z - Math.cos(heading) * 5; cam.y = player.y + 2.5;
    world.focus(s.x, s.z, true);
    return W.placeName(s.x, s.z);
  },
};
// phones and tablets (src/device.js): the on-screen controls (src/touch.js) send the same keys a keyboard does
if (TOUCH) {
  try {
    touchUI = createTouchControls({
      cam, player, sfx,
      isStarted: () => started, isPaused: () => paused, typing: () => !!npcAI?.typing,
      bigMapOpen: () => !$('bigmap').classList.contains('hidden'), dead: () => !$('dead').classList.contains('hidden'),
      inWater: () => !!water?.active || !!ferry?.aboard,   // (E: climb out, onto a jet ski, step off a CityCat)
      food: () => wildlife?.food || null,                  // (the SHOO button: src/wildlife/food.js)
      weapon: () => weapons?.armed ? weapons.verb : '',    // (the Throw / Swing button: src/weapons.js)
      weaponDrop: () => !!weapons?.held && (weapons.equipped === 'bat' || weapons.equipped === 'boomerang'),   // (and Drop)
      weaponWheel: () => weapons?.wheel.show(!weapons.wheel.open),   // (the Weapons button: the wheel, tap a slot)
      pov: () => pov.on,                                   // (the eye button lit: first person chosen)
      povActive: () => pov.active,                         // (first person applied: no camera zoom - pinch, the zoom buttons)
      setPaused: (on, why) => { paused = !!on; toast(on ? (why === 'rotate' ? '' : 'PAUSED') : '', on ? 9999 : 0); },
    });
    window.__game.touch = touchUI;             // (tests: tools/test_mobile.mjs)
    hudTidy = createHudTidy({ player, crime: () => crime });
    window.__game.hudTidy = hudTidy;
  } catch (err) { console.warn('touch controls unavailable', err); }
}
// clip mode for recording social clips (src/clipmode.js; docs/launch/CLIP_MODE.md): ?clip=1 / ?clip=subs, Shift+F10
try {
  // the auto director's view of the game (src/director_cam.js): what you're doing this frame, the nearest police unit
  const dsig = { speed: 0, riding: false, driving: false, onFoot: true, wheelie: false, wanted: 0, cop: null, crash: 0, crew: 0, x: 0, z: 0, heading: 0 };
  const signals = () => {
    dsig.speed = player.driving ? Math.abs(player.driving.v || 0) : player.riding ? (player.riding.v || 0) : (player.speed || 0);
    dsig.riding = !!player.riding; dsig.driving = !!player.driving; dsig.onFoot = !player.riding && !player.driving;
    dsig.wheelie = !!wheelie.on; dsig.wanted = crime?.S?.wanted || 0; dsig.crash = cam.shake; dsig.x = player.x; dsig.z = player.z; dsig.heading = player.heading;
    let best = null, bd = 1e9;
    if (dsig.wanted > 0 && crime?.S?.units) for (const u of crime.S.units) { const d = Math.hypot(u.x - player.x, u.z - player.z); if (d < bd) { bd = d; best = u; } }
    dsig.cop = best;
    dsig.crew = streetLife?.riders?.crew?.state?.()?.near || 0;
    return dsig;
  };
  clipMode = createClipMode({ camera, isTyping: () => !!npcAI?.typing, signals }); window.__game.clip = clipMode;
} catch (err) { console.warn('clip mode unavailable', err); }
// the first minute (src/firstminute.js): the First Ride welcome on a first Play, the share card after a passed mission
window.__game.firstMinute = () => firstMinute;
// the map-fault reporter (src/faults.js; tools/faults/README.md): K / Shift+K (or F8), __game.faults, ?fault=<id>
try { faults = createFaults(window.__game, { isStarted: () => started, bigMapOpen: () => !$('bigmap').classList.contains('hidden') }); } catch (err) { console.warn('fault reporter unavailable', err); }
// the audio play log (src/audiolog.js; tools/audiolog/): every sound played, counted; F9 the top 20; __game.audioLog
try {
  AudioLog.where = () => lastPlace; AudioLog.clock = () => gameMinutes;
  AudioLog.start();
  window.__game.audioLog = AudioLog;
  window.__game.audioLogView = createAudioLogOverlay(AudioLog, { isTyping: () => !!npcAI?.typing || /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '') });
} catch (err) { console.warn('audio log unavailable', err); }
// content mode (?content=1, docs/launch/CONTENT_PIPELINE.md): the staged scenes for social clips and their recorder
// (src/content/director.js) - loaded only then, never in normal play
if (/[?&]content=1\b/.test(location.search)) {
  import('./content/director.js').then(m => { window.BRISBANE_CONTENT = m.createContentDirector(window.__game); })
    .catch(err => console.error('content director failed to load', err));
}
try { startDiag(window.__game); } catch (err) { console.warn('diag unavailable', err); }   // (?diag=1 only)
window.__boot?.mark('main-ready');              // (the boot supervisor: main.js ran to its end; the load itself is under way)
