# Terms: content, decisions and remaining work

Prepared 2026-09-05. Active folder: V15. These are researched bilingual **review drafts**, not a certification of EU/Hungarian legal compliance. No live upload, client agreement, email, invoice or payment was performed.

## Delivered

- `aszf.html` (Hungarian), `terms.html` (English), with matching numbered sections, language switching and the existing section navigation.
- `terms-hu.txt` / `terms-en.txt`: self-contained downloads, including version/draft status. Browser printing also supports saving a PDF.
- Footer links on all ten HTML pages; separate quiet legal row. `legal.css` preserves the existing colours and adds readable mobile/print layouts.
- Contact-page explanation that an enquiry/Calendly selection is not itself a paid training contract; link to the draft, without a false consent checkbox.
- `tools/terms-content.json` is the paired content source. Run `python tools/build-terms.py` from V15 after updating it. Both languages and text downloads must stay aligned. The generator currently intentionally emits draft/noindex status. Do not silently remove the status while completion items remain.
- English menu/back-to-top accessibility labels in `script.js`; the rest of the site's content remains Hungarian.

## Owner-supplied facts

- Provider: Mihály Bence Egyéni Vállalkozó.
- Registered office: 2370 Dabas, Toldi Miklós utca 46., Hungary.
- Supplied identifier formatted as `91565958-1-33`, which has the form of an **adószám (tax number)**. Do not relabel it as the separate **nyilvántartási szám**. Not independently verified against the register.
- Owner says hosting is GitHub; wording uses GitHub Pages. Exact live domain, repository/deployment workflow and contracting GitHub entity remain unverified.
- No website payment collection and no planned automated invoicing. Owner contacts clients and issues invoices/receipts personally. Statutory invoice reporting/retention obligations still apply.
- Online coaching uses online agreements; gym trainees sign a separate paper agreement in person before training starts. Paper agreement is forthcoming.
- Less than 24 hours' notice: no refund for the affected paid appointment. Not the whole coaching month, not a free consultation, not an uncontracted lead; mandatory legal rights remain.
- Service-related replies within 24 hours, with refund eligibility if missed. Assumed elapsed hours including weekends, as stated to the owner; actual refund amount is pending.
- Flexible response to isolated profanity; no tolerance for harassment/threats/repeated abuse. No automatic forfeiture for a complaint or rude word.
- Strong confidentiality of chat, identity/photos, address, workplace and health/physical condition. No marketing/publication without a specific voluntary request/appropriate consent.

## Questions already sent to the owner, not answered at preparation time

1. Separate sole-trader registration number and business telephone number.
2. The amount of the late-reply refund: full affected coaching month, unused portion, or messaging component. Do not invent a component price or silently promise a full month's refund.
3. For notice at least 24 hours ahead: refund-or-reschedule versus reschedule-only.

## Necessary legal corrections

- No website payment does **not** exempt an email-concluded paid coaching contract from distance-selling rules.
- The standalone Training Program remains a separate product. If sold remotely, its actual transaction is covered by the applicable distance rules even though the owner's usual online contracting process is for coaching. A later handwritten signature cannot undo an already concluded distance contract.
- A 24-hour cancellation rule cannot override statutory withdrawal, defective-performance remedies or the promised reply guarantee. Consumer-facing cancellation fees must be fair/proportionate; obtain review of the actual charge and session allocation.
- Confidentiality is not a promise to disclose only on a search warrant. Binding lawful court/authority requirements, necessary lawful claims processing and technical providers require carefully limited exceptions. Do not promise that Gmail/Calendly providers have no access or that all content is end-to-end encrypted.
- Health data require an Article 9 GDPR condition as well as an Article 6 basis. A TOS acceptance is not blanket consent for health data or promotional photo use. The separate privacy notice is still missing.
- Online coaching is not automatically a digital download. Personalisation alone is not the custom-goods withdrawal exception. For early performance, collect explicit statements and retain the terms/offer/confirmation in a durable format before starting.

## Items that prevent treating the drafts as final

1. Resolve the three owner questions above and verify business particulars. Clarify whether gym entry is extra, session/call length, programme delivery time/format, ten-session validity, payment methods and dates. The drafts require these to be supplied in the individual pre-contract offer rather than making up values.
2. Implement/review the actual electronic withdrawal process. The current Hungarian text of 45/2014 section 22 includes an accessible withdrawal function, a confirmation step, and a prompt durable receipt including content and timestamp. Current Gmail-draft links and Calendly appointment cancellation do not fulfil this. GitHub Pages alone cannot receive the withdrawal or send/record receipts. Need an appropriate service/backend and operating procedure; do not add a fake button or silently treat an ordinary contact form as compliant. The exact application to the owner's email contracting workflow should be checked by Hungarian counsel before distance sales are operated under these terms.
3. Complete a separate actual privacy notice, provider arrangements, retention schedule, lawful health-data intake and any cookie/third-party loading requirements. Current site requests Google Fonts and loads Calendly on demand; owner uses Gmail and GitHub. Do not state all data remain exclusively with Bence.
4. Finish and align the paper gym agreement, the online offer/acceptance/confirmation documents and the early-start declarations. Use the agreed terms as an attachment or in the actual email body, not merely a changeable website link. Preserve the accepted version.
5. Have the final Hungarian terms and actual contracting/refund workflow reviewed by a Hungarian legal professional. This task did not establish the entire business's legal compliance.

## Hosting point to check separately

GitHub's Pages policy restricts use as hosting for running an online business or primarily facilitating commercial transactions. This site's paid-service offers and booking handoff merit checking with GitHub, even without checkout. Do not assume a violation is conclusively established, change hosts, or deploy elsewhere without instruction. See the official Pages limits below.

## Primary sources checked

- [45/2014. (II. 26.) Korm. rendelet](https://njt.jog.gov.hu/jogszabaly/2014-45-20-22), current page dated 2026-08-02: pre-contract information, durable confirmation, early performance, 14-day withdrawal, electronic withdrawal function, proportional charges and exceptions.
- [NKFH electronic-withdrawal guidance](https://nkfh.gov.hu/hirek/elallasi_funkcio_gyakorlati_tudnivalok_webaruhazak_reszere): function must genuinely collect/confirm/send and issue a durable acknowledgement; an ordinary form is not necessarily sufficient.
- [2001. évi CVIII. törvény, section 4](https://njt.jog.gov.hu/jogszabaly/2001-108-00-00): provider/register/hosting disclosures.
- [1997. évi CLV. törvény, section 17/A](https://njt.jog.gov.hu/jogszabaly/1997-155-00-00): complaints, 30-day substantive response and dispute information.
- [2013. évi V. törvény](https://njt.jog.gov.hu/jogszabaly/2013-5-00-00): Civil Code, fairness, liability and contractual remedies.
- [373/2021. (VI. 30.) Korm. rendelet](https://njt.jog.gov.hu/jogszabaly/2021-373-20-22): applicable digital-content/service conformity rules.
- [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj): Articles 5, 6, 9, 13, 28 and international-transfer provisions as applicable.
- [NAV sole-trader register guidance](https://nav.gov.hu/Elethelyzetek-adozasa/vallalkozas/egyeni-vallalkozok-nyilvantartasa/gyakran-ismetelt-kerdesek): NAV maintains the register; tax and registration numbers are separate.
- [MKIK regional conciliation-board directory](https://mkik.hu/a-bekelteto-testuletek-teruleti-honlapjai): current Pest board address, postal address, phone, email and website. No obsolete EU ODR-platform link was added.
- [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement): published GitHub Inc./B.V. addresses and privacy contact.
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): hosting-use restrictions.

## Validation limits

Run structural/link/language checks and the existing contact/navigation/email tests after edits. Browser/physical-device visual testing and live upload are separate, not performed by generating static terms. The English translation is not a certified legal translation.
