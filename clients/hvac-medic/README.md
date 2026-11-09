# HVAC Medic website

A static, single-page lead-generation site for HVAC Medic LLC (Pillager, Minnesota, Brainerd Lakes Area). No build step, no framework: just `index.html`, `styles.css`, `app.js` and a few images. It can be hosted anywhere that serves files (GitHub Pages, Netlify, Cloudflare Pages, any shared host).

Preview from this repo: `https://gulffreedomsolutions.com/clients/hvac-medic/`

## Before launch

1. **Lead form email.** Create a free form at Formspree (or Basin/Getform), copy its URL and paste it into `FORM_ENDPOINT` at the top of `app.js`. Until then the form still works: when a visitor finishes, they get a one-tap "Text this to Brent" button with their whole request already typed out.
2. **Photos.** Copy the job photos and logo from the Facebook download into `photos/` (file names are listed in `photos/README.md`).
3. **Check the facts** with Brent: the town list, and whether to add hours, licensing or a years-in-business line. Details came from the HVAC Medic Facebook page in November 2026. It had no reviews yet, so the page uses two real job case studies instead; add Google reviews once there are some.
4. **Domain.** Point the client's domain at the host. If it moves to its own domain, update the `canonical` and `og:image` URLs in `<head>`.

## What's on the page

- Animated hero scene (snowy Minnesota night, outdoor unit running, in-floor heat glowing, live "vitals" monitor) with quick symptom chips that jump straight into the form.
- **The 60-second house call**: a 5-step triage form (symptom, system, urgency thermometer, location, contact) that fills a "patient chart" as you go and ends with a case ticket and priority.
- Upgrade savings estimator (rough ranges by current system, clearly labelled as an estimate).
- Services, two case studies from recent jobs, the Medic method, about, service area, FAQ, and a sticky Call / Text / Book bar on phones.
- `HVACBusiness` schema markup for local search. Motion is turned off for visitors who ask for reduced motion.
