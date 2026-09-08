// ── Ambient pointer ──────────────────────────────────────────
const root = document.documentElement;
const isEnglish = root.lang === "en";
const localText = (hu, en) => isEnglish ? en : hu;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const scrollBehavior = () => reducedMotion.matches ? "auto" : "smooth";
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let ambientFrame = 0;
  let pointerX = 0, pointerY = 0;
  window.addEventListener("pointermove", (e) => {
    if (reducedMotion.matches) return;
    pointerX = e.clientX; pointerY = e.clientY;
    if (ambientFrame) return;
    ambientFrame = requestAnimationFrame(() => {
      ambientFrame = 0;
      root.style.setProperty("--mx", `${Math.round((pointerX / innerWidth) * 100)}%`);
      root.style.setProperty("--my", `${Math.round((pointerY / innerHeight) * 100)}%`);
    });
  }, { passive: true });
}

// ── Header scroll ────────────────────────────────────────────
const header = document.querySelector(".site-header");
if (header) {
  const tick = () => header.classList.toggle("is-scrolled", scrollY > 24);
  tick();
  addEventListener("scroll", tick, { passive: true });
}

// ── Lift preload state after first paint (re-enables transitions) ──
requestAnimationFrame(() => {
  requestAnimationFrame(() => document.documentElement.classList.remove("preload"));
});

// ── Hamburger / mobile menu ──────────────────────────────────
const burger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
if (burger && mobileMenu) {
  const setMenu = (open, returnFocus = false) => {
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", document.documentElement.lang === "en"
      ? (open ? "Close menu" : "Open menu")
      : (open ? "Menü bezárása" : "Menü megnyitása"));
    mobileMenu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    document.querySelectorAll("main, .site-footer").forEach(el => { el.inert = open; });
    const scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) scrollTop.inert = open;
    if (open) mobileMenu.querySelector("a")?.focus();
    else if (returnFocus) burger.focus();
  };
  burger.addEventListener("click", () => {
    setMenu(!burger.classList.contains("open"));
  });
  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      setMenu(false);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (!burger.classList.contains("open")) return;
    if (event.key === "Escape") { setMenu(false, true); return; }
    if (event.key !== "Tab") return;
    const stops = [burger, ...mobileMenu.querySelectorAll("a")];
    const current = stops.indexOf(document.activeElement);
    event.preventDefault();
    stops[(current + (event.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
  });
  matchMedia("(min-width: 1181px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}

// ── Active nav link ──────────────────────────────────────────
const page = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(a => {
  const href = a.getAttribute("href") || "";
  if (href === page || (page === "" && href === "index.html")) {
    a.classList.add("active");
    a.setAttribute("aria-current", "page");
  }
});

// ── Reveal on scroll ─────────────────────────────────────────
window.__revealInit = true;
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    const isPhoneLike = window.matchMedia("(max-width: 768px)").matches;
    el.style.transitionDelay = isPhoneLike ? "0ms" : `${Math.min(i % 6 * 80, 320)}ms`;
    obs.observe(el);
  });
} else {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
}

// ── Floating scroll-to-top ───────────────────────────────────
(function scrollTopBtn() {
  const btn = document.createElement("button");
  btn.className = "scroll-top";
  btn.setAttribute("aria-label", document.documentElement.lang === "en" ? "Back to top" : "Vissza az oldal tetejére");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14"/><path d="m18 13-6-6-6 6"/><path d="M12 7v14"/></svg>';
  document.body.appendChild(btn);

  const toggle = () => btn.classList.toggle("visible", scrollY > 400);
  toggle();
  addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => scrollTo({ top: 0, behavior: scrollBehavior() }));
})();

// ── Footer year ──────────────────────────────────────────────
const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Reliable email copy action ──────────────────────────────
const fallbackCopy = (value) => {
  const previousFocus = document.activeElement;
  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  helper.style.pointerEvents = "none";
  try {
    document.body.appendChild(helper);
    helper.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    helper.remove();
    previousFocus?.focus({ preventScroll: true });
  }
};

const copyText = async (value) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    return fallbackCopy(value);
  } catch {
    return fallbackCopy(value);
  }
};

const copyEmailButton = document.querySelector(".js-copy-email");
if (copyEmailButton) {
  const copyEmailLabel = copyEmailButton.querySelector(".js-copy-email-label");
  const defaultCopyLabel = copyEmailLabel?.textContent || localText("Cím másolása", "Copy email address");

  copyEmailButton.addEventListener("click", async () => {
    const email = copyEmailButton.dataset.email || "";
    if (!email) return;
    const copied = await copyText(email);

    if (copyEmailLabel) copyEmailLabel.textContent = copied ? localText("Email cím másolva ✓", "Email address copied ✓") : localText("Jelöld ki és másold a fenti címet.", "Select and copy the address above.");
    copyEmailButton.classList.toggle("is-copied", copied);

    window.setTimeout(() => {
      if (copyEmailLabel) copyEmailLabel.textContent = defaultCopyLabel;
      copyEmailButton.classList.remove("is-copied");
    }, 2400);
  });
}

const inquiryCopyButton = document.querySelector("#inquiry-copy-button");
if (inquiryCopyButton) {
  const inquiryCopyLabel = inquiryCopyButton.querySelector(".js-inquiry-copy-label");
  const defaultInquiryLabel = inquiryCopyLabel?.textContent || localText("Megkeresés másolása", "Copy enquiry");

  inquiryCopyButton.addEventListener("click", async () => {
    const content = inquiryCopyButton.dataset.copyText || "";
    if (!content) return;
    const copied = await copyText(content);

    if (inquiryCopyLabel) inquiryCopyLabel.textContent = copied ? localText("Megkeresés másolva", "Enquiry copied") : localText("Másolás sikertelen", "Could not copy");
    inquiryCopyButton.classList.toggle("is-copied", copied);

    window.setTimeout(() => {
      if (inquiryCopyLabel) inquiryCopyLabel.textContent = defaultInquiryLabel;
      inquiryCopyButton.classList.remove("is-copied");
    }, 2400);
  });
}

// ── FAQ accordion ────────────────────────────────────────────
document.querySelectorAll(".faq-q").forEach((btn, index) => {
  const answer = btn.closest(".faq-item").querySelector(".faq-a");
  answer.id = `faq-answer-${index}`;
  answer.hidden = true;
  btn.setAttribute("aria-controls", answer.id);
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(i => {
      i.classList.remove("open");
      i.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      i.querySelector(".faq-a").hidden = true;
    });
    if (!isOpen) {
      item.classList.add("open");
      answer.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// ── Count-up stats ───────────────────────────────────────────
(function initCountUp() {
  const counters = document.querySelectorAll("[data-countup]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    if (el.dataset.counted === "true") return;
    el.dataset.counted = "true";

    const target = Number.parseInt(el.getAttribute("data-countup") || "0", 10);
    if (!Number.isFinite(target) || target < 0) {
      el.textContent = "0";
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || target === 0) {
      el.textContent = String(target);
      return;
    }

    const duration = 1300;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = String(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => obs.observe(counter));
  } else {
    counters.forEach((counter) => animateCounter(counter));
  }
})();

// ── Contact form + Calendly handoff ─────────────────────────
const CALENDLY_EVENTS = window.SITE_CONFIG?.calendlyEvents || {};
const INQUIRY_EMAIL = window.SITE_CONFIG?.inquiryEmail?.trim() || "mihaly.bence.fitness@gmail.com";
const APPOINTMENT_SERVICES = new Set(["consult", "pt", "online"]);
const buildBrandedCalendlyUrl = (eventUrl) => {
  const url = new URL(eventUrl);
  if (url.origin !== "https://calendly.com") throw new Error("Invalid scheduling URL");
  url.searchParams.set("hide_event_type_details", "0");
  // Preserve the owner's black/gold theme. Calendly exposes one text colour,
  // not a separate input-text setting; do not recolour the entire widget to fix fields.
  url.searchParams.set("background_color", "100f0c");
  url.searchParams.set("text_color", "f5f0e8");
  url.searchParams.set("primary_color", "d4a843");
  return url.toString();
};

const buildCalendlyBookingUrl = (eventUrl, prefill) => {
  const url = new URL(buildBrandedCalendlyUrl(eventUrl));
  // Include both name layouts, so either Calendly invitee-form setting works.
  const fields = {
    name: prefill.name,
    first_name: prefill.firstName,
    last_name: prefill.lastName,
    email: prefill.email,
    a1: prefill.customAnswers.a1
  };
  Object.entries(fields).forEach(([key, value]) => url.searchParams.set(key, value));
  // The widget parses its URL with decodeURIComponent, which leaves '+' literal.
  // Encode spaces as %20 and email plus signs as %2B before it reads the URL.
  url.search = [...url.searchParams].map(([key, value]) =>
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  ).join("&");
  return url.toString();
};

// Load only when a visitor asks to see appointments. Failed loads can be retried.
let calendlyLoad;
const ensureCalendly = () => {
  if (window.Calendly?.initInlineWidget) return Promise.resolve();
  if (calendlyLoad) return calendlyLoad;
  calendlyLoad = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      calendlyLoad = null;
      reject(new Error("Calendar unavailable"));
    };
    const timer = setTimeout(fail, 12000);
    script.onload = () => {
      if (!window.Calendly?.initInlineWidget) { fail(); return; }
      clearTimeout(timer);
      resolve();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return calendlyLoad;
};

const contactForm = document.querySelector(".js-contact-form");
if (contactForm) {
  const serviceSelect = contactForm.querySelector("#service");
  const routeNote = contactForm.querySelector("#route-note");
  const routeSubmit = contactForm.querySelector("#route-submit");
  const packageSelect = contactForm.querySelector("#online-package");
  const packageGroup = contactForm.querySelector("#online-package-group");
  const schedulingSection = document.querySelector(".calendly-section");
  const inquirySection = document.querySelector(".inquiry-section");
  const embed = document.querySelector("#calendly-embed");
  const loading = document.querySelector("#calendly-loading");
  const notice = document.querySelector("#calendly-config-notice");
  const directLink = document.querySelector("#calendly-direct-link");
  let bookingRequest = 0;
  let readyTimer;
  const invalidateBooking = () => {
    bookingRequest += 1;
    clearTimeout(readyTimer);
    if (embed) { embed.innerHTML = ""; embed.hidden = true; }
    if (loading) loading.hidden = true;
    if (schedulingSection) schedulingSection.hidden = true;
    if (inquirySection) inquirySection.hidden = true;
    if (directLink) { directLink.hidden = true; directLink.removeAttribute("href"); }
  };

  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (serviceSelect && ["consult", "pt", "online", "program", "other"].includes(requestedService || "")) {
    serviceSelect.value = requestedService;
  }
  const requestedPackage = new URLSearchParams(window.location.search).get("package");
  if (packageSelect && ["basic", "plus", "premium"].includes(requestedPackage)) {
    packageSelect.value = requestedPackage;
  }

  const updateRouteHint = () => {
    const serviceKey = serviceSelect?.value || "";
    if (packageGroup) packageGroup.hidden = serviceKey !== "online";
    if (packageSelect) packageSelect.disabled = serviceKey !== "online";
    const usesCalendar = APPOINTMENT_SERVICES.has(serviceKey);
    if (routeNote) routeNote.hidden = Boolean(serviceKey) && !usesCalendar;
    if (!serviceKey) {
      if (routeNote) routeNote.textContent = localText("Válaszd az ingyenes konzultációt, ha még nem tudod, melyik edzésforma illene hozzád.", "Choose the free consultation if you’re not sure which training option would suit you.");
      if (routeSubmit) routeSubmit.textContent = localText("Tovább", "Continue");
      return;
    }
    if (routeNote) {
      routeNote.textContent = usesCalendar
        ? localText("A következő lépésben időpontot választasz és megerősíted a foglalást a Calendly naptárában.", "Next, choose a time and confirm your booking in the Calendly calendar.")
        : "";
    }
    if (routeSubmit) routeSubmit.textContent = usesCalendar ? localText("Tovább az időpontokhoz", "Choose a time") : localText("Tovább az üzenethez", "Prepare enquiry");
  };

  serviceSelect?.addEventListener("change", () => { invalidateBooking(); updateRouteHint(); });
  contactForm.addEventListener("input", invalidateBooking);
  packageSelect?.addEventListener("change", invalidateBooking);
  updateRouteHint();

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;
    invalidateBooking();
    const requestId = bookingRequest;

    const schedulingSection = document.querySelector(".calendly-section");
    const inquirySection = document.querySelector(".inquiry-section");
    const embed = document.querySelector("#calendly-embed");
    const notice = document.querySelector("#calendly-config-notice");
    const selectedServiceBadge = document.querySelector("#selected-service-badge");
    const serviceKey = serviceSelect?.value || "";
    const baseServiceLabel = serviceSelect?.selectedOptions?.[0]?.textContent?.trim() || "";
    const packageLabel = serviceKey === "online" && packageSelect?.value
      ? packageSelect.selectedOptions?.[0]?.textContent?.trim() : "";
    const serviceLabel = packageLabel ? `${baseServiceLabel} – ${packageLabel}` : baseServiceLabel;
    const firstName = contactForm.querySelector("#fname")?.value?.trim() || "";
    const lastName = contactForm.querySelector("#lname")?.value?.trim() || "";
    const fullName = (isEnglish ? `${firstName} ${lastName}` : `${lastName} ${firstName}`).trim();
    const email = contactForm.querySelector("#email")?.value?.trim() || "";
    const phone = contactForm.querySelector("#phone")?.value?.trim() || "";
    const message = contactForm.querySelector("#message")?.value?.trim() || "";
    const focusSection = (section) => {
      if (!section) return;
      const heading = section.querySelector("h2");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
      section.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    };

    if (!APPOINTMENT_SERVICES.has(serviceKey)) {
      if (schedulingSection) schedulingSection.hidden = true;
      if (inquirySection) inquirySection.hidden = false;

      const inquiryServiceName = document.querySelector("#inquiry-service-name");
      const inquiryEmailLink = document.querySelector("#inquiry-email-link");
      const inquiryCopyButton = document.querySelector("#inquiry-copy-button");
      if (inquiryServiceName) inquiryServiceName.textContent = serviceLabel;
      if (inquiryEmailLink) {
        const subject = `${serviceLabel} – ${localText("weboldali érdeklődés", "website enquiry")}`;
        const body = [
          `${localText("Név", "Name")}: ${fullName}`.trim(),
          `Email: ${email}`,
          `${localText("Telefon", "Phone")}: ${phone || localText("nincs megadva", "not provided")}`,
          `${localText("Szolgáltatás", "Service")}: ${serviceLabel}`,
          "",
          message || localText("Ide írhatod a kérdésedet.", "Write your question here.")
        ].join("\n");
        const gmailUrl = new URL("https://mail.google.com/mail/");
        gmailUrl.searchParams.set("view", "cm");
        gmailUrl.searchParams.set("fs", "1");
        gmailUrl.searchParams.set("to", INQUIRY_EMAIL);
        gmailUrl.searchParams.set("su", subject);
        gmailUrl.searchParams.set("body", body);
        inquiryEmailLink.href = gmailUrl.toString();

        if (inquiryCopyButton) {
          inquiryCopyButton.dataset.copyText = [
            `${localText("Címzett", "To")}: ${INQUIRY_EMAIL}`,
            `${localText("Tárgy", "Subject")}: ${subject}`,
            "",
            body
          ].join("\n");
        }
      }

      focusSection(inquirySection);
      return;
    }

    const eventUrl = String(CALENDLY_EVENTS[serviceKey] || "").trim();
    if (inquirySection) inquirySection.hidden = true;
    if (schedulingSection) schedulingSection.hidden = false;
    if (selectedServiceBadge) selectedServiceBadge.textContent = serviceLabel;
    if (embed) { embed.innerHTML = ""; embed.hidden = true; }
    if (notice) notice.hidden = true;

    if (!eventUrl) {
      if (notice) notice.hidden = false;
      focusSection(schedulingSection);
      return;
    }

    try {
      if (!embed) throw new Error("Missing calendar container");
      // All three live events have one free-text invitee question (a1).
      const bookingNotes = [
        `${localText("Szolgáltatás", "Service")}: ${serviceLabel}`,
        `${localText("Telefon", "Phone")}: ${phone || localText("nincs megadva", "not provided")}`,
        "",
        message ? `${localText("Üzenet", "Message")}: ${message}` : ""
      ].join("\n").trim();
      const prefill = {
        name: fullName,
        firstName,
        lastName,
        email,
        customAnswers: { a1: bookingNotes }
      };
      // Pass the same fully prefilled URL to the inline widget and its fallback.
      // This does not depend on the widget's deferred prefill message arriving.
      const url = buildCalendlyBookingUrl(eventUrl, prefill);
      if (directLink) { directLink.href = url; directLink.hidden = false; }
      if (loading) loading.hidden = false;
      focusSection(schedulingSection);
      await ensureCalendly();
      if (requestId !== bookingRequest) return;
      embed.hidden = false;
      embed.style.height = "780px";
      window.Calendly.initInlineWidget({
      url,
      parentElement: embed,
      // Handle height updates once below; the SDK otherwise adds a new global
      // resize listener on every handoff and can scroll the page unexpectedly.
      resize: false,
      prefill,
      utm: {
        utmSource: "mihaly-bence-weboldal",
        utmMedium: "website",
        utmCampaign: serviceKey
      }
      });
      embed.querySelector("iframe")?.setAttribute("title", `${serviceLabel} – ${localText("időpontfoglalás", "appointment booking")}`);
      readyTimer = setTimeout(() => {
        if (requestId !== bookingRequest) return;
        if (loading) loading.hidden = true;
        if (notice) notice.hidden = false;
      }, 15000);
    } catch {
      if (requestId !== bookingRequest) return;
      if (embed) embed.hidden = true;
      if (loading) loading.hidden = true;
      if (notice) notice.hidden = false;
      focusSection(schedulingSection);
    }
  });

  window.addEventListener("message", (event) => {
    const frame = embed?.querySelector("iframe");
    if (event.origin !== "https://calendly.com" || !frame || event.source !== frame.contentWindow || schedulingSection?.hidden) return;
    const name = event.data?.event;
    if (name === "calendly.page_height") {
      const heightValue = String(event.data?.payload?.height ?? "");
      if (!/^\d+(?:\.\d+)?(?:px)?$/.test(heightValue)) return;
      const height = Number.parseFloat(heightValue);
      if (height > 0 && height <= 12000) embed.style.height = `${Math.ceil(height)}px`;
      return;
    }
    if (!["calendly.event_type_viewed", "calendly.date_and_time_selected", "calendly.event_scheduled"].includes(name)) return;
    clearTimeout(readyTimer);
    if (loading) loading.hidden = true;
    if (notice) notice.hidden = true;
    if (name !== "calendly.event_scheduled") return;
    const success = document.querySelector(".form-success");
    const calendlyShell = document.querySelector(".calendly-shell");
    contactForm.style.display = "none";
    if (calendlyShell) calendlyShell.hidden = true;
    success?.classList.add("visible");
    success?.setAttribute("tabindex", "-1");
    success?.focus({ preventScroll: true });
    success?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  });
}

// ── Gallery popout ───────────────────────────────────────────
(() => {
  const items = document.querySelectorAll(".gallery-item");
  if (!items.length) return;

  let activeItem = null;
  let activeOverlay = null;
  let removeGlobalHandlers = null;
  let previousBodyOverflow = "";

  const closePopover = (immediate = false) => {
    const itemToClose = activeItem;
    const overlayToClose = activeOverlay;
    const cleanupHandlers = removeGlobalHandlers;

    activeItem = null;
    activeOverlay = null;
    removeGlobalHandlers = null;

    if (itemToClose) itemToClose.classList.remove("is-open");
    if (cleanupHandlers) cleanupHandlers();
    document.body.style.overflow = previousBodyOverflow;
    document.querySelectorAll(".site-header, main, .site-footer").forEach(el => { el.inert = false; });
    const scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) scrollTop.inert = false;
    if (itemToClose && !immediate) itemToClose.focus({ preventScroll: true });

    if (!overlayToClose) return;
    if (immediate || reducedMotion.matches || overlayToClose.classList.contains("is-closing")) {
      overlayToClose.remove();
      return;
    }

    overlayToClose.classList.add("is-closing");
    overlayToClose.classList.remove("is-open");

    const removeOverlay = () => {
      if (overlayToClose.isConnected) overlayToClose.remove();
    };

    overlayToClose.addEventListener("transitionend", (event) => {
      if (event.target === overlayToClose) removeOverlay();
    }, { once: true });

    setTimeout(removeOverlay, 620);
  };

  const openPopover = (item) => {
    if (activeItem === item) {
      closePopover();
      return;
    }

    closePopover(true);
    activeItem = item;
    item.classList.add("is-open");
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const customNote = item.getAttribute("data-note") || item.querySelector(".gallery-caption")?.textContent || localText("Egy pillanat a mindennapokból.", "A moment from everyday life.");
    const overlay = document.createElement("div");
    overlay.className = "gallery-modal";
    overlay.innerHTML = `
      <div class="gallery-modal-backdrop" data-close="true"></div>
      <div class="gallery-modal-panel card" role="dialog" aria-modal="true" aria-label="${localText("Kiemelt galéria elem", "Gallery photo")}">
        <button class="gallery-modal-close" type="button" aria-label="${localText("Bezárás", "Close")}">&times;</button>
        <div class="gallery-modal-media"></div>
        <div class="gallery-modal-copy">
          <div class="gallery-modal-note"></div>
        </div>
      </div>
    `;
    overlay.querySelector(".gallery-modal-note").textContent = customNote;

    const mediaSlot = overlay.querySelector(".gallery-modal-media");
    const sourceMedia = item.querySelector("img, .img-placeholder");
    if (sourceMedia && mediaSlot) {
      const clone = sourceMedia.cloneNode(true);
      if (sourceMedia.dataset.fullSrc) {
        clone.removeAttribute("srcset");
        clone.removeAttribute("sizes");
        clone.src = sourceMedia.dataset.fullSrc;
        clone.loading = "eager";
      }
      clone.classList.add("gallery-modal-media-item");
      mediaSlot.appendChild(clone);
    }

    document.body.appendChild(overlay);
    document.querySelectorAll(".site-header, main, .site-footer").forEach(el => { el.inert = true; });
    const scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) scrollTop.inert = true;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    activeOverlay = overlay;

    overlay.querySelector(".gallery-modal-close")?.addEventListener("click", () => closePopover());

    const onPointerDown = (event) => {
      if (overlay.contains(event.target) && !event.target.closest(".gallery-modal-panel")) closePopover();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") closePopover();
      if (event.key === "Tab") {
        event.preventDefault();
        overlay.querySelector(".gallery-modal-close")?.focus();
      }
    };
    const onResize = () => {
      if (activeOverlay !== overlay) return;
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    removeGlobalHandlers = () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };

    overlay.querySelector(".gallery-modal-close")?.focus();
  };

  items.forEach(item => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("click", () => openPopover(item));
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPopover(item);
      }
    });
  });
})();

// ── Profile card: restrained pointer depth ───────────────────
const profileCard = document.querySelector(".profile-card");
if (profileCard && matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let profileFrame = 0;

  profileCard.addEventListener("pointermove", (event) => {
    const rect = profileCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    cancelAnimationFrame(profileFrame);
    profileFrame = requestAnimationFrame(() => {
      const rotateX = (y - .5) * -3.2;
      const rotateY = (x - .5) * 3.2;
      profileCard.style.setProperty("--card-x", `${x * 100}%`);
      profileCard.style.setProperty("--card-y", `${y * 100}%`);
      profileCard.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });
  });

  profileCard.addEventListener("pointerleave", () => {
    cancelAnimationFrame(profileFrame);
    profileCard.style.setProperty("--card-x", "50%");
    profileCard.style.setProperty("--card-y", "50%");
    profileCard.style.transform = "perspective(1100px) rotateX(0) rotateY(0) translateY(0)";
  });
}
