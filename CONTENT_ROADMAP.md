# V15 content roadmap

V15 is the active version as of 2026-09-05. This is a backlog for future owner-approved work, not an instruction to implement every suggestion. Read [README.md](README.md) and [PROJECT_NOTES.md](PROJECT_NOTES.md) before editing.

## Completed baseline — do not redo

- Eight complete pages in Hungarian and English, the established bronze/copper/gold/black palette and consistent approved pricing. Every header has HU/EN flags, including both legal drafts.
- Galéria consolidated into Rólam, including `shirtless.png`, the three life photos and three intentional photo placeholders. No separate Life page.
- Sikerek restored to primary navigation on every page and linked from the homepage.
- Responsive section navigation across all pages, with native anchors, active markers and conditional contact sections.
- Four online packages and package-specific contact handoffs; three live Calendly event URLs and the new client email.
- Calendly embed with prefilled details, loading recovery and direct-link fallback. Original black/cream/gold theme restored after the owner rejected the whole-widget bronze/beige workaround. The reported pale-text-on-light-input contrast issue remains unresolved; Calendly has no documented separate input-text setting. Preserve the original theme while investigating any future supported field-specific fix.
- Latest fixes: enlarged gallery images preserve proportions, pricing heading/introduction spacing is corrected, contact portrait is compact, and contact email links open Gmail drafts with a separate copy-address option.
- V15 detail pass: removed the requested email helper sentence, kept forint amounts together across line breaks, added heading-anchor clearance and image dimensions, increased form-input text to 1rem, and removed the calendar's duplicate scroll after loading.
- V15 Calendly prefill fix: initial inline/fallback booking URLs carry submitted name, split names, email and preparation notes, with encoding compatible with the widget. Tested against the actual public SDK; final invitee-field browser verification remains distinct from the automated check.
- Automated structural, navigation, contact-flow and clipboard checks pass. Browser layout verification and complete live booking verification remain separate tasks.
- Device/performance pass complete in code: responsive WebP images (93.5% smaller largest-copy total), refined mobile/landscape spacing and touch targets, safe-area support and controlled Calendly height updates. See [PUBLISHING_CHECKLIST.md](PUBLISHING_CHECKLIST.md) for remaining browser/device and launch verification. Domain already owned; DNS connection is deferred at the owner's request.

## Resolve before launch

1. Confirmed location: Victory Fitness Békásmegyer, 1039 Budapest, Hatvany Lajos utca 10. The public site has been updated.
2. Later: add genuine, consented client results and finished photography. Fabricated testimonials, case studies and avatars are absent. Three intentional photo placeholders remain in Rólam at the owner's request.
3. Current owner-approved prices: 11,000 Ft per personal-training session, 100,000 Ft for ten sessions, Training Program 19,900 Ft once / 4 weeks, online Basic 29,900 Ft/month, Plus 39,900 Ft/month, Premium 49,900 Ft/month. Keep every public price reference consistent with these packages.
4. Add an adatkezelési tájékoztató covering the contact form, Calendly, email handling, retention, and user rights. Obtain professional legal review before publishing it.
5. Later: add real certificate images or verifiable credential details for the IWI qualifications.

## Recommended page structure

Keep the main navigation compact. The detailed personal-training page is intentionally present in the header; add further service-detail pages only when they are complete enough to justify another navigation item.

### Existing pages and optional additions

- `szemelyi-edzes.html`: created as the combined personal-training and rehabilitation-approach page. Refine its wording with final owner-approved content.
- `online-coaching.html`: completed with four owner-approved packages. Basic includes one coaching call/week, Plus two, and Premium two plus unlimited messaging, video/form checks and ongoing adjustments. Training Program is a standalone 4-week product. Package buttons preserve the chosen tier in the contact form; standalone-program inquiries use email.
- `elso-alkalom.html`: completed. Includes the first-conversation journey, preparation, confirmed address and map link. Add confirmed practical arrival details here when available.
- `location.html`: optional future page only if enough verified location detail warrants it. Address and map already exist on the first-visit page; do not create a duplicate just to satisfy an old plan.
- `privacy.html`: clear Hungarian privacy information for every personal-data flow.

### Improve existing pages

- Homepage: updated with a clear audience and location, personal voice, training background and IWI qualifications near the first CTA; visitor situations replace placeholder testimonials.
- Services: updated with consistent current prices and links to both complete service pages. Confirm session length, package validity, cancellation terms and gym-entry costs before adding them as fixed promises.
- Results: currently explains how individual progress is followed, alongside Bence's personal story. Add real case studies with starting point, goal, process, duration, outcome, and client approval when available.
- About: show certificate images and explain what the MES qualification changes in practice without implying medical treatment.
- About gallery: the former Life gallery now lives at `about.html#galeria`, with the three original personal photos and their captions. The portrait frame now uses the owner-approved `shirtless.png`; training, movement and coaching-session frames remain ready for the photo session. The separate Life page has been removed.

### Not currently intended

No blog or general knowledge section is planned. Keep the site focused on services, credibility, results, and booking.

## Conversion and trust improvements

- A “What happens after booking?” section already exists on Contact; review clarity before adding repeated blocks elsewhere.
- Add specific availability only when the owner provides current, maintainable information.
- Use real photos of the coach, training environment, and sessions.
- Add Google reviews only when they are genuine and linkable.
- Give every service page one primary CTA instead of several competing actions.
- Make the location, phone number, email address, and business name consistent everywhere, including Calendly and Google Business Profile.

## Search and technical foundations

- Final stage: create and verify a Google Business Profile with complete address, category, hours, photos, and reviews.
- Final stage: add accurate `LocalBusiness` structured data.
- Final stage: add `sitemap.xml`, `robots.txt`, a useful `404.html`, and connect Google Search Console after publication.
- Responsive WebP conversion is complete. Measure the actual published pages with PageSpeed Insights after hosting is configured.
- Write content for real client questions and first-hand expertise, not to fill a keyword quota.

## Suggested implementation order

1. Follow the owner's next V15 request; the homepage rewrite and service-detail pages are already complete.
2. When browser testing is requested, check gallery proportions and long captions, pricing spacing, contact portrait, email/copy actions and section navigation on desktop and mobile.
3. Obtain remaining facts: package validity, cancellation terms, gym-entry costs, current availability and privacy/data-handling details. Preserve existing verified address, prices and credentials.
4. Replace the three intentional photo placeholders when suitable photographs are supplied, and add genuine results/certificates when available.
5. Finish privacy content, live booking/email verification and search foundations before an authorized publication.
6. Publish only when requested and launch decisions are resolved. No blog or general knowledge section is planned.
