/* Balance Lab · one worker (1 Oct 2026): loads the game's own bundle (no drawing: nothing is mounted without a page),
   then plays the games the Lab page sends it and posts the results back. */
self.window = self;
self.RTW_NO_AUTOMOUNT = true;
// the game keeps its saves in browser storage; a worker has none, so saves go nowhere (they are wrapped in try/catch)
if (typeof self.localStorage === 'undefined') self.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {}, key() { return null; }, length: 0 };
let G = null, S = null;
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === 'load') {
    try {
      importScripts(m.bundle, m.scenarios);
      G = self.RTW.game; S = G.sal;
      self.postMessage({ type: 'ready', knobs: self.LAB.knobs(S), profiles: self.LAB.PROFILES, profileText: self.LAB.PROFILE_TEXT });
    } catch (err) { self.postMessage({ type: 'fail', error: String((err && err.message) || err) }); }
  } else if (m.type === 'run') {
    const results = m.seeds.map((seed) => Object.assign(self.LAB.play(G, S, m.battle, m.profile, seed, m.f), { seed }));
    self.postMessage({ type: 'done', job: m, results });
  }
};
