# Gulf Freedom Solutions

Website for Gulf Freedom Solutions LLC, a locally owned web design and social media marketing company serving Panama City, Lynn Haven, Callaway and Panama City Beach, Florida. Live at https://gulffreedomsolutions.com (GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main`).

- Pages: `index.html` (home), `start.html` (questionnaire), `team/` (bios), `privacy.html`, `terms.html`, `accessibility.html`.
- Questionnaire form: sends through Formspree (form `xoedqnne`). Calls/texts require the visitor's consent checkbox.
- Cookie consent: `assets/consent.js` shows the banner and loads HubSpot tracking only after a visitor clicks Accept. Do not paste the HubSpot tracking snippet into pages directly.
- Client sites live in `clients/` (for example `clients/hvac-medic/`), each self-contained and deployable on its own.
- Photos: stock photos from Unsplash (Unsplash License); founder photos are owned by the founders.

## Security notes
- **This repository is public.** Never commit passwords, API keys, client data or private documents.
- Each page sets a basic Content-Security-Policy and referrer policy in `<head>`. GitHub Pages cannot send custom security headers; put Cloudflare in front if stronger headers are needed.
- Security contact: `.well-known/security.txt`.

© Gulf Freedom Solutions LLC. All rights reserved. See `LICENSE`.
