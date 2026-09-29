// Zamilur's working schedule, in Rochester (Eastern) time.
// Add an entry to timeOff whenever Zamilur mentions a holiday or a break.
// Dates are Rochester dates, inclusive, written YYYY-MM-DD. Set holiday: true
// for a holiday (the avatar's sky gets bunting); leave it out for a break.
//   { start: '2026-12-24', end: '2027-01-01', label: 'Winter break' }
//   { start: '2026-10-20', label: 'Durga Puja', holiday: true }
window.ZR_SCHEDULE = {
  workDays: [1, 2, 3, 4, 5, 6], // 0 = Sunday ... 6 = Saturday; Sunday is closed
  start: 7,                     // 07:00 (24-hour clock)
  end: 19,                      // 19:00
  timeOff: []
};

// Bangladesh government holidays, for the core teams' panel in Studios. Dates are Dhaka dates,
// inclusive. The panel skips any holiday that falls wholly on the Friday–Saturday weekend and
// shows the next one on a working day, with its photo ('durga' or 'victory'; anything else shows
// Dhaka). Add the next year's list when the Cabinet Division publishes it, usually late in the year.
window.ZR_BD_HOLIDAYS = [
  { start: '2026-10-20', end: '2026-10-22', label: 'Durga Puja', photo: 'durga' },
  { start: '2026-12-16', label: 'Victory Day', photo: 'victory' },
  { start: '2026-12-25', label: 'Christmas Day' }
];
