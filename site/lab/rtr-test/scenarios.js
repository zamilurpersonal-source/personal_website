/* Balance Lab · the battles the bots play (1 Oct 2026). One game at a time: LAB.BATTLES[i].play(G, S, profile, seed,
   rng) returns { win, stars, t, surv, blue, red, ... }. G is RTW.game and S its Saladin campaign (GAME.sal), loaded
   from the game's own bundle in a Web Worker (or in Node through tools/node-env.js), so the bots play the real rules.
   Profiles: expert (the best first-part result, the best tactic), average (about three quarters as good, a decent
   tactic a little late), careless (about half as good, the weakest sensible tactic or no taps), random (anything).
   Each battle has one knob, the enemy's strength, that the tuner scales by a factor: scale(S, f) sets it and returns a
   function that puts it back. Ported from sal8/tools/bal.js and esc.js; keep the two in step. */
(function (root) {
  const LAB = (root.LAB = root.LAB || {});
  LAB.PROFILES = ['expert', 'average', 'careless', 'random'];
  LAB.PROFILE_TEXT = {
    expert: 'the best first-part result and the best tactic (taps on time, powers used, cards picked well, storm at the breach)',
    average: 'about three quarters as good a first part, a decent tactic a little late, cards at random',
    careless: 'about half as good a first part, the weakest sensible tactic or no taps at all',
    random: 'random choices everywhere',
  };
  const rngOf = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  LAB.rngOf = rngOf;
  const pick = (rng, arr) => arr[(rng() * arr.length) | 0];
  const mk = (have, ups) => ({ have, ups: Object.assign({ armor: {}, attack: {} }, ups || {}) });
  const half = (r) => r.blue >= Math.ceil(r.start.blue / 2);
  const baseStars = (r) => (r.winner === 'blue' ? 1 + (half(r) ? 1 : 0) + (r.red === 0 ? 1 : 0) : 0);
  const res = (r, stars, extra) => Object.assign({ win: r.winner === 'blue' ? 1 : 0, stars, t: r.t, surv: r.start.blue ? r.blue / r.start.blue : 0, blue: r.start.blue, red: r.start.red, reason: r.reason }, extra || {});
  // step a battle to its end; a battle that never ends is a problem the Lab reports
  const finish = (sim, each) => {
    let g = 0;
    while (sim.phase !== 'over' && g++ < 2e5) { if (sim.phase !== 'fight') { sim.begin(); continue; } if (each) each(sim); sim.step(1 / 30); sim.events.length = 0; }
    if (sim.phase !== 'over' || !sim.result) throw new Error('battle never ended (' + Math.round(sim.t) + ' s)');
    return sim.result;
  };
  const mazes = {};
  const maze = (G, lv) => mazes[lv.id] || (mazes[lv.id] = G.getMaze(lv));
  const bests = {};
  const best = (S, key, fn) => bests[key] || (bests[key] = fn());
  const rally = (G, lv, seed, skill, nation, extra) => new G.RallySim(lv, Object.assign({ maze: maze(G, lv), seed, rival: true, skill, headless: true, nation }, extra || {})).runToEnd();
  const SKILL = { expert: 0.75, average: 0.6, careless: 0.45, random: 0.3 };
  // a field or siege battle the way the campaign builds it (S.fieldOpts / S.siegeOpts)
  const fight = (G, S, ch, choice, pkg, pick2, seed, policy) => {
    const C = S.CH[ch], r0 = S.rec(ch); r0.choice = choice; r0.battle.losses = 0;
    const o = C.battle === 'siege' ? S.siegeOpts(ch, pkg, {}) : S.fieldOpts(ch, pkg, {});
    S.siegeNext = o.siege;
    const sim = new G.BattleSim({ blue: o.blue, red: o.red, seed, redSkill: o.level.rival.skill, nations: o.nations, spec: o.spec, bluePick: pick2 });
    S.siegeNext = null; sim.headless = true;
    const r = finish(sim, policy);
    return { r, sim };
  };
  const scaleN = (get, set) => (S, f) => { const old = get(S); set(S, old * f); return () => set(S, old); };

  LAB.BATTLES = [
    {
      id: 'escape', name: 'I · Montgisard: the escape', code: 'sal8/src/40-escort.js SAL.ESCAPE.charges[].k',
      knob: {
        label: 'knight charges (share of your army)',
        value: (S) => S.ESCAPE.charges.map((c) => c.k),
        scale: (S, f) => { const old = S.ESCAPE.charges.map((c) => c.k); S.ESCAPE.charges.forEach((c) => { c.k = c.k * f; }); return () => S.ESCAPE.charges.forEach((c, i) => { c.k = old[i]; }); },
      },
      play(G, S, prof, seed, rng) {
        const lv = S.RALLY.montgisard.level, you = rally(G, lv, seed, SKILL[prof], 'ayyubids');
        const blue = G.armyFromSummary(you), red = S.escRed(S.armyTotal(blue));
        const roll = {};
        const send = (when, skip, chance) => (sim, S2) => {
          for (const c of S2.charges) {
            if (c.guards.size || c.i === skip || !(c.state === 'ride' || (when === 'warn' && c.state === 'warn'))) continue;
            if (chance != null) { if (roll[c.i] == null) roll[c.i] = rng() < chance; if (!roll[c.i]) continue; }
            S.escSend(sim, c.i);
          }
        };
        const pol = { expert: send('warn'), average: send('ride'), careless: send('warn', 1), random: send('warn', -1, 0.5) }[prof];
        const sim = new G.BattleSim({ blue, red, seed: seed + 1, redSkill: 0.45, nations: { blue: 'ayyubids', red: 'crusaders' }, spec: { hero: 'saladin', commander: 'baldwin', twist: 'salEscort', fates: { baldwin: { fate: 'withdraw' } } } });
        sim.headless = true; sim.bluePick = 'random'; sim.twState.policy = pol;
        const r = finish(sim), V = sim.twState.V, hp = V ? Math.max(0, V.hp) / V.maxHp : 0;
        return res(r, r.winner === 'blue' ? 1 + (hp >= 0.5 ? 1 : 0) + (half(r) ? 1 : 0) : 0, { hp });
      },
    },
    {
      id: 'cresson', name: 'II · Cresson: Gerard', code: 'sal8/src/31-course.js SAL.BOSS_K',
      knob: { label: 'Gerard\'s army (× Bounce to War\'s)', value: (S) => S.BOSS_K, scale: scaleN((S) => S.BOSS_K, (S, v) => { S.BOSS_K = v; }) },
      play(G, S, prof, seed, rng) {
        const B = G.btw, BB = B.bnc, spec = B.bossSpec(0), red = BB.red(0, null, S.BOSS_K), skill = B.CAMP.chapters[0].B.level.rival.skill;
        const arm = (p, x) => { const a = S.emptyArmy(); a.piker.n = p; a.crossbow.n = x; return a; };
        const plans = { expert: [arm(18, 18), ['C'], 'good'], average: [arm(13, 12), [], 'good'], careless: [arm(9, 9), [], 'none'] };
        const [army, gear, ai] = plans[prof] || pick(rng, [[arm(18, 12), [], 'none'], [arm(13, 12), ['C'], 'good'], [arm(9, 9), [], 'good'], [arm(18, 18), [], 'none']]);
        const sim = new B.BossSim({ blue: army, red, seed, redSkill: skill, march: false, nations: { blue: 'ayyubids', red: 'crusaders' }, spec, ch: 0, gear, powerAI: ai });
        const r = sim.runToEnd(); if (!r) throw new Error('battle never ended');
        return res(r, baseStars(r));
      },
    },
    {
      id: 'hattin', name: 'III · Hattin: the field battle', code: 'sal8/src/41-field.js SAL.MUSTER.hattin.bk',
      knob: { label: 'enemy share of your best muster', value: (S) => S.MUSTER.hattin.bk, scale: scaleN((S) => S.MUSTER.hattin.bk, (S, v) => { S.MUSTER.hattin.bk = v; }) },
      play(G, S, prof, seed, rng) {
        const ch = 2, C = S.CH[ch], M = S.MUSTER.hattin, choice = seed % 2 ? 'A' : 'B';
        S.rec(ch).choice = choice;
        const b = best(S, 'hattin' + choice, () => S.bestMuster(S.cashFor(ch), M.cap, C.mix, false, M.time));
        const plans = { expert: [b.m, 'best'], average: [mk({ spear: 5, sword: 2, foot: 2, mam: 2 }), 'random'], careless: [mk({ spear: 3, sword: 3, foot: 2, horse: 2 }), 'random'] };
        const [m, pk] = plans[prof] || [pick(rng, [mk({ foot: 5, horse: 3, sword: 2 }), mk({ sword: 10 }), mk({ spear: 3, sword: 3, foot: 2, horse: 2 }), mk({ spear: 5, sword: 2, foot: 2, mam: 2 })]), 'random'];
        const { r } = fight(G, S, ch, choice, S.musterPkg(m, {}), pk, seed);
        return res(r, baseStars(r), { choice });
      },
    },
    {
      id: 'jerusalem', name: 'IV · Jerusalem: the siege', code: 'sal8/src/10-chapters.js SAL.CH[3].plan.k',
      knob: { label: 'garrison (× a good muster)', value: (S) => S.CH[3].plan.k, scale: scaleN((S) => S.CH[3].plan.k, (S, v) => { S.CH[3].plan.k = v; }) },
      play(G, S, prof, seed, rng) {
        const ch = 3, C = S.CH[ch], M = S.MUSTER.jerusalem;
        S.rec(ch).choice = 'plan';
        const gathered = best(S, 'jerGather', () => S.gatherTypical(C.plan.gather));
        const top = best(S, 'jerBest', () => S.bestMuster(gathered, M.cap, C.mix, true, M.time));
        const noEng = best(S, 'jerNoEng', () => S.bestMuster(gathered, M.cap, C.mix, false, M.time));
        const one = Object.assign({}, top.m, { have: Object.assign({}, top.m.have, { mangonel: 1, ram: 0 }) });
        const rams = Object.assign({}, top.m, { have: Object.assign({}, top.m.have, { mangonel: 0, ram: 2 }) });
        const plans = { expert: [top.m, 'breach'], average: [one, 'late'], careless: [noEng.m, 'rush'] };
        const [m, policy] = plans[prof] || [pick(rng, [top.m, one, rams, noEng.m]), pick(rng, ['rush', 'breach', 'late'])];
        const storm = (sim) => { const T = sim.twState; if (T.max == null || T.storm) return; if (policy === 'rush' || (T.breached && (policy === 'breach' || sim.t >= T.breachT + 4))) { T.storm = true; for (const u of sim.alive.blue) if (!u.ram) u.stay = null; } };
        const { r, sim } = fight(G, S, ch, 'plan', Object.assign(S.musterPkg(m, {}), { gathered }), 'best', seed, storm);
        const T = sim.twState;
        return res(r, r.winner === 'blue' ? 1 + (T.breachT != null && T.breachT <= S.SIEGE.fast ? 1 : 0) + (half(r) ? 1 : 0) : 0, { breach: T.breachT, policy });
      },
    },
    {
      id: 'tyre', name: 'V · Tyre: the sea battle', code: 'sal8/src/46-sea.js SAL.RALLY.tyre.boost',
      knob: { label: 'Conrad\'s fleet (× his rally)', value: (S) => S.RALLY.tyre.boost, scale: scaleN((S) => S.RALLY.tyre.boost, (S, v) => { S.RALLY.tyre.boost = v; }) },
      play(G, S, prof, seed, rng) {
        const ch = 4, R = S.RALLY.tyre, lv = R.level, choice = seed % 2 ? 'A' : 'B';
        S.rec(ch).choice = choice;
        const you = rally(G, lv, seed, SKILL[prof], 'ayyubidFleet');
        const riv = rally(G, lv, seed * 31 + 7, lv.rival.skill, 'tyreFleet', { prod: lv.rival.prod });
        const o = S.seaOpts(ch, { army: G.armyFromSummary(you), red: S.enemyFrom(R, riv) }, {});
        const sim = new G.NavalSim({ blue: o.blue, red: o.red, seed: seed + 1, redSkill: o.level.rival.skill, nations: o.nations, spec: o.spec, bluePick: prof === 'expert' ? 'best' : 'random' });
        sim.headless = true; const r = sim.runToEnd(); if (!r) throw new Error('battle never ended');
        return res(r, baseStars(r), { choice });
      },
    },
    {
      id: 'acre', name: 'VI · Acre: hold the camp', code: 'sal8/src/41-field.js SAL.MUSTER.acre.bk',
      knob: { label: 'enemy share of your best muster', value: (S) => S.MUSTER.acre.bk, scale: scaleN((S) => S.MUSTER.acre.bk, (S, v) => { S.MUSTER.acre.bk = v; }) },
      play(G, S, prof, seed, rng) {
        const ch = 5, C = S.CH[ch], M = S.MUSTER.acre, GA = C.gather, choice = seed % 2 ? 'A' : 'B';
        S.rec(ch).choice = choice;
        const ref = best(S, 'acreRef', () => { const o = S.gatherTypical(GA.time, GA.boosts); for (const k of S.RES) o[k] += S.GEV.fleet.gift[k]; return o; });
        const b = best(S, 'acreBest' + choice, () => S.bestMuster(S.cutCash(ref, C.decision[choice]), M.cap, C.mix, false, M.time));
        const pol = {
          tap: (sim, T) => { for (const c of T.lanes) if (c.state === 'warn' && !c.guards.size && sim.t > c.C.at + 1) S.holdSend(sim, null, c.i); },
          late: (sim, T) => { T.H.tents.forEach((_, i) => { if (S.holdNeeds(sim, i)) S.holdSend(sim, i); }); },
          none: null,
        };
        const plans = { expert: [b.m, 'tap'], average: [mk({ spear: 4, sword: 2, foot: 2, mam: 2 }), 'late'], careless: [mk({ spear: 3, sword: 2, foot: 2, horse: 2, mam: 1 }), 'none'] };
        const [m, pk] = plans[prof] || [pick(rng, [b.m, mk({ sword: 6, spear: 2 }), mk({ spear: 3, sword: 2, foot: 2, horse: 2, mam: 1 })]), pick(rng, ['tap', 'late', 'none'])];
        const r0 = S.rec(ch); r0.battle.losses = 0;
        const o = S.holdOpts(ch, S.musterPkg(m, {}), {});
        const sim = new G.BattleSim({ blue: o.blue, red: o.red, seed, redSkill: o.level.rival.skill, nations: o.nations, spec: o.spec });
        sim.headless = true; sim.twState.policy = pol[pk];
        const r = finish(sim), k = S.holdStores(sim.twState);
        return res(r, r.winner === 'blue' ? 1 + (k >= 0.5 ? 1 : 0) + (half(r) ? 1 : 0) : 0, { stores: k, choice, policy: pk });
      },
    },
    {
      id: 'arsuf', name: 'VII · Arsuf: the raid', code: 'sal8/src/41-field.js SAL.MUSTER.arsuf.bk',
      knob: { label: 'enemy share of your best muster', value: (S) => S.MUSTER.arsuf.bk, scale: scaleN((S) => S.MUSTER.arsuf.bk, (S, v) => { S.MUSTER.arsuf.bk = v; }) },
      play(G, S, prof, seed, rng) {
        const ch = 6, C = S.CH[ch], M = S.MUSTER.arsuf, choice = seed % 2 ? 'A' : 'B';
        S.rec(ch).choice = choice;
        const b = best(S, 'arsufBest' + choice, () => S.bestMuster(S.cashFor(ch), M.cap, C.mix, false, M.time));
        const lead = (T) => T.wagons.filter((w) => w.alive).sort((a, b2) => b2.y - a.y);
        const pol = {
          spread: (sim, T) => { const free = lead(T).filter((w) => !sim.alive.blue.some((u) => u.raid === w)); if (free.length) S.raidSend(sim, free[0]); },
          focus: (sim, T) => { const L = lead(T), on = L.find((w) => sim.alive.blue.some((u) => u.raid === w)) || L[0]; if (on) S.raidSend(sim, on); },
          one: (sim, T) => { if (!sim.alive.blue.some((u) => u.raid)) { const L = lead(T); if (L[0]) S.raidSend(sim, L[0]); } },
        };
        const plans = { expert: [b.m, 'spread'], average: [mk({ spear: 3, sword: 3, horse: 2, mam: 2 }), 'focus'], careless: [mk({ mam: 3, spear: 5 }), 'one'] };
        const [m, pk] = plans[prof] || [pick(rng, [b.m, mk({ mam: 3, spear: 5 }), mk({ horse: 4, foot: 3, sword: 2 }), mk({ spear: 3, sword: 3, horse: 2, mam: 2 })]), pick(rng, ['spread', 'focus', 'one'])];
        const r0 = S.rec(ch); r0.battle.losses = 0;
        const o = S.raidOpts(ch, S.musterPkg(m, {}), {});
        const sim = new G.BattleSim({ blue: o.blue, red: o.red, seed, redSkill: o.level.rival.skill, nations: o.nations, spec: o.spec });
        sim.headless = true; sim.twState.policy = pol[pk];
        const r = finish(sim), T = sim.twState;
        return res(r, r.winner === 'blue' ? 1 + ((T.prog || 0) <= 0.5 ? 1 : 0) + (half(r) ? 1 : 0) : 0, { burnt: T.broken, choice, policy: pk });
      },
    },
    {
      id: 'jaffa', name: 'VIII · Jaffa: Richard', code: 'sal8/src/10-chapters.js SAL.CH[7].boss.ref',
      knob: { label: 'Richard\'s army (soldiers before the decision)', value: (S) => S.CH[7].boss.ref, scale: scaleN((S) => S.CH[7].boss.ref, (S, v) => { S.CH[7].boss.ref = v; }) },
      play(G, S, prof, seed, rng) {
        const B = G.btw, ch = 7, C = S.CH[ch], bch = C.bnc, skill = B.CAMP.chapters[bch].B.level.rival.skill, choice = seed % 2 ? 'A' : 'B';
        S.rec(ch).choice = choice;
        const D = C.decision[choice], red = S.bossRed(ch), spec = Object.assign(B.bossSpec(bch), D.hero ? { hero: D.hero } : {});
        const arm = (p, x, k, xa, ka) => { const a = S.emptyArmy(); a.piker.n = p; a.crossbow.n = x; a.knight.n = k; if (xa) a.crossbow.armor = x; if (ka) a.knight.armor = k; return a; };
        const top = choice === 'B' ? arm(18, 12, 36, 1, 1) : arm(18, 12, 9, 1, 0);
        const plans = { expert: [top, ['C', 'H', 'N'], 'good'], average: [arm(12, 8, 6, 0, 0), ['C', 'H'], 'good'], careless: [arm(6, 6, 6, 0, 0), ['C'], 'none'] };
        const [army, gear, ai] = plans[prof] || pick(rng, [[arm(18, 12, 9, 1, 0), [], 'none'], [arm(12, 8, 6, 0, 0), ['C', 'H'], 'none'], [arm(6, 6, 6, 0, 0), ['C'], 'good'], [top, ['C', 'H', 'N'], 'none']]);
        const sim = new B.BossSim({ blue: army, red, seed, redSkill: skill, march: false, nations: { blue: 'ayyubids', red: 'crusaders' }, spec, ch: bch, gear, powerAI: ai });
        const r = sim.runToEnd(); if (!r) throw new Error('battle never ended');
        return res(r, baseStars(r), { choice });
      },
    },
  ];
  // one game, with the knob scaled by f (1 = as the game ships); errors come back as results, not throws
  LAB.play = function (G, S, battleId, prof, seed, f) {
    const B = LAB.BATTLES.find((b) => b.id === battleId), rng = rngOf(seed * 7 + 3);
    const undo = f && f !== 1 ? B.knob.scale(S, f) : null;
    const t0 = Date.now();
    try { const r = B.play(G, S, prof, seed, rng); r.ms = Date.now() - t0; return r; }
    catch (e) { return { error: String((e && e.message) || e), seed, ms: Date.now() - t0 }; }
    finally { if (undo) undo(); }
  };
  LAB.knobs = (S) => LAB.BATTLES.map((b) => ({ id: b.id, label: b.knob.label, value: b.knob.value(S), code: b.code, name: b.name }));
})(typeof self !== 'undefined' ? self : globalThis);
