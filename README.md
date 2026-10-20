# nynex.dev

Personal site for Callum Davenport — resume, events and side projects.
A single static page (`index.html`, no build step) styled after 90s hacker-movie desktops.

## Editing content
Everything editable lives in the `<script>` block near the bottom of `index.html`:
`TAGLINES`, `TICKER`, `EVENTS`, `PROJECTS` and `JOBS`.

## Deploying
Hosted on GitHub Pages from the `main` branch, root folder (Settings → Pages → Deploy from a branch → `main` / `/ (root)`).
Pushing to `main` redeploys the site. There is no build step.

- `CNAME` — custom domain (`nynex.dev`). Don't delete it or the domain setting resets.
- `.nojekyll` — tells Pages to serve the files as-is instead of running Jekyll.
- `404.html` — shown for unknown URLs.

DNS for the apex domain: four `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
(optionally `www` as a `CNAME` to `kingof9x.github.io`). Check GitHub's docs for current values.

## To add
- `resume.pdf` (the Download PDF button links to it)
