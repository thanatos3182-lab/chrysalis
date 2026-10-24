# Chrysalis

A recovery companion that runs in any browser, including iPhone. It is the web version of the Android app
[recovery-app](https://github.com/thanatos3182-lab/recovery-app), built as its own project.

Everything you write stays on your device (localStorage). There is no server and no account.

## Use it on iPhone

1. Open the site in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open it from the home screen. It works offline.

Use **Backup and restore** now and then. Safari can clear site data for sites you haven't opened in a while,
and a backup file is the safety net.

## What's in it

| Screen | Status |
| --- | --- |
| Day count, start date, journal | done |
| Craving SOS (rate, feeling, skill steps, 10-minute wait, re-rate) | done |
| My Plan (shown in Craving SOS when an urge is 7 or higher) | done |
| Support contacts (call and text) | done |
| Coping skills (12) | done |
| Neuroscience class (19 lessons, research links) | done |
| Backup and restore | done |
| Daily check-in, pattern insights, daily structure | to port |
| Milestones and savings, counselor summary | to port |
| Meetings, sponsor finder, appointments | to port |
| Local jobs, job tracker, housing, housing tracker | to port |
| Daily letter | to port |

Not planned for the web version: push-style reminders. iOS web apps can't schedule local notifications.

## Run it locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project layout

```
index.html            page shell
manifest.webmanifest  install info (name, icons)
sw.js                 offline cache (bump CACHE when files change)
css/app.css           styles
data/content.js       lessons, coping skills, coach script (generated from the Android source)
js/core.js            storage, DOM helpers, modal, shared journal
js/*.js               one file per screen
icons/                butterfly logo
```

## Design notes

- The butterfly drifts slowly. No flashing, pulsing, or glow, because some people who use this may have photosensitive epilepsy.
- Crisis wording in Craving SOS is fixed text. It never depends on a model.

## Not medical care

This is education and self-help. If you are in crisis, call or text 988 (US).
