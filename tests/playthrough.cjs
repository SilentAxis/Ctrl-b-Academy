// Plays through every guided lesson with real key sequences. Fails if a lesson
// gets stuck, the page throws an error, or the phone layout scrolls sideways.
//
//   npm install --no-save playwright
//   npx playwright install chromium
//   node tests/playthrough.cjs
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  // Web fonts may be unreachable in CI; everything else must load cleanly.
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForTimeout(300);

  const keys = async (...ks) => { for (const k of ks) await page.evaluate(k => window.__tmuxTrainer.handleKey(k), k); };
  const type = async (s, enter = true) => { for (const ch of s) await keys(ch === ' ' ? 'Space' : ch); if (enter) await keys('Enter'); };
  let window_prefix = 'C-b';
  const pre = async (...ks) => { for (const k of ks) { await keys(window_prefix); await keys(k); } };
  const open = i => page.evaluate(i => window.__tmuxTrainer.openLesson(i), i);

  // One entry per guided lesson, in order.
  const runs = [
    async () => { await type('tmux new -s learn'); await type('echo hello'); await pre('t'); await keys('a'); },
    async () => { await pre('d'); await type('tmux ls'); await type('tmux attach -t learn'); },
    async () => { await type('ping example.com'); await pre('d'); await page.waitForTimeout(1200); await type('tmux a'); await keys('C-c'); },
    async () => { await pre('%', '"'); await type('pwd'); },
    async () => { await pre('Left', 'o'); await pre('q'); await keys('0'); await pre(';'); },
    async () => { await pre('z', 'z', 'C-Left'); await page.waitForTimeout(600); await pre('M-Right'); },
    async () => { await type('exit'); await pre('x'); await keys('y'); },
    async () => { await pre('c', ','); await keys('C-u'); await type('logs'); await type('tail -f app.log'); await pre('0'); },
    async () => { await pre('n', 'p', '2', 'l', 'w'); await keys('Down', 'Enter'); },
    async () => { await pre('&'); await keys('y'); await pre('&'); await keys('y'); await pre('&'); await keys('y'); },
    async () => { await pre(':'); await type('new-session -s work'); await pre('s'); await keys('Up', 'Enter'); await pre(')', '$'); await keys('C-u'); await type('school'); },
    async () => { await pre('d'); await type('tmux ls'); await type('tmux kill-session -t work'); await type('tmux kill-server'); },
    async () => { await type('seq 1 200'); await pre('['); await keys('PageUp', 'PageUp'); await keys('C-r'); await type('150'); await keys('q'); },
    async () => { await type('cat notes.txt'); await pre('['); await keys('Up', 'Up', '0', 'Space', 'Right', 'Right', 'Right', 'Enter'); await pre(']'); },
    async () => { await pre(':'); await type('split-window -h'); await pre(':'); await type('select-layout tiled'); await pre('Space', '?'); await keys('q'); },
    async () => { await pre('}', '!', '0', ':'); await type('join-pane -s :1'); },
    async () => { await pre(':'); await type('setw synchronize-panes on'); await type('echo hi'); await pre(':'); await type('setw synchronize-panes off'); },
    async () => {
      await pre(':'); await type('set -g mouse on');
      const box = await page.evaluate(() => {
        const w = window.__tmuxTrainer.curW();
        const el = [...document.querySelectorAll('#term-panes [data-pid]')].find(e => +e.dataset.pid !== w.active);
        const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      await page.mouse.click(box.x, box.y);
      await pre(':'); await type('set -g prefix C-a'); window_prefix = 'C-a';
      await pre('c', ':'); await type('set -g prefix C-b'); window_prefix = 'C-b';
    },
    // Uses the Config builder defaults: Ctrl+a prefix and the | split binding.
    async () => { await page.evaluate(() => document.querySelector('#conf-use').click()); await pre(':'); await type('source-file ~/.tmux.conf'); window_prefix = 'C-a'; await pre('|'); window_prefix = 'C-b'; },
    async () => { await type('tmux new -d -s dev'); await type('tmux split-window -h -t dev'); await type("tmux send-keys -t dev:0.1 'ping example.com' Enter"); await type('tmux attach -t dev'); },
    async () => {
      await pre('%', '"', ','); await keys('C-u'); await type('code');
      await pre('c', ','); await keys('C-u'); await type('server');
      await pre('c', ','); await keys('C-u'); await type('logs');
      await pre('%', '%', '%', 'M-5', 'z');
      await type('cat notes.txt'); await pre('['); await keys('C-r'); await type('observatory'); await keys('Space');
      for (let i = 0; i < 10; i++) await keys('Right');
      await keys('Enter');
      await pre(':'); await type('new-session -s work'); await pre('s'); await keys('Up', 'Enter'); await pre('$'); await keys('C-u'); await type('play');
    },
  ];

  let failed = false;
  for (let i = 0; i < runs.length; i++) {
    await open(i); await runs[i]();
    const done = await page.evaluate(() => window.__tmuxTrainer.step);
    const total = await page.evaluate(() => document.querySelectorAll('#lesson .steps li').length);
    const title = await page.evaluate(() => document.querySelector('#lesson h1').textContent);
    console.log(`${done === total ? 'ok   ' : 'STUCK'} ${String(i + 1).padStart(2)} ${title} (${done}/${total})`);
    if (done !== total) failed = true;
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) { console.log(`Phone layout scrolls sideways by ${overflow}px.`); failed = true; }
  if (errs.length) { console.log(errs.join('\n')); failed = true; }
  await browser.close();
  console.log(failed ? 'FAILED' : 'All lessons completed.');
  process.exit(failed ? 1 : 0);
})();
