# HVAC Medic website

A static, single-page lead-generation site for HVAC Medic (Orland, Maine). No build step, no framework: just `index.html`, `styles.css`, `app.js` and a few images. It can be hosted anywhere that serves files (GitHub Pages, Netlify, Cloudflare Pages, any shared host).

Preview from this repo: `https://gulffreedomsolutions.com/clients/hvac-medic/`

## Before launch

1. **Lead form email.** Create a free form at Formspree (or Basin/Getform), copy its URL and paste it into `FORM_ENDPOINT` at the top of `app.js`. Until then the form still works: when a visitor finishes, they get a one-tap "Text this to Dave" button with their whole request already typed out.
2. **Photos.** Drop a real photo of Dave and his son at `photos/team.jpg` and uncomment the `<img>` in the About section of `index.html`.
3. **Check the facts** (phone, hours, towns, reviews, payment methods) against what the client wants shown. These were taken from hvacmedicme.com in November 2026.
4. **Domain.** Point the client's domain at the host. If it moves to its own domain, update the `canonical` and `og:image` URLs in `<head>`.

## What's on the page

- Animated hero scene (snowy Maine night, heat pump fan running, live "vitals" monitor) with quick symptom chips that jump straight into the form.
- **The 60-second house call**: a 5-step triage form (symptom, system, urgency thermometer, location, contact) that fills a "patient chart" as you go and ends with a case ticket and priority.
- Heat pump savings estimator (rough ranges by fuel type, clearly labelled as an estimate).
- Services, the Medic method, about, Google reviews, service area, FAQ, and a sticky Call / Text / Book bar on phones.
- `HVACBusiness` schema markup for local search. Motion is turned off for visitors who ask for reduced motion.
