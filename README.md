# Trophy Trail

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sugiartho/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sugiartho/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Trophy Trail is an offline web app for hunting the platinum in Grand Theft Auto VI on PlayStation 5. It covers all 55 official trophies — 1 platinum, 2 gold, 6 silver, 46 bronze — with a checklist that saves your progress, a roadmap to the platinum, the missable trophies flagged, and a guide to each trophy written in our own words with its sources named. Everything runs from its own files: no network, no ads, no Rockstar artwork.

## Features

- **Spoiler-aware.** "Hide story spoilers" is on by default, so the guides for the 28 story-spoiler trophies stay masked until you switch it off or tick the trophy earned.
- **Progress tracker.** Tick trophies off as you earn them; your progress is saved in your browser (localStorage) and survives reloads, and you can export it as JSON and import it back on another machine.
- **Find your next trophy.** Search by name and filter by kind (story, missable, collectibles, activities), grade, and earned status.
- **Roadmap and missables.** A step-by-step route to the platinum, plus a dedicated view of the trophies you can miss.

## Run it

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 in a desktop browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=c31gnmy5&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
