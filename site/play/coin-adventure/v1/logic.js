// Coin Adventure - pure game rules (no DOM). Shared by the browser build and tools/sim.js.
(function (root) {
  const COINS = {
    attack:   { name: 'Attack',   desc: 'Hit the target for ATK damage', price: 50 },
    defense:  { name: 'Defense',  desc: 'Gain a shield that absorbs damage', price: 45 },
    heal:     { name: 'Heal',     desc: 'Restore HP', price: 50 },
    fireball: { name: 'Fireball', desc: 'Burn ALL enemies', price: 70 },
    evade:    { name: 'Evasion',  desc: 'Dodge the next enemy attack', price: 45 },
  };

  const ENEMIES = {
    slime:    { name: 'Slime',       hp: 16,  atk: 4, gold: 12, xp: 4 },
    bat:      { name: 'Bat',         hp: 12,  atk: 5, gold: 12, xp: 4 },
    skeleton: { name: 'Skeleton',    hp: 26,  atk: 6, gold: 20, xp: 7 },
    goblin:   { name: 'Goblin',      hp: 32,  atk: 9, gold: 22, xp: 8 },
    boss:     { name: 'Orc Warlord', hp: 150, atk: 11, heavy: 22, gold: 80, xp: 30, boss: true },
  };

  // Five stages per world; the last one is the boss.
  const STAGES = [
    ['slime', 'slime'],
    ['slime', 'bat', 'slime'],
    ['skeleton', 'slime', 'bat'],
    ['goblin', 'skeleton', 'bat'],
    ['boss'],
  ];
  const MARKET_AFTER = [0, 1, 2, 3]; // stage indexes followed by the coin market
  const WORLD_SCALE = 1.45;
  const STAGE_CLEAR_GOLD = 15;
  const STAGE_CLEAR_HEAL = 0.2; // fraction of max HP restored between stages
  const SKIP_GOLD = 10;

  const UPGRADES = [
    { id: 'atk',   title: 'Attack Up',    text: 'Increase Attack by',          amt: '+20%', icon: 'attack',   apply: h => { h.atk *= 1.2; } },
    { id: 'hp',    title: 'Max HP Up',    text: 'Increase Max HP by',          amt: '+25%', icon: 'maxhp',    apply: h => { const inc = Math.round(h.maxHp * 0.25); h.maxHp += inc; h.hp += inc; } },
    { id: 'heal',  title: 'Heal Power',   text: 'Increase heal amount by',     amt: '+30%', icon: 'heal',     apply: h => { h.heal *= 1.3; } },
    { id: 'def',   title: 'Shield Up',    text: 'Increase shield amount by',   amt: '+30%', icon: 'defense',  apply: h => { h.def *= 1.3; } },
    { id: 'fire',  title: 'Fire Mastery', text: 'Increase Fireball damage by', amt: '+35%', icon: 'fireball', apply: h => { h.fire *= 1.35; } },
    { id: 'luck',  title: 'Lucky Coins',  text: 'Action side chance',          amt: '+8%',  icon: 'blank',    apply: h => { h.luck = Math.min(0.9, h.luck + 0.08); } },
    { id: 'combo', title: 'Combo Master', text: 'Combo step raised by',        amt: '+0.25',icon: 'combo',    apply: h => { h.comboStep += 0.25; } },
    { id: 'mend',  title: 'Second Wind',  text: 'Restore HP by',               amt: '60%',  icon: 'maxhp',    apply: h => { h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * 0.6)); } },
  ];

  function newRun(rng) {
    return {
      rng: rng || Math.random,
      hero: { maxHp: 40, hp: 40, atk: 6, def: 5, heal: 6, fire: 4, luck: 0.6, comboStep: 0.5,
              block: 0, dodge: 0, level: 1, xp: 0 },
      deck: ['attack', 'attack', 'defense'],
      gold: 40, stage: 0, world: 1, turn: 0, enemies: [], kills: 0, flips: 0, bestCombo: 0,
    };
  }

  function xpForNext(level) { return 8 + level * 7; }

  function spawnStage(s) {
    const scale = Math.pow(WORLD_SCALE, s.world - 1);
    s.enemies = STAGES[s.stage].map((key, i) => {
      const d = ENEMIES[key];
      const hp = Math.round(d.hp * scale);
      return { key, id: i, name: d.name, boss: !!d.boss, maxHp: hp, hp,
               atk: Math.round(d.atk * scale), heavy: d.heavy ? Math.round(d.heavy * scale) : 0,
               gold: Math.round(d.gold * (1 + 0.3 * (s.world - 1))), xp: d.xp, acted: 0 };
    });
    s.turn = 0;
    s.hero.block = 0;
    s.hero.dodge = 0;
  }

  function alive(s) { return s.enemies.filter(e => e.hp > 0); }

  function intent(e) {
    if (e.boss && e.acted % 3 === 2) return { dmg: e.heavy, heavy: true };
    return { dmg: e.atk, heavy: false };
  }

  // Flip every coin in deck order. Consecutive action sides build a streak:
  // x1, x1.5, x2 ... A blank resets the streak for the remaining coins only.
  function flipCoins(s) {
    let streak = 0;
    const out = [];
    for (const type of s.deck) {
      if (s.rng() < s.hero.luck) {
        const mult = 1 + streak * s.hero.comboStep;
        streak++;
        out.push({ type, hit: true, mult });
      } else {
        streak = 0;
        out.push({ type, hit: false });
      }
      s.bestCombo = Math.max(s.bestCombo, streak);
    }
    s.flips++;
    return out;
  }

  function damageEnemy(s, e, amount, ev) {
    const dealt = Math.min(e.hp, amount);
    e.hp -= dealt;
    const killed = e.hp <= 0;
    if (killed) { s.gold += e.gold; s.hero.xp += e.xp; s.kills++; }
    ev.hits.push({ enemy: e.id, amount, killed, gold: killed ? e.gold : 0 });
  }

  // Resolve one queued action. Returns an event describing what happened for the UI.
  function applyAction(s, act, targetId) {
    const h = s.hero;
    const ev = { type: act.type, mult: act.mult, hits: [], amount: 0 };
    const live = alive(s);
    if (act.type === 'attack') {
      if (!live.length) return ev;
      const t = live.find(e => e.id === targetId) || live[0];
      damageEnemy(s, t, Math.round(h.atk * act.mult), ev);
    } else if (act.type === 'fireball') {
      for (const e of live) damageEnemy(s, e, Math.round(h.fire * act.mult), ev);
    } else if (act.type === 'defense') {
      ev.amount = Math.round(h.def * act.mult);
      h.block += ev.amount;
    } else if (act.type === 'heal') {
      const amt = Math.round(h.heal * act.mult);
      ev.amount = Math.min(amt, h.maxHp - h.hp);
      h.hp += ev.amount;
    } else if (act.type === 'evade') {
      ev.amount = Math.max(1, Math.floor(act.mult));
      h.dodge += ev.amount;
    }
    return ev;
  }

  // Every living enemy attacks once. Dodge charges are spent first, then shield, then HP.
  function enemyAttack(s, e) {
    const h = s.hero;
    const it = intent(e);
    e.acted++;
    const r = { enemy: e.id, dmg: it.dmg, heavy: it.heavy, dodged: false, blocked: 0, taken: 0 };
    if (h.dodge > 0) { h.dodge--; r.dodged = true; return r; }
    r.blocked = Math.min(h.block, it.dmg);
    h.block -= r.blocked;
    r.taken = Math.min(h.hp, it.dmg - r.blocked);
    h.hp -= r.taken;
    return r;
  }

  function endRound(s) { s.hero.block = 0; s.hero.dodge = 0; s.turn++; }

  function canLevel(s) { return s.hero.xp >= xpForNext(s.hero.level); }
  function levelUp(s) { s.hero.xp -= xpForNext(s.hero.level); s.hero.level++; }

  function pick(s, arr, n) {
    const a = arr.slice(), out = [];
    while (a.length && out.length < n) out.push(a.splice(Math.floor(s.rng() * a.length), 1)[0]);
    return out;
  }
  function upgradeChoices(s) { return pick(s, UPGRADES, 3); }
  function marketOffers(s) { return pick(s, Object.keys(COINS), 3); }
  function coinPrice(s, type) { return Math.round(COINS[type].price * (1 + 0.25 * (s.world - 1))); }

  function stageCleared(s) {
    s.gold += STAGE_CLEAR_GOLD;
    const heal = Math.round(s.hero.maxHp * STAGE_CLEAR_HEAL);
    const before = s.hero.hp;
    s.hero.hp = Math.min(s.hero.maxHp, s.hero.hp + heal);
    return { gold: STAGE_CLEAR_GOLD, healed: s.hero.hp - before };
  }

  const api = { COINS, ENEMIES, STAGES, UPGRADES, MARKET_AFTER, SKIP_GOLD, STAGE_CLEAR_GOLD,
    newRun, xpForNext, spawnStage, alive, intent, flipCoins, applyAction, enemyAttack, endRound,
    canLevel, levelUp, upgradeChoices, marketOffers, coinPrice, stageCleared };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CoinLogic = api;
})(this);
