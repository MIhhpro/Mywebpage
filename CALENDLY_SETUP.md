# Calendly setup for V15

## English website (2026-09-07)

`contact-en.html` uses the same confirmed event URLs and preserved dark/gold widget configuration. Website instructions, booking notes and fallback messages are English; name prefill uses first name then surname. No Calendly account settings were changed. Calendly controls its own booking-view language and notifications, and custom event names/descriptions/questions need manual translations in that account: [Calendly's event-language instructions](https://calendly.com/help/how-to-change-your-event-type-language). If separate English events are created later, record their confirmed URLs here and add language-specific routing without disturbing existing Hungarian bookings.

V15 started from the V14 integration and now includes the automatic-prefill fix described below. Configure `V15/site-config.js` for this version. The observations below were verified on 2026-09-05; they are not a live account-status check. See [README.md](README.md) for local tests and [PROJECT_NOTES.md](PROJECT_NOTES.md) for approved packages.

## Live client-management account

- Email: `mihaly.bence.fitness@gmail.com` (provided by the owner).
- Free consultation: https://calendly.com/mihaly-bence-fitness/konzultacio
- Personal training: https://calendly.com/mihaly-bence-fitness/30min
- Online coaching: https://calendly.com/mihaly-bence-fitness/online-coaching

The links and inquiry email are configured in `site-config.js`.

## Verified public event settings — 2026-09-05

- Consultation: 20 minutes; Budapest, Hatvany Lajos u. 10, 1039.
- Personal training: 1 hour at the same address. The `30min` URL is only the event slug; the live duration is one hour.
- Online coaching: 1 hour; conferencing details supplied upon confirmation.
- Each event currently asks for full name, email and one optional preparation-notes field.
- The public Calendly interface currently uses English labels. The surrounding website uses Hungarian.

## Prefilled information

`buildCalendlyBookingUrl` puts the submitted full name, first name, last name, email and preparation notes directly into the booking URL. The inline widget and separate-window fallback use this same URL. The documented `prefill` object is also supplied, supporting either a full-name field or separate first/last-name fields in Calendly. Full names retain Hungarian family-name-first order.

The Calendly widget downloaded on 2026-09-05 sends its `prefill` object through deferred messages after iframe load, rather than including it in the initial iframe URL. The previous site depended only on those messages for the inline widget, so it was vulnerable to that handoff failing. The initial booking URL now carries the values independently of message timing.

Encode parameter values with `encodeURIComponent`: this widget's URL parser does not convert form-encoded `+` characters into spaces. Spaces must be `%20`, and real plus signs in email addresses must be `%2B`. Do not replace this with a plain `URLSearchParams.toString()` handoff to the widget.

The single preparation field, `a1` in the URL and `customAnswers.a1` in the object, receives:

1. Selected service and, for online coaching, selected package and price.
2. Optional phone number.
3. The visitor's optional message.

This matches the current live forms. Do not create three questions to match the old integration. If the event questions are changed later, update and verify the mapping in `script.js`.

Training Program and general questions continue through email; they do not need a new scheduling event.

Direct contact email links open an addressed Gmail draft in a new tab, with a separate copy-address button for other mail apps. Prepared form inquiries also offer Gmail and copy-message options. No email is sent by the website itself.

## Embedded experience

- The Calendly script is loaded when the visitor requests appointments, with a 12-second loading limit and retry support.
- The original theme is restored at the owner's explicit request: `background_color=100f0c`, `text_color=f5f0e8`, `primary_color=d4a843`. The owner rejected the bronze/beige whole-widget workaround; do not reapply it. The iframe background is black and retains `color-scheme: light` for browser-rendered surfaces. Event duration, location, timezone, cookie controls and Calendly attribution remain visible.
- Unresolved: the owner reports pale text on light Calendly input boxes. Calendly's documented settings expose a single text colour, not a separate input-text colour. Parent-page CSS cannot target its cross-origin fields. Restoring the theme does not establish that field contrast is fixed. Do not claim the dark field text was preserved, use unsupported colour parameters, overlay controls, or filter the whole iframe. A field-specific fix requires a supported Calendly change; see the official references below. Prefill remains functional in both the inline widget and direct booking link.
- One auto-resizing embed is used per page. SDK `resize` is disabled; the site's existing message handler accepts `calendly.page_height` only from the current frame and exact Calendly origin, validates numeric heights (up to 12,000px), and updates the embed without scrolling the page. This avoids accumulated SDK resize listeners after repeated form handoffs. No overlay masks or brightness filters obscure the content.
- A 15-second readiness fallback provides an alternative if the calendar frame is slow or blocked; late successful loads recover.
- The separate-window link includes the same prefilled details as the embed and uses no-referrer handling.
- Editing form data invalidates the previous handoff. Confirmation messages must come from the current Calendly iframe and exact Calendly origin.

## Remaining account-level verification

The fix was tested against the downloaded public Calendly widget using a local DOM test harness. All three services produced an initial iframe URL containing correct full/split names, email, notes and theme parameters without firing deferred load messages. Tests include accents, spaces, plus-addressed emails and changed form values. The downloaded widget was temporary and is not bundled into the site. This verifies transport to the iframe, not a completed live booking or a browser inspection of the final invitee fields.

Check the connected calendar, availability, buffers, cancellation rules and email notifications in the new Calendly account. Complete a booking for each event when ready, verifying confirmations, cancellation/rescheduling and conferencing details. No live appointments or email messages were created during development verification.

## Official references

- https://calendly.com/help/advanced-calendly-embed-for-developers
- https://calendly.com/help/how-to-pre-fill-invitee-information-in-an-embed
- https://calendly.com/help/how-to-pre-fill-invitee-information-in-your-calendly-link
- https://calendly.com/help/how-to-customize-your-embed
- https://community.calendly.com/api-webhook-help-61/challenge-with-embedding-calendly-in-a-custom-web-application-793 (Calendly employee explains the iframe styling limitation)
