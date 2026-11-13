# HVAC Medic website

Static one-page site for HVAC Medic LLC (Pillager, MN). Built from the concept the client approved. No build step: `index.html`, `styles.css`, `app.js`, `favicon.svg`, `og-image.png` and `photos/`. Host it anywhere that serves files (Netlify, Cloudflare Pages, GitHub Pages, cPanel hosting).

## Before launch
1. **Lead form:** create a free Formspree form and paste its URL into `FORM_ENDPOINT` at the top of `app.js`. Until then the form opens a pre-filled text to (218) 820-6351.
2. **Reviews:** add real reviews (word for word, with the customer's OK) to the `REVIEWS` list in `app.js`. Until there are some, the section asks customers to leave one on Facebook.
3. **Domain:** point the client's domain at the host, then add `<link rel="canonical">` and a full `og:image` URL in `<head>`.
4. **Legal:** the Privacy Policy, Terms & Disclaimers and Accessibility text are in `index.html` (footer dialogs). Have Brent confirm them and fill in anything flagged in the legal review.

## Job slideshow
The "Our work" section is a photo slideshow of six job photos from the HVAC Medic Facebook page. It plays as a 15-second loop (6 photos x 2.5 s) with a frosted-glass sweep between photos. Customers can swipe or drag, use the arrow buttons or keyboard arrows, tap a thumbnail, or press pause. It pauses on hover, when it scrolls off screen, and it does not autoplay for visitors who turn on reduced motion.

- **Labels and job details** for each photo are in `index.html` (each `<figure class="sl">` and its matching `.th` thumbnail).
- **Timing:** change `DUR` (milliseconds per photo) in the `JOB SLIDESHOW` block of `app.js`.
- **Add a photo:** drop it in `photos/`, copy one `<figure class="sl">` and one `<button class="th">`, and give the new thumbnail the next `data-go` number.
