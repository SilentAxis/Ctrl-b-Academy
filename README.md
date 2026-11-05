# Ctrl-b Academy

An interactive trainer for [tmux](https://github.com/tmux/tmux). You practise with real keystrokes in a simulated tmux that runs in your browser, from your first session through copy mode, config files, and scripting.

It's one self-contained HTML file. No install, no server, nothing sent anywhere.

Also in this repository: [**-xe Academy**](journalctl-academy/), the same idea applied to `journalctl` — see [journalctl-academy/README.md](journalctl-academy/README.md).

## Use it

- **Online:** enable GitHub Pages for this repository (Settings → Pages → Deploy from a branch → `main`, `/ (root)`), then open the address GitHub gives you.
- **Offline:** download `index.html` and open it in a browser.

Click the terminal and type. Press <kbd>Ctrl</kbd>+<kbd>b</kbd>, let go, then press the next key, just like real tmux. If your browser keeps <kbd>Ctrl</kbd>+<kbd>b</kbd> for itself, use the on-screen **Prefix** button.

## What's inside

**A simulated tmux.** It has sessions, windows, and panes with real split layouts, the green status bar, the `:` command prompt, copy mode with selection and search, and the yellow message line. The trainer understands 50 tmux commands and the default key bindings, and a panel under the terminal shows which command each key ran. A small practice shell provides `ping`, `tail -f`, `seq`, a build script, and the `tmux` command itself, so detaching, reattaching, and scripting all work.

**22 lessons in 8 modules**, each with steps the trainer checks as you go:

| Module | Lessons |
| --- | --- |
| First steps | Start a session · Detach and come back · Work keeps running |
| Panes | Split · Move between panes · Zoom and resize · Close panes |
| Windows | Create and name · Switch · Close windows and end a session |
| Sessions | Juggle several sessions · Manage sessions from the shell |
| Copy mode | Scroll back and search · Copy and paste |
| Commands & layouts | The command prompt and layouts · Rearrange panes · Type in every pane at once |
| Make it yours | Change options live · Write your .tmux.conf |
| Automate | Script a workspace · Expert challenges · Free play |

**Key drill.** Recall cards for the prefix keys and common commands. Cards you miss come back sooner.

**Reference.** Every default key, copy-mode keys for both vi and emacs styles, command targets, and links to the official documentation.

**Config builder.** Generates a commented `~/.tmux.conf` with a Ctrl+a prefix, mouse support, numbering from 1, `|` and `-` splits in the current directory, vi copy mode, and more. Copy it to your machine, or load it into Free play to try it first.

Progress is saved in your browser's local storage.

## How closely it matches tmux

The trainer follows tmux 3.x defaults: key bindings, `split-window -h` meaning side by side, new panes starting in the session's directory, `kill-pane #P? (y/n)` prompts, `wrap-search`, the 2,000-line history limit, and the server forgetting `set` options when the last session ends. A few things differ on purpose:

- Real tmux shows nothing after you press the prefix. The trainer shows a **PREFIX** badge to help you learn.
- Copy mode accepts both the vi and emacs key sets. Real tmux uses emacs keys unless you set `mode-keys vi` or your `EDITOR` contains vi.
- Pane numbers stay on screen for 1.8 seconds instead of tmux's default 1 second.
- Nested tmux, editors such as vim, and plugins aren't simulated.

## Development

The page is plain HTML, CSS, and JavaScript in `index.html`. The engine (layouts, command parser, targets, bindings, modes) comes first in the script, followed by the lessons, drill, reference, and config builder. Each lesson's steps are checked against events the engine emits.

`tests/playthrough.cjs` plays every lesson with real key sequences in headless Chromium. It fails if a lesson gets stuck, the page logs an error, or the phone layout scrolls sideways. GitHub Actions runs it on every push.

```bash
npm install --no-save playwright
npx playwright install chromium
node tests/playthrough.cjs
```

When you add or change a lesson, update its entry in `runs` in the test so CI keeps checking it.

## Licence

GNU General Public License v3.0. See [LICENSE](LICENSE). tmux itself is a separate project with its own licence.
