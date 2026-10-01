// Zamilur Rashid personal site: clocks, weather, status, countdowns (the cover photo script sits in the page, after the cover)
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Approximate sunrise and sunset in UTC hours, defined by the cover photo script in the page
  var sunTimesUTC = window.ZR_sunTimesUTC || function () { return { rise: 11, set: 23 }; };

  // Temperatures in °F for visitors whose browser is set to the US (and a few other °F countries), °C otherwise
  var locale = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US';
  var region = (locale.split('-')[1] || 'US').toUpperCase();
  var useF = ['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'FM', 'MH'].indexOf(region) !== -1;

  function tempText(c) {
    return Math.round(useF ? c * 9 / 5 + 32 : c) + '°' + (useF ? 'F' : 'C');
  }

  // Open-Meteo's weather codes (WMO) in words
  var WX_WORDS = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers', 85: 'Snow showers', 86: 'Snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm, hail', 99: 'Thunderstorm, hail'
  };

  // Which icon a weather description gets
  function wxKind(text) {
    var s = String(text || '').toLowerCase();
    if (/thunder|storm|lightning/.test(s)) return 'storm';
    if (/snow|sleet|flurr|ice|freez|hail|blizzard/.test(s)) return 'snow';
    if (/rain|drizzle|shower/.test(s)) return 'rain';
    if (/fog|mist|haze|smoke|dust|sand/.test(s)) return 'fog';
    if (/partly|mostly.?(sunny|clear)|passing|scattered|few|broken|intermittent/.test(s)) return 'partly';
    if (/cloud|overcast|gr[ae]y/.test(s)) return 'cloud';
    if (/clear|sun|fair|fine/.test(s)) return 'clear';
    return 'other';
  }

  function skyFor(kind, isDay) {
    return kind === 'clear' || kind === 'other' ? (isDay ? 'sun' : 'moon')
      : kind === 'partly' ? (isDay ? 'sun-cloud' : 'moon-cloud') : kind;
  }

  function setSky(svg, sky) {
    if (!svg || svg.getAttribute('data-sky') === sky) return;
    svg.setAttribute('data-sky', sky);
    svg.setAttribute('class', 'sky-ico is-' + (sky === 'sun' || sky === 'moon' ? sky : 'wx'));
    svg.querySelector('use').setAttribute('href', '#' + sky + '-ico');
  }

  // Live weather for the four cities, Rochester's next hours and the Rochester and Dhaka days, fetched by the visitor's browser
  // from Open-Meteo (free, no key) and kept for 30 minutes. Hosts that block outside requests,
  // like the claude.ai viewer, get no weather: the clocks hide their weather row and the
  // Rochester and Dhaka panels keep just sunrise and sunset.
  var LIVE_WX = (function () {
    var PLACES = [
      ['America/New_York', 43.1566, -77.6088],
      ['Europe/Paris', 48.8566, 2.3522],
      ['Asia/Dhaka', 23.8103, 90.4125],
      ['Asia/Seoul', 37.5665, 126.978]
    ];
    var KEY = 'zr-weather-v3';
    var REFRESH = 30 * 60000;
    var KEEP = 3 * 3600000;
    var state = null;
    var subs = [];
    var busy = false;
    var fails = 0;

    function emit() {
      subs.forEach(function (fn) { try { fn(state); } catch (e) { /* keep the others going */ } });
    }

    function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }

    function parse(json) {
      var list = Array.isArray(json) ? json : [json];
      if (list.length !== PLACES.length) return null;
      var out = { updated: Date.now(), cities: {}, days: [] };
      PLACES.forEach(function (p, i) {
        var cur = (list[i] && list[i].current) || {};
        if (num(cur.temperature_2m) !== null) out.cities[p[0]] = { c: cur.temperature_2m, code: num(cur.weather_code), day: cur.is_day !== 0, text: WX_WORDS[cur.weather_code] || '' };
      });
      function daysOf(d) {
        if (!d || !Array.isArray(d.time)) return [];
        return d.time.map(function (date, j) {
          function at(k) { return d[k] ? d[k][j] : null; }
          return {
            date: date,
            code: num(at('weather_code')),
            max: num(at('temperature_2m_max')),
            min: num(at('temperature_2m_min')),
            pp: num(at('precipitation_probability_max')),
            rain: (num(at('rain_sum')) || 0) + (num(at('showers_sum')) || 0),
            snow: num(at('snowfall_sum')) || 0,
            rise: typeof at('sunrise') === 'string' ? at('sunrise') : null,
            set: typeof at('sunset') === 'string' ? at('sunset') : null
          };
        });
      }
      out.days = daysOf(list[0] && list[0].daily);
      out.dhaka = daysOf(list[2] && list[2].daily);
      // Rochester's hourly forecast from the current hour, in Rochester time
      var h = list[0] && list[0].hourly;
      out.hours = h && Array.isArray(h.time) ? h.time.map(function (time, j) {
        function at(k) { return h[k] ? num(h[k][j]) : null; }
        return { time: time, c: at('temperature_2m'), code: at('weather_code'), pp: at('precipitation_probability'), day: at('is_day') !== 0 };
      }) : [];
      return out;
    }

    function load() {
      if (busy || fails >= 2 || !window.fetch) return;
      busy = true;
      var lat = [], lon = [], zones = [];
      PLACES.forEach(function (p) { zones.push(encodeURIComponent(p[0])); lat.push(p[1]); lon.push(p[2]); });
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.join(',') + '&longitude=' + lon.join(',') +
        '&current=temperature_2m,weather_code,is_day' +
        '&hourly=temperature_2m,weather_code,precipitation_probability,is_day&forecast_hours=8' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,rain_sum,showers_sum,snowfall_sum,sunrise,sunset' +
        '&timezone=' + zones.join(',') + '&forecast_days=2';
      fetch(url)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (json) {
          var fresh = parse(json);
          if (!fresh) throw new Error('unexpected reply');
          fails = 0;
          state = fresh;
          try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) { /* no storage: fetch again next visit */ }
          emit();
        })
        .catch(function () { fails++; })
        .then(function () { busy = false; });
    }

    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && saved.updated && saved.cities && Date.now() - saved.updated < KEEP) state = saved;
    } catch (e) { /* storage blocked */ }
    if (!state || Date.now() - state.updated > REFRESH) load();
    setInterval(function () {
      if (!document.hidden && (!state || Date.now() - state.updated > REFRESH)) load();
    }, 5 * 60000);

    return { on: function (fn) { subs.push(fn); if (state) fn(state); } };
  })();

  // World clocks, west to east from Rochester: rolling digits, the local date,
  // a day, night or weather icon, how far ahead of Rochester each city is,
  // and the temperature from the weather snapshot published with the page
  (function () {
    var HOME = 'America/New_York';
    var COORDS = {
      'America/New_York': [43.1566, -77.6088],
      'Europe/Paris': [48.8566, 2.3522],
      'Asia/Dhaka': [23.8103, 90.4125],
      'Asia/Seoul': [37.5665, 126.978]
    };
    var stops = Array.prototype.slice.call(document.querySelectorAll('.tz-stop[data-tz]'));
    if (!stops.length) return;
    var formats = {};

    function format(tz, kind) {
      var k = tz + '|' + kind;
      if (!formats[k]) {
        var opts = kind === 'date' ? { weekday: 'short', month: 'short', day: 'numeric' }
          : kind === 'parts' ? { hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }
          : kind === 'abbr' ? { timeZoneName: 'short' }
          : kind === 'zone' ? { timeZoneName: 'long' }
          : { weekday: 'long', month: 'long', day: 'numeric' };
        opts.timeZone = tz;
        formats[k] = new Intl.DateTimeFormat('en-US', opts);
      }
      return formats[k];
    }

    function parts(tz, kind, now) {
      var out = {};
      format(tz, kind).formatToParts(now).forEach(function (p) { out[p.type] = p.value; });
      return out;
    }

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    // 24-hour clock, like 07:05 or 19:30
    function clockText(tz, now) {
      var p = parts(tz, 'parts', now);
      return pad2(+p.hour % 24) + ':' + pad2(+p.minute);
    }

    // Minutes the zone is ahead of UTC right now (follows daylight saving)
    function offsetMinutes(tz, now) {
      var p = parts(tz, 'parts', now);
      var local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
      return Math.round((local - Math.floor(now.getTime() / 60000) * 60000) / 60000);
    }

    function gapShort(mins) {
      var h = Math.floor(Math.abs(mins) / 60);
      var m = Math.abs(mins) % 60;
      return (h ? h + 'h' : '') + (h && m ? ' ' : '') + (m ? m + 'm' : '') || '0h';
    }

    function gapWords(mins) {
      var h = Math.floor(Math.abs(mins) / 60);
      var m = Math.abs(mins) % 60;
      var bits = [];
      if (h) bits.push(h + (h === 1 ? ' hour' : ' hours'));
      if (m) bits.push(m + ' minutes');
      if (!bits.length) return 'same time as Rochester';
      return bits.join(' ') + (mins > 0 ? ' ahead of' : ' behind') + ' Rochester';
    }

    function setText(el, text) {
      if (el && el.textContent !== text) el.textContent = text;
    }

    function setDate(el, text) {
      if (!el || el.textContent === text) return;
      var first = el.textContent === '';
      el.textContent = text;
      if (!first) {
        el.classList.remove('changed');
        void el.offsetWidth;
        el.classList.add('changed');
      }
    }

    function digit(c, cls) {
      var v = document.createElement('span');
      if (cls) v.className = cls;
      v.textContent = c;
      return v;
    }

    // Each digit and the colon get their own slot, so the digits can roll
    function renderTime(box, text, animate) {
      var tokens = text.match(/\d|:|\S/g) || [];
      var pattern = tokens.map(function (t) { return /\d/.test(t) ? '0' : t; }).join('');
      if (box.getAttribute('data-pattern') !== pattern) {
        box.setAttribute('data-pattern', pattern);
        box.innerHTML = '';
        tokens.forEach(function (c) {
          var el = document.createElement('span');
          if (/\d/.test(c)) {
            el.className = 'dg';
            el.appendChild(digit(c, animate && !reduceMotion ? 'in' : ''));
          } else if (c === ':') {
            el.className = 'colon';
            el.textContent = ':';
          } else {
            el.className = 'txt';
            el.textContent = c;
          }
          box.appendChild(el);
        });
        return;
      }
      tokens.forEach(function (c, i) {
        var slot = box.children[i];
        if (!slot) return;
        if (slot.className === 'txt') {
          if (slot.textContent !== c) slot.textContent = c;
          return;
        }
        if (slot.className !== 'dg') return;
        var current = slot.lastElementChild;
        if (current && current.textContent === c) return;
        if (!animate || reduceMotion) {
          slot.innerHTML = '';
          slot.appendChild(digit(c, ''));
          return;
        }
        Array.prototype.slice.call(slot.children).forEach(function (old) {
          old.className = 'out';
          setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 600);
        });
        slot.appendChild(digit(c, 'in'));
      });
    }

    // Live weather from LIVE_WX, hidden once it is more than 3 hours old
    var WX_MAX_AGE = 3 * 3600000;
    var wx = null;
    var wxTime = NaN;
    var note = document.querySelector('.tz-note');
    var noteAge = document.querySelector('.tz-note-age');

    function wxFresh(now) {
      var age = now.getTime() - wxTime;
      return !isNaN(wxTime) && age > -600000 && age < WX_MAX_AGE;
    }

    function wxLabel(kind, isDay, w) {
      if (kind === 'clear') return isDay ? 'Sunny' : 'Clear';
      if (kind === 'partly') return 'Partly cloudy';
      if (kind === 'cloud') return 'Cloudy';
      var t = String(w.text || '');
      return t.charAt(0).toUpperCase() + t.slice(1);
    }

    function ageText(ms) {
      var mins = Math.max(0, Math.round(ms / 60000));
      if (mins < 2) return 'just now';
      if (mins < 60) return mins + ' min ago';
      var h = Math.floor(mins / 60);
      return h + (h === 1 ? ' hour' : ' hours') + ' ago';
    }

    function tick(animate) {
      var now = new Date();
      var utc = now.getUTCHours() + now.getUTCMinutes() / 60;
      var fresh = wxFresh(now);
      var offsets = stops.map(function (el) {
        try { return offsetMinutes(el.getAttribute('data-tz'), now); } catch (e) { return null; }
      });
      var homeOffset = offsets[0];
      stops.forEach(function (el, i) {
        var tz = el.getAttribute('data-tz');
        var city = el.getAttribute('data-city');
        try {
          var timeText = clockText(tz, now);
          renderTime(el.querySelector('.clock-time'), timeText, animate);

          var d = parts(tz, 'date', now);
          setDate(el.querySelector('.tz-date-long'), format(tz, 'date').format(now));
          setDate(el.querySelector('.tz-date-short'), d.weekday + ' ' + d.day);

          // Day or night from sunrise and sunset, plus the weather when the snapshot is fresh
          var c = COORDS[tz];
          var sun = sunTimesUTC(now, c[0], c[1]);
          var isDay = sun.rise < sun.set ? utc >= sun.rise && utc < sun.set : utc >= sun.rise || utc < sun.set;
          var w = fresh && wx.cities ? wx.cities[tz] : null;
          if (w && typeof w.c !== 'number') w = null;
          var kind = w ? wxKind(w.text) : 'other';
          setSky(el.querySelector('.sky-ico'), skyFor(kind, isDay));
          var row = el.querySelector('.tz-wx');
          var wxWords = '';
          if (w) {
            var temp = tempText(w.c);
            var label = wxLabel(kind, isDay, w);
            setText(el.querySelector('.tz-temp'), temp);
            setText(el.querySelector('.tz-cond'), label);
            if (row.hidden) row.hidden = false;
            wxWords = '. Weather: ' + temp + ', ' + label.toLowerCase();
          } else if (!row.hidden) {
            row.hidden = true;
          }

          var longDate = format(tz, 'long').format(now);
          if (tz === HOME) {
            setText(el.querySelector('.tz-abbr'), parts(tz, 'abbr', now).timeZoneName || 'ET');
            setText(el.querySelector('.clock-sr'), city + ', Upstate New York, where I live, on ' + (parts(tz, 'zone', now).timeZoneName || 'Eastern Time') + ': ' + timeText + ', ' + longDate + wxWords);
          } else if (offsets[i] !== null && homeOffset !== null) {
            var diff = offsets[i] - homeOffset;
            setText(el.querySelector('.tz-plus'), diff < 0 ? '−' : '+');
            setText(el.querySelector('.tz-n'), gapShort(diff));
            setText(el.querySelector('.tz-word'), diff < 0 ? ' behind' : ' ahead');
            setText(el.querySelector('.clock-sr'), city + ': ' + timeText + ', ' + longDate + ', ' + gapWords(diff) + wxWords);
          }

          // Space the stops by how many hours separate each city from the next one
          var next = offsets[i + 1];
          var grow = next == null || offsets[i] === null ? 0 : Math.max(0, (next - offsets[i]) / 60);
          var growText = String(Math.round(grow * 100) / 100);
          if (el.style.getPropertyValue('--gap-h') !== growText) el.style.setProperty('--gap-h', growText);
        } catch (e) { /* leave this clock as it is */ }
      });
      if (note && noteAge) {
        if (fresh) {
          setText(noteAge, ageText(now.getTime() - wxTime));
          if (note.hidden) note.hidden = false;
        } else if (!note.hidden) {
          note.hidden = true;
        }
      }
    }

    tick(false);
    setInterval(function () { tick(true); }, 1000);
    LIVE_WX.on(function (state) { wx = state; wxTime = state.updated; tick(false); });
  })();

  // Status beside my photo: day chips, what I'm probably doing, and the work-hours countdown.
  // The cover photo itself is switched by the script in the page (window.ZR_COVER).
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var badge = hero.querySelector('.photo-badge');
    var TZ = 'America/New_York';
    var lastKey = '';

    function localParts(now) {
      var out = {};
      new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(now)
        .forEach(function (p) { out[p.type] = p.value; });
      return {
        weekday: out.weekday,
        year: parseInt(out.year, 10),
        month: parseInt(out.month, 10),
        day: parseInt(out.day, 10),
        hour: parseInt(out.hour, 10) % 24,
        minute: parseInt(out.minute, 10)
      };
    }

    // US federal holidays, with Saturday/Sunday dates observed on Friday/Monday
    function nthWeekday(y, m, weekday, n) {
      var first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
      return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
    }

    function lastWeekday(y, m, weekday) {
      var last = new Date(Date.UTC(y, m, 0));
      return last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7);
    }

    function federalHolidays(y) {
      var list = [];
      function fixed(name, yy, m, d) {
        var date = new Date(Date.UTC(yy, m - 1, d));
        var dow = date.getUTCDay();
        list.push({ name: name, key: yy + '-' + m + '-' + d });
        if (dow === 6 || dow === 0) {
          var obs = new Date(Date.UTC(yy, m - 1, d + (dow === 6 ? -1 : 1)));
          list.push({ name: name + ' (observed)', key: obs.getUTCFullYear() + '-' + (obs.getUTCMonth() + 1) + '-' + obs.getUTCDate() });
        }
      }
      fixed("New Year's Day", y, 1, 1);
      fixed("New Year's Day", y + 1, 1, 1);
      list.push({ name: 'Martin Luther King Jr. Day', key: y + '-1-' + nthWeekday(y, 1, 1, 3) });
      list.push({ name: "Washington's Birthday", key: y + '-2-' + nthWeekday(y, 2, 1, 3) });
      list.push({ name: 'Memorial Day', key: y + '-5-' + lastWeekday(y, 5, 1) });
      fixed('Juneteenth', y, 6, 19);
      fixed('Independence Day', y, 7, 4);
      list.push({ name: 'Labor Day', key: y + '-9-' + nthWeekday(y, 9, 1, 1) });
      list.push({ name: 'Columbus Day', key: y + '-10-' + nthWeekday(y, 10, 1, 2) });
      fixed('Veterans Day', y, 11, 11);
      list.push({ name: 'Thanksgiving Day', key: y + '-11-' + nthWeekday(y, 11, 4, 4) });
      fixed('Christmas Day', y, 12, 25);
      return list;
    }

    function holidayOn(t) {
      var key = t.year + '-' + t.month + '-' + t.day;
      var list = federalHolidays(t.year);
      for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i].name;
      return '';
    }

    // Work schedule from schedule.js: work days, hours, and holidays or breaks
    var SCHED = window.ZR_SCHEDULE || {};
    var WORK_DAYS = SCHED.workDays || [1, 2, 3, 4, 5, 6];
    var START = typeof SCHED.start === 'number' ? SCHED.start : 7;
    var END = typeof SCHED.end === 'number' ? SCHED.end : 19;
    var TIME_OFF = (SCHED.timeOff || []).filter(function (b) { return b && b.start; });
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function timeOffOn(y, m, d) {
      var iso = y + '-' + pad(m) + '-' + pad(d);
      for (var i = 0; i < TIME_OFF.length; i++) {
        if (iso >= TIME_OFF[i].start && iso <= (TIME_OFF[i].end || TIME_OFF[i].start)) return TIME_OFF[i];
      }
      return null;
    }

    // What kind of day a Rochester date is (overflowing days roll into the next month)
    function dayInfo(y, m, d) {
      var date = new Date(Date.UTC(y, m - 1, d));
      var info = { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate(), dow: date.getUTCDay() };
      info.holiday = holidayOn({ year: info.y, month: info.m, day: info.d });
      info.off = timeOffOn(info.y, info.m, info.d);
      info.work = WORK_DAYS.indexOf(info.dow) >= 0 && !info.holiday && !info.off;
      return info;
    }

    // Minutes Rochester is ahead of UTC at a given moment, and the moment a Rochester clock shows h:00
    function nyOffset(date) {
      var p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        .formatToParts(date)
        .forEach(function (x) { p[x.type] = x.value; });
      return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(date.getTime() / 60000) * 60000) / 60000);
    }

    function nyMoment(y, m, d, h) {
      var guess = Date.UTC(y, m - 1, d, h);
      var first = guess - nyOffset(new Date(guess)) * 60000;
      return guess - nyOffset(new Date(first)) * 60000;
    }

    // 24-hour clock: 7 -> 07:00, 19.5 -> 19:30
    function hourText(h) {
      var whole = Math.floor(h);
      return pad(whole % 24) + ':' + pad(Math.round((h - whole) * 60));
    }

    function daysText(long) {
      var d = WORK_DAYS.slice().sort();
      var run = d.length > 1 && d[d.length - 1] - d[0] === d.length - 1;
      var name = function (i) { return long ? DAYS[i] : DAYS[i].slice(0, 3); };
      if (run) return name(d[0]) + (long ? ' to ' : '–') + name(d[d.length - 1]);
      return d.map(name).join(', ');
    }

    function workState(now) {
      var t = localParts(now);
      var hour = t.hour + t.minute / 60;
      var today = dayInfo(t.year, t.month, t.day);
      if (today.work && hour >= START && hour < END) {
        var from = nyMoment(today.y, today.m, today.d, START);
        var to = nyMoment(today.y, today.m, today.d, END);
        return { working: true, today: today, target: to, progress: (now.getTime() - from) / (to - from) };
      }
      var next = today.work && hour < START ? today : null;
      for (var i = 1; !next && i <= 120; i++) {
        var info = dayInfo(t.year, t.month, t.day + i);
        if (info.work) next = info;
      }
      return { working: false, today: today, next: next, target: next ? nyMoment(next.y, next.m, next.d, START) : null };
    }

    // "9 hours 6 minutes", "1 hour", "45 minutes"
    function spanText(ms) {
      var mins = Math.floor(Math.max(0, ms) / 60000);
      var h = Math.floor(mins / 60), m = mins % 60;
      if (!h && !m) return 'less than a minute';
      return [h ? h + (h === 1 ? ' hour' : ' hours') : '', m ? m + (m === 1 ? ' minute' : ' minutes') : ''].filter(Boolean).join(' ');
    }

    var shift = hero.querySelector('.shift');
    var shiftText = shift && shift.querySelector('.shift-text');

    function setText(el, text) {
      if (el && el.textContent !== text) el.textContent = text;
    }

    // One line: "Working for another 9 hours 6 minutes", or when he's back
    function renderShift() {
      if (!shift) return;
      var now = new Date();
      var w = workState(now);
      var text;
      if (w.working) text = 'Working for another ' + spanText(w.target - now.getTime());
      else {
        var t = w.today;
        text = t.holiday ? 'Day off for ' + t.holiday.replace(' (observed)', '')
          : t.off ? (t.off.holiday ? 'Day off for ' : 'On a break: ') + t.off.label
          : WORK_DAYS.indexOf(t.dow) < 0 ? DAYS[t.dow] + ' off' : 'Off work';
        if (w.target) {
          var left = w.target - now.getTime();
          var gap = Math.round((Date.UTC(w.next.y, w.next.m - 1, w.next.d) - Date.UTC(t.y, t.m - 1, t.d)) / 86400000);
          text += ' · back ' + (left < 24 * 3600000 ? 'in ' + spanText(left)
            : (gap < 7 ? DAYS[w.next.dow] : DAYS[w.next.dow].slice(0, 3) + ' ' + w.next.d + ' ' + MONTHS[w.next.m - 1]) + ' at ' + hourText(START));
        }
      }
      if (shift.getAttribute('data-state') !== (w.working ? 'work' : 'off')) shift.setAttribute('data-state', w.working ? 'work' : 'off');
      setText(shiftText, text);
    }

    if (shift) shift.setAttribute('title', 'Work hours: ' + daysText(false) + ' · ' + hourText(START) + '–' + hourText(END) + ' Eastern');

    // Rochester in the panel under the status: now and the next three hours, then today's forecast
    // (tomorrow's after 20:00). Sunrise and sunset come from the forecast, or are worked out here without one.
    var wxBox = hero.querySelector('.wx-today');
    var forecast = null;
    var SNOW_CODES = [71, 73, 75, 77, 85, 86];
    var DAY_WORDS = { 0: 'Sunny', 1: 'Mostly sunny', 3: 'Cloudy' };

    function clockFromUTC(hoursUTC, moment) {
      var local = hoursUTC + nyOffset(new Date(moment)) / 60;
      var mins = Math.round((((local % 24) + 24) % 24) * 60) % 1440;
      return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
    }

    function renderHours(t) {
      var list = wxBox.querySelector('.wx-hours');
      var cur = forecast && forecast.cities ? forecast.cities['America/New_York'] : null;
      var nowKey = t.year + '-' + pad(t.month) + '-' + pad(t.day) + 'T' + pad(t.hour) + ':' + pad(t.minute);
      var next = (forecast && forecast.hours || []).filter(function (h) { return h.time > nowKey && h.c !== null; }).slice(0, 3);
      var ok = !!(cur && cur.code !== null && cur.code !== undefined && next.length === 3);
      list.hidden = !ok;
      var cond = wxBox.querySelector('.wx-cond');
      cond.hidden = !ok;
      if (!ok) return;
      var cells = [{ label: 'Now', c: cur.c, code: cur.code, day: cur.day, pp: null }].concat(next.map(function (h) {
        return { label: h.time.slice(11, 16), c: h.c, code: h.code, day: h.day, pp: h.pp };
      }));
      Array.prototype.forEach.call(list.children, function (li, i) {
        var x = cells[i];
        var words = (x.day && DAY_WORDS[x.code]) || WX_WORDS[x.code] || '';
        setText(li.querySelector('.wx-hour-time'), x.label);
        setText(li.querySelector('b'), tempText(x.c));
        setText(li.querySelector('.wx-hour-rain'), x.pp !== null && x.pp >= 20 ? Math.round(x.pp) + '%' : '');
        setSky(li.querySelector('.sky-ico'), skyFor(wxKind(words), x.day));
        li.setAttribute('title', words);
        if (i === 0) {
          setText(wxBox.querySelector('.wx-cond-text'), words);
          setSky(cond.querySelector('.sky-ico'), skyFor(wxKind(words), x.day));
          cond.hidden = !words;
        }
      });
    }

    function renderWx() {
      if (!wxBox) return;
      var t = localParts(new Date());
      renderHours(t);
      var later = t.hour >= 20;
      var day = dayInfo(t.year, t.month, t.day + (later ? 1 : 0));
      var iso = day.y + '-' + pad(day.m) + '-' + pad(day.d);
      var f = null;
      if (forecast && forecast.days) {
        for (var i = 0; i < forecast.days.length; i++) if (forecast.days[i].date === iso) f = forecast.days[i];
      }
      setText(wxBox.querySelector('.wx-day'), later ? 'Tomorrow' : 'Today');

      var noon = nyMoment(day.y, day.m, day.d, 12);
      var sun = sunTimesUTC(new Date(noon), 43.1566, -77.6088);
      setText(wxBox.querySelector('.wx-rise'), f && f.rise ? f.rise.slice(11, 16) : clockFromUTC(sun.rise, noon));
      setText(wxBox.querySelector('.wx-set'), f && f.set ? f.set.slice(11, 16) : clockFromUTC(sun.set, noon));

      var live = !!(f && f.max !== null && f.min !== null);
      wxBox.classList.toggle('is-live', live);
      Array.prototype.forEach.call(wxBox.querySelectorAll('.wx-live'), function (el) { el.hidden = !live; });
      wxBox.querySelector('.wx-credit').hidden = !live;
      if (!live) return;

      setText(wxBox.querySelector('.wx-high'), tempText(f.max));
      setText(wxBox.querySelector('.wx-low'), tempText(f.min));
      var snowy = f.snow > 0 || SNOW_CODES.indexOf(f.code) >= 0;
      setText(wxBox.querySelector('.wx-precip-kind'), snowy ? 'Snow' : 'Rain');
      setText(wxBox.querySelector('.wx-precip'), f.pp !== null ? Math.round(f.pp) + '%' : '–');
    }

    // The next US federal holiday (or its observed day)
    var holidayDay = '';

    function renderHoliday(t) {
      var box = wxBox && wxBox.querySelector('.wx-off');
      var key = t.year + '-' + t.month + '-' + t.day;
      if (!box || key === holidayDay) return;
      holidayDay = key;
      for (var i = 0; i <= 400; i++) {
        var info = dayInfo(t.year, t.month, t.day + i);
        if (!info.holiday) continue;
        var name = info.holiday.replace(' (observed)', '');
        var when = DAYS[info.dow].slice(0, 3) + ' ' + info.d + ' ' + MONTHS[info.m - 1] + (name !== info.holiday ? ' (observed)' : '');
        var after = dayInfo(t.year, t.month, t.day + i + 1);
        if (after.holiday === name + ' (observed)') when += ', observed ' + DAYS[after.dow].slice(0, 3) + ' ' + after.d + ' ' + MONTHS[after.m - 1];
        setText(box.querySelector('.next-off-label'), i === 0 ? 'Federal holiday today' : 'Next federal holiday');
        setText(box.querySelector('.next-off-count'), i === 0 ? '' : i === 1 ? 'Tomorrow' : 'In ' + i + ' days');
        setText(box.querySelector('.next-off-title'), name);
        setText(box.querySelector('.next-off-date'), when);
        box.hidden = false;
        return;
      }
      box.hidden = true;
    }

    function render() {
      var now = new Date();
      if (window.ZR_COVER) window.ZR_COVER.update(now);
      renderWx();
      var t = localParts(now);
      renderHoliday(t);

      var hour = t.hour + t.minute / 60;
      var today = dayInfo(t.year, t.month, t.day);
      var holiday = today.holiday;
      var off = today.off;
      var workday = today.work;
      var activity;
      if (t.hour >= 23 || t.hour < 6) activity = 'sleep';
      else if (workday && hour >= START && hour < END) activity = 'work';
      else if (hour < (workday ? START : 11)) activity = 'morning';
      else if (hour >= END) activity = 'evening';
      else activity = 'dayoff';

      var dayOffName = holiday || (off ? off.label : '');

      var key = [t.weekday, dayOffName, activity].join('|');
      if (key === lastKey) return;
      lastKey = key;

      var badgeLabel = { sleep: 'Asleep', work: 'At work', morning: 'Morning', evening: 'Evening', dayoff: 'Day off' }[activity];
      if (badge) {
        badge.setAttribute('data-activity', activity);
        badge.setAttribute('title', badgeLabel);
        badge.querySelector('use').setAttribute('href', '#act-' + activity);
        setText(badge.querySelector('.photo-badge-label'), badgeLabel);
      }
    }

    render();
    renderShift();
    setInterval(render, 60000);
    setInterval(renderShift, 15000);
    LIVE_WX.on(function (state) { forecast = state; renderWx(); });
  })();

  // Upcoming events: the "Next up" marker, a live countdown and each city's local time
  (function () {
    var trips = Array.prototype.slice.call(document.querySelectorAll('.trip[data-start]'));
    if (!trips.length) return;
    var fmt = {};
    var dayFmt = {};

    function zoneParts(tz, date) {
      if (!fmt[tz]) fmt[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      var p = {};
      fmt[tz].formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
      return p;
    }

    function zoneOffset(tz, date) {
      var p = zoneParts(tz, date);
      return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(date.getTime() / 60000) * 60000) / 60000);
    }

    // The moment a clock in that city shows midnight on a given date
    function zoneMidnight(tz, iso) {
      var d = iso.split('-');
      var guess = Date.UTC(+d[0], +d[1] - 1, +d[2]);
      var first = guess - zoneOffset(tz, new Date(guess)) * 60000;
      return guess - zoneOffset(tz, new Date(first)) * 60000;
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function gapText(mins) {
      if (!mins) return 'same time as Rochester';
      var h = Math.floor(Math.abs(mins) / 60);
      var m = Math.abs(mins) % 60;
      return (h ? h + 'h' : '') + (m ? (h ? ' ' : '') + m + 'm' : '') + (mins > 0 ? ' ahead of' : ' behind') + ' Rochester';
    }

    function setText(el, text) {
      if (el && el.textContent !== text) el.textContent = text;
    }

    function tick() {
      var now = new Date();
      var nextFound = false;
      trips.forEach(function (trip) {
        var tz = trip.getAttribute('data-tz');
        var start = zoneMidnight(tz, trip.getAttribute('data-start'));
        var end = zoneMidnight(tz, trip.getAttribute('data-end')) + 86400000;
        var ms = start - now.getTime();
        var label;
        if (now.getTime() >= end) label = 'Wrapped up';
        else if (ms <= 0) label = 'Happening now';
        else {
          var days = Math.ceil(ms / 86400000);
          label = days === 1 ? 'Starts tomorrow' : days <= 60 ? 'In ' + days + ' days' : 'In ' + Math.round(days / 30.44) + ' months';
        }
        setText(trip.querySelector('.trip-count'), label);

        var isNext = !nextFound && now.getTime() < end;
        if (isNext) nextFound = true;
        trip.classList.toggle('trip-next', isNext);
        var top = trip.querySelector('.trip-top');
        var tag = trip.querySelector('.trip-tag');
        if (isNext && !tag) {
          tag = document.createElement('span');
          tag.className = 'tag role trip-tag';
          tag.textContent = 'Next up';
          top.insertBefore(tag, top.firstChild);
        }
        if (!isNext && tag) tag.parentNode.removeChild(tag);

        // live countdown to the first day, in the event city's time, for the next event only
        var cd = '';
        if (isNext && ms > 0) {
          var s = Math.floor(ms / 1000);
          var dd = Math.floor(s / 86400);
          s -= dd * 86400;
          var hh = Math.floor(s / 3600);
          s -= hh * 3600;
          var mm = Math.floor(s / 60);
          cd = (dd ? dd + 'd ' : '') + pad(hh) + ':' + pad(mm) + ':' + pad(s - mm * 60) + ' to go';
        }
        setText(trip.querySelector('.trip-countdown'), cd);

        // the event city's weekday and 24-hour time, like "Tue 03:30"
        if (!dayFmt[tz]) dayFmt[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' });
        var p = zoneParts(tz, now);
        setText(trip.querySelector('.trip-local'), dayFmt[tz].format(now) + ' ' + pad(+p.hour % 24) + ':' + pad(+p.minute));
        setText(trip.querySelector('.trip-gap'), gapText(zoneOffset(tz, now) - zoneOffset('America/New_York', now)));
      });
    }

    tick();
    setInterval(tick, 1000);
  })();

  // Studios, last row: the core teams' time and weather in Dhaka, and their next government holiday on a
  // working day (window.ZR_BD_HOLIDAYS in schedule.js), with that holiday's photo
  (function () {
    var box = document.getElementById('team-panel');
    if (!box) return;
    var DAY = 86400000;
    var WEEKEND = [5, 6]; // Friday and Saturday
    var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var HOLIDAYS = (window.ZR_BD_HOLIDAYS || [])
      .filter(function (h) { return h && h.label && /^\d{4}-\d{2}-\d{2}$/.test(h.start || ''); })
      .sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
    var PHOTOS = {
      durga: { src: 'img/bd-durga-720.webp', alt: 'Durga Puja idols at the Ramakrishna Mission in Dhaka', place: 'Durga Puja, Dhaka', author: 'Pratyya Ghosh', file: 'https://commons.wikimedia.org/wiki/File:Durga_Puja_2013_at_Ramakrishna_Mission_in_Dhaka_001.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
      victory: { src: 'img/bd-victory-720.webp', alt: "The National Martyrs' Memorial in Savar, with the flag of Bangladesh", place: "National Martyrs' Memorial, Savar", author: 'Mfsam12', file: 'https://commons.wikimedia.org/wiki/File:Jatiyo_Smriti_Soudho,_Savar_(1).jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
      dhaka: { src: 'img/bd-dhaka-720.webp', alt: 'Hatirjheel lake in Dhaka on a clear evening', place: 'Hatirjheel, Dhaka', author: 'Tawkir.ahmad', file: 'https://commons.wikimedia.org/wiki/File:View_of_Hatirjheel_near_Moghbazar.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }
    };
    var fmts = {};
    var wx = null;
    var lastDay = '';

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function setText(el, text) { if (el && el.textContent !== text) el.textContent = text; }

    function zone(tz, now) {
      if (!fmts[tz]) fmts[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      var p = {};
      fmts[tz].formatToParts(now).forEach(function (x) { p[x.type] = x.value; });
      var h = +p.hour % 24;
      var date = Date.UTC(+p.year, +p.month - 1, +p.day);
      return {
        date: date,
        clock: pad(h) + ':' + p.minute,
        offset: Math.round((date + (h * 60 + +p.minute) * 60000 - Math.floor(now.getTime() / 60000) * 60000) / 60000)
      };
    }

    function iso(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
    function fromIso(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
    function weekend(ms) { return WEEKEND.indexOf(new Date(ms).getUTCDay()) >= 0; }
    function dateText(ms) { var d = new Date(ms); return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; }

    function holidayOn(ms) {
      var s = iso(ms);
      for (var i = 0; i < HOLIDAYS.length; i++) if (s >= HOLIDAYS[i].start && s <= (HOLIDAYS[i].end || HOLIDAYS[i].start)) return true;
      return false;
    }

    // The next listed holiday with at least one working day in it, stretched over the weekend
    // and any holidays next to it
    function nextBreak(today) {
      for (var i = 0; i < HOLIDAYS.length; i++) {
        var h = HOLIDAYS[i];
        var a = fromIso(h.start), b = fromIso(h.end || h.start), work = [];
        for (var t = a; t <= b; t += DAY) if (!weekend(t)) work.push(t);
        if (!work.length) continue;
        var from = a, to = b;
        while (weekend(from - DAY) || holidayOn(from - DAY)) from -= DAY;
        while (weekend(to + DAY) || holidayOn(to + DAY)) to += DAY;
        if (to < today) continue;
        return { h: h, first: work[0], last: work[work.length - 1], from: from, to: to, days: Math.round((to - from) / DAY) + 1 };
      }
      return null;
    }

    function setPhoto(key) {
      var ph = PHOTOS[key] || PHOTOS.dhaka;
      var img = box.querySelector('.team-photo-img');
      if (img.getAttribute('src') !== ph.src) { img.setAttribute('src', ph.src); img.setAttribute('alt', ph.alt); }
      setText(box.querySelector('.team-place'), ph.place);
      var author = box.querySelector('.team-author'), license = box.querySelector('.team-license');
      setText(author, ph.author); author.setAttribute('href', ph.file);
      setText(license, ph.license); license.setAttribute('href', ph.licenseUrl);
    }

    function renderHoliday(today) {
      var off = box.querySelector('.team-off');
      var n = nextBreak(today);
      setPhoto(n ? n.h.photo : 'dhaka');
      off.hidden = !n;
      if (!n) return;
      var now = today >= n.from;
      var inDays = Math.round((n.first - today) / DAY);
      var range = n.first === n.last ? dateText(n.first)
        : new Date(n.first).getUTCMonth() === new Date(n.last).getUTCMonth()
          ? dateText(n.first).replace(/ \w+$/, '') + ' – ' + dateText(n.last)
          : dateText(n.first) + ' – ' + dateText(n.last);
      setText(off.querySelector('.next-off-label'), now ? 'Government holiday now' : 'Next government holiday');
      setText(off.querySelector('.next-off-count'), now ? '' : inDays === 1 ? 'Tomorrow' : 'In ' + inDays + ' days');
      setText(off.querySelector('.next-off-title'), n.h.label);
      setText(off.querySelector('.next-off-date'), now ? 'back ' + dateText(n.to + DAY)
        : range + (n.days >= 3 && n.days > n.last / DAY - n.first / DAY + 1 ? ' · ' + n.days + ' days off' : ''));
    }

    function renderWx() {
      var el = box.querySelector('.team-wx');
      var w = wx && wx.cities && Date.now() - wx.updated < 3 * 3600000 ? wx.cities['Asia/Dhaka'] : null;
      el.hidden = !w;
      if (!w) return;
      setText(box.querySelector('.team-wx-text'), tempText(w.c) + (w.text ? ' · ' + w.text : ''));
      setSky(el.querySelector('.sky-ico'), skyFor(wxKind(w.text), w.day !== false));
    }

    function tick() {
      var now = new Date();
      var dhaka = zone('Asia/Dhaka', now);
      var home = zone('America/New_York', now);
      var gap = dhaka.offset - home.offset;
      var h = Math.floor(Math.abs(gap) / 60), m = Math.abs(gap) % 60;
      setText(box.querySelector('.team-now'), dhaka.clock);
      setText(box.querySelector('.team-day'), DAYS[new Date(dhaka.date).getUTCDay()]);
      setText(box.querySelector('.team-gap'), gap ? (gap > 0 ? '+' : '−') + (h ? h + 'h' : '') + (m ? (h ? ' ' : '') + m + 'm' : '') + ' from Rochester' : '');
      var key = iso(dhaka.date);
      if (key !== lastDay) { lastDay = key; renderHoliday(dhaka.date); }
    }

    tick();
    setInterval(tick, 30000);
    LIVE_WX.on(function (state) { wx = state; renderWx(); });
  })();

  // Listening: Audible totals, the book in progress and the latest finished books, from listening.js
  // (written weekly on Zamilur's Mac by tools/listening in the repo). Hidden until it has data.
  (function () {
    var section = document.getElementById('listening');
    var data = window.ZR_LISTENING;
    if (!section || !data || typeof data !== 'object') return;
    var stats = data.stats || {};
    var current = Array.isArray(data.current) ? data.current : [];
    var finished = Array.isArray(data.finished) ? data.finished : [];
    if (!current.length && !finished.length && typeof stats.hoursTotal !== 'number' && typeof stats.titlesFinished !== 'number') return;
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }
    function https(u) { return typeof u === 'string' && /^https:\/\//.test(u) ? u : null; }
    function emptyCover() {
      var c = el('span', 'listen-cover is-empty');
      c.setAttribute('aria-hidden', 'true');
      c.innerHTML = '<svg class="ico" focusable="false"><use href="#audiobook-ico"/></svg>';
      return c;
    }
    function cover(book) {
      var src = https(book.cover);
      if (!src) return emptyCover();
      var img = el('img', 'listen-cover');
      img.alt = '';
      img.width = 160;
      img.height = 160;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', function () { img.replaceWith(emptyCover()); });
      img.src = src;
      return img;
    }
    function link(book, cls) {
      var href = https(book.url);
      var a = el(href ? 'a' : 'div', cls);
      if (href) {
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.title = book.title + (book.author ? ' by ' + book.author : '');
      return a;
    }
    function hoursText(min) {
      var h = Math.floor(min / 60), m = min % 60;
      return (h ? h + ' h' : '') + (h && m ? ' ' : '') + (m || !h ? m + ' min' : '');
    }
    function dateText(iso, withDay) {
      var p = String(iso || '').split('-');
      if (p.length < 2 || !MONTHS[+p[1] - 1]) return '';
      return (withDay && p[2] ? +p[2] + ' ' : '') + MONTHS[+p[1] - 1] + ' ' + p[0];
    }

    // Totals
    Array.prototype.forEach.call(section.querySelectorAll('.listen-stat'), function (box) {
      var key = box.getAttribute('data-stat');
      var value = stats[key];
      if (typeof value !== 'number') return;
      box.querySelector('dd').textContent = value.toLocaleString('en-US');
      if (key === 'hoursThisYear' && stats.year) box.querySelector('dt').textContent = 'Hours in ' + stats.year;
      box.hidden = false;
    });
    var shown = section.querySelectorAll('.listen-stat:not([hidden])').length;
    section.querySelector('.listen-stats').hidden = !shown;
    section.querySelector('.listen-stats').style.setProperty('--n', shown || 1);
    if (data.updated) section.querySelector('.listen-updated').textContent = ', last on ' + dateText(data.updated, true).replace(/ \d{4}$/, '');

    // Now listening
    var nowBox = section.querySelector('.listen-now');
    current.forEach(function (book) {
      if (!book || !book.title) return;
      var a = link(book, 'listen-book-now');
      a.appendChild(cover(book));
      var text = el('span', 'listen-now-text');
      text.appendChild(el('span', 'listen-title', book.title));
      if (book.author) text.appendChild(el('span', 'listen-author', book.author));
      var pct = Math.max(0, Math.min(100, Math.round(+book.percent || 0)));
      var bar = el('span', 'listen-bar');
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-valuenow', String(pct));
      bar.setAttribute('aria-label', pct + '% listened');
      var fill = el('i');
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      text.appendChild(bar);
      var left = typeof book.minutesLeft === 'number' && book.minutesLeft > 0 ? ' · ' + hoursText(book.minutesLeft) + ' left' : '';
      text.appendChild(el('span', 'listen-progress', pct + '%' + left));
      a.appendChild(text);
      nowBox.querySelector('.listen-now-list').appendChild(a);
    });
    nowBox.hidden = !nowBox.querySelector('.listen-book-now');

    // Recently finished
    var doneBox = section.querySelector('.listen-done');
    finished.forEach(function (book) {
      if (!book || !book.title) return;
      var li = el('li');
      var a = link(book, 'listen-book');
      a.appendChild(cover(book));
      a.appendChild(el('span', 'listen-title', book.title));
      var when = dateText(book.finished, false);
      if (when) a.appendChild(el('span', 'listen-when', when));
      li.appendChild(a);
      doneBox.querySelector('.listen-books').appendChild(li);
    });
    doneBox.hidden = !doneBox.querySelector('li');

    section.querySelector('.listen-grid').classList.toggle('is-single', nowBox.hidden || doneBox.hidden);
    section.querySelector('.listen-grid').hidden = nowBox.hidden && doneBox.hidden;
    section.hidden = false;
  })();

  // "Play my prototypes": the chip reads Soon until play/list.js lists a game, then shows how many
  (function () {
    var chip = document.getElementById('proto-count');
    var list = window.ZR_PROTOTYPES;
    if (!chip || !Array.isArray(list) || !list.length) return;
    chip.textContent = String(list.length);
    chip.classList.add('is-count');
    var btn = document.getElementById('proto-btn');
    if (btn) btn.setAttribute('aria-label', 'Play my prototypes, ' + list.length + (list.length === 1 ? ' game' : ' games'));
  })();
})();
