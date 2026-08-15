/* ═══════════════════════════════════════════════════════════════
   AUSPICIOUS BY DESIGN — APP
   Renders the collection, handles filter / search, modal,
   contact form, and scroll-aware navigation.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── STATE ────────────────────────────────────────────────
  const state = {
    activeCategory: "all",
    activePeriod: "all",
    searchQuery: "",
  };

  // ─── PLACEHOLDER SVG (rendered inline for cards w/o image) ─
  const PLACEHOLDER_SVG = `
    <div class="placeholder-mark">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M14 44V20a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M10 44h44" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M22 24h20M22 30h20M22 36h20" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-dasharray="2 2"/>
        <circle cx="32" cy="30" r="3" stroke="currentColor" stroke-width="1"/>
      </svg>
      <span class="pl-text">Photograph forthcoming</span>
    </div>`;

  // ─── HELPERS ──────────────────────────────────────────────
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }

  function getEarliestCentury(period) {
    const m = period.match(/(\d{1,2})(?:th|st|nd|rd)?/);
    return m ? parseInt(m[1]) : null;
  }

  // ─── RENDERING ────────────────────────────────────────────
  function renderCategories() {
    const root = document.getElementById("collection-root");
    if (!root) return;

    root.innerHTML = CATEGORIES.map((cat, idx) => {
      const items = CATALOGUE.filter(p => p.category === cat.id);
      return `
        <section class="category" data-cat="${cat.id}" id="cat-${cat.id}">
          <div class="category-head">
            <div class="category-titles">
              <div class="category-roman">${["I", "II", "III", "IV"][idx]}.</div>
              <h2 class="category-name">${esc(cat.label)}</h2>
            </div>
            <div class="category-meta">
              <span class="count">${items.length}</span>
              ${items.length === 1 ? "piece" : "pieces"} &middot; ${esc(cat.period)}
            </div>
          </div>
          <p class="category-sub">${esc(cat.subtitle)}</p>
          ${cat.essay ? `<div class="category-essay">${cat.essay.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
          <div class="grid" data-grid="${cat.id}">
            ${items.map((piece, i) => renderCard(piece, i)).join("")}
          </div>
        </section>
      `;
    }).join("");

    // Empty state (per-grid)
    document.querySelectorAll(".grid").forEach(g => {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `<div class="tracked">No matches</div><div>Try a different filter or search term.</div>`;
      g.appendChild(empty);
    });

    // Wire up clicks and keyboard
    document.querySelectorAll(".card").forEach(c => {
      c.setAttribute("tabindex", "0");
      c.setAttribute("role", "button");

      c.addEventListener("click", () => {
        const piece = CATALOGUE.find(p => p.code === c.dataset.code);
        if (piece) openModal(piece);
      });

      c.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          c.click();
        }
      });
    });

    // Staggered intro
    document.querySelectorAll(".card").forEach((c, i) => {
      c.style.animationDelay = `${Math.min(i, 12) * 0.04}s`;
    });
  }

  function renderCard(piece, idx) {
    const imgPath = piece.images && piece.images.length
      ? `images/thumbs/${piece.images[0].file}`
      : null;
    const imgPart = imgPath
      ? `<div class="card-img"><img src="${imgPath}" alt="${esc(piece.title)}" loading="lazy"></div>`
      : `<div class="card-img placeholder">${PLACEHOLDER_SVG}</div>`;

    const soldBanner = piece.sold ? `<div class="sold-banner" aria-label="Sold"><span>Sold</span></div>` : "";
    const viewCount = piece.images.length > 1
      ? `<div class="card-views">${piece.images.length} views</div>` : "";

    return `
      <article class="card${piece.sold ? " sold" : ""}" data-code="${piece.code}" data-cat="${piece.category}" data-century="${getEarliestCentury(piece.period)}">
        ${imgPart}
        ${soldBanner}
        ${viewCount}
        <div class="card-body">
          <div class="card-plate">No. ${piece.no} · ${piece.code}</div>
          <h3 class="card-title">${esc(piece.title)}</h3>
          <div class="card-period">${esc(piece.period)}</div>
          <div class="card-origin">${esc(piece.origin)}</div>
          <div class="card-dims">${esc(piece.dimensions)}</div>
        </div>
      </article>
    `;
  }

  // ─── FILTERING ────────────────────────────────────────────
  function applyFilters() {
    const cat = state.activeCategory;
    const period = state.activePeriod;
    const q = state.searchQuery.trim().toLowerCase();
    const showingAll = cat === "all";
    let totalVisible = 0;

    document.querySelectorAll(".category").forEach(section => {
      const id = section.dataset.cat;
      const cards = section.querySelectorAll(".card");
      let visibleCount = 0;

      cards.forEach(c => {
        const piece = CATALOGUE.find(p => p.code === c.dataset.code);
        if (!piece) return;

        let match = true;
        if (!showingAll && piece.category !== cat) match = false;
        if (period !== "all") {
          const century = getEarliestCentury(piece.period);
          if (period === "15-17") {
            if (!(century >= 15 && century <= 17)) match = false;
          } else if (period === "18") {
            if (century !== 18) match = false;
          } else if (period === "19-20") {
            if (!(century >= 19 && century <= 20)) match = false;
          }
        }
        if (q) {
          const hay = (piece.title + " " + piece.description + " " + piece.origin + " " + piece.code).toLowerCase();
          if (!hay.includes(q)) match = false;
        }

        c.style.display = match ? "" : "none";
        if (match) visibleCount++;
      });

      const empty = section.querySelector(".empty-state");
      if (empty) empty.classList.toggle("show", visibleCount === 0);

      // Hide entire section if category filter excludes it, or if no cards match
      const catMatch = showingAll || cat === id;
      section.style.display = (catMatch && visibleCount > 0) ? "" : "none";

      if (catMatch) totalVisible += visibleCount;

      // Only show essay when viewing a single category (not "All")
      const essay = section.querySelector(".category-essay");
      if (essay) essay.style.display = (!showingAll && cat === id) ? "" : "none";
    });

    // Global empty state when no cards match at all
    const globalEmpty = document.getElementById("collection-empty");
    if (globalEmpty) {
      globalEmpty.style.display = totalVisible === 0 ? "" : "none";
    }
  }

  function wireFilters() {
    document.querySelectorAll(".chip[data-cat-filter]").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip[data-cat-filter]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.activeCategory = chip.dataset.catFilter;
        applyFilters();
      });
    });
    document.querySelectorAll(".chip[data-period-filter]").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip[data-period-filter]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.activePeriod = chip.dataset.periodFilter;
        applyFilters();
      });
    });
    const search = document.getElementById("search-input");
    if (search) {
      let timer;
      search.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.searchQuery = search.value;
          applyFilters();
        }, 150);
      });
    }
  }

  // ─── MODAL ────────────────────────────────────────────────
  let previousFocus = null;

  // An item may be photographed from several angles, or alongside details.
  // Render the first image large, with selectable thumbnails beneath it when
  // there is more than one.
  function renderModalImages(piece, imgWrap) {
    const imgs = (piece.images || []).filter(Boolean);

    if (!imgs.length) {
      imgWrap.className = "modal-img placeholder";
      imgWrap.innerHTML = PLACEHOLDER_SVG;
      return;
    }

    imgWrap.className = "modal-img";

    if (imgs.length === 1) {
      imgWrap.innerHTML =
        `<img src="images/plates/${imgs[0].file}" alt="${esc(piece.title)}">`;
      return;
    }

    imgWrap.innerHTML = `
      <img id="modal-img-main" src="images/plates/${imgs[0].file}"
           alt="${esc(piece.title)} — ${esc(imgs[0].label)}">
      <div class="modal-img-caption" id="modal-img-caption">${esc(imgs[0].label)}</div>
      <div class="modal-thumbs" role="tablist" aria-label="Other views of this item">
        ${imgs.map((im, i) => `
          <button type="button" class="modal-thumb${i === 0 ? " active" : ""}"
                  role="tab" aria-selected="${i === 0}" data-i="${i}"
                  title="${esc(im.label)}">
            <img src="images/thumbs/${im.file}" alt="${esc(im.label)}">
          </button>`).join("")}
      </div>`;

    const main = imgWrap.querySelector("#modal-img-main");
    const caption = imgWrap.querySelector("#modal-img-caption");

    imgWrap.querySelectorAll(".modal-thumb").forEach(btn => {
      btn.addEventListener("click", () => {
        const im = imgs[parseInt(btn.dataset.i)];
        main.src = `images/plates/${im.file}`;
        main.alt = `${piece.title} — ${im.label}`;
        caption.textContent = im.label;
        imgWrap.querySelectorAll(".modal-thumb").forEach(b => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", b === btn);
        });
      });
    });
  }

  function openModal(piece) {
    previousFocus = document.activeElement;

    const overlay = document.getElementById("modal");
    const imgWrap = document.getElementById("modal-img");
    renderModalImages(piece, imgWrap);

    const bookRef = piece.bookImages && piece.bookImages.length
      ? ` · Book image${piece.bookImages.length > 1 ? "s" : ""} ${piece.bookImages.join(" & ")}`
      : "";
    document.getElementById("modal-eyebrow").textContent = `No. ${piece.no} · ${piece.code}${bookRef}`;
    document.getElementById("modal-title").textContent = piece.title;
    document.getElementById("modal-period").innerHTML = esc(piece.period) + (piece.sold ? ' <span class="sold-banner-inline">Sold</span>' : '');
    document.getElementById("modal-origin").textContent = piece.origin;
    document.getElementById("modal-dims").textContent = piece.dimensions;
    document.getElementById("modal-desc").textContent = piece.description;

    // Pre-fill enquire button to seed contact form
    const enquireBtn = document.getElementById("modal-enquire-btn");
    enquireBtn.onclick = () => {
      closeModal();
      const select = document.getElementById("form-piece");
      if (select) {
        const optVal = `No. ${piece.no} (${piece.code}) — ${piece.title}`;
        let exists = false;
        for (const o of select.options) { if (o.value === optVal) { exists = true; break; } }
        if (!exists) {
          const o = document.createElement("option");
          o.value = optVal;
          o.textContent = optVal;
          select.appendChild(o);
        }
        select.value = optVal;
      }
      setTimeout(() => {
        document.getElementById("enquire").scrollIntoView({ behavior: "smooth" });
      }, 300);
    };

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    // Move focus into modal
    setTimeout(() => {
      document.getElementById("modal-close").focus();
    }, 100);
  }

  function closeModal() {
    document.getElementById("modal").classList.remove("open");
    document.body.style.overflow = "";

    // Return focus to the element that opened the modal
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  }

  function trapFocus(e) {
    const modal = document.getElementById("modal");
    if (!modal.classList.contains("open")) return;

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function wireModal() {
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal").addEventListener("click", e => {
      if (e.target.id === "modal") closeModal();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab") trapFocus(e);
    });
  }

  // ─── DRAWER HELPERS (shared) ─────────────────────────────
  function closeDrawer() {
    const toggle = document.getElementById("nav-toggle");
    const drawer = document.getElementById("nav-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (toggle) {
      toggle.classList.remove("open");
      toggle.setAttribute("aria-label", "Open menu");
    }
    if (drawer) {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.classList.remove("open");
  }

  // ─── HEADER SCROLL STATE ─────────────────────────────────
  function wireHeader() {
    const header = document.querySelector(".site-header");
    const toggle = document.getElementById("nav-toggle");
    const drawer = document.getElementById("nav-drawer");
    const backdrop = document.getElementById("drawer-backdrop");

    function onScroll() {
      if (window.scrollY > 30) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && drawer) {
      toggle.addEventListener("click", () => {
        if (drawer.classList.contains("open")) {
          closeDrawer();
        } else {
          toggle.classList.add("open");
          drawer.classList.add("open");
          drawer.setAttribute("aria-hidden", "false");
          toggle.setAttribute("aria-label", "Close menu");
          if (backdrop) backdrop.classList.add("open");
        }
      });
      drawer.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", closeDrawer);
      });
      if (backdrop) {
        backdrop.addEventListener("click", closeDrawer);
      }
    }

    // Active nav link based on scroll position
    const links = document.querySelectorAll(".nav > a[href^='#'], .nav .nav-dropdown-trigger[href^='#']");
    const sections = Array.from(links).map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

    function updateActive() {
      const y = window.scrollY + 150;
      let activeIdx = 0;
      sections.forEach((s, i) => { if (s.offsetTop <= y) activeIdx = i; });
      links.forEach((l, i) => l.classList.toggle("active", i === activeIdx));
    }
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
  }

  // ─── STORY SUB-CHAPTER NAVIGATION ─────────────────────────
  function wireStoryDropdown() {
    const toggle = document.querySelector(".drawer-story-toggle");
    const subMenu = document.getElementById("drawer-story-sub");
    const mainLink = document.querySelector(".drawer-story-main");

    // Mobile drawer: toggle sub-chapters
    if (toggle && subMenu) {
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        subMenu.classList.toggle("open");
      });
    }

    // Close drawer when any sub-chapter link is clicked
    if (subMenu) {
      subMenu.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", closeDrawer);
      });
    }
    if (mainLink) {
      mainLink.addEventListener("click", closeDrawer);
    }
  }

  // ─── BACK TO TOP ──────────────────────────────────────────
  function wireBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;

    function toggle() {
      btn.classList.toggle("show", window.scrollY > 600);
    }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ─── ENQUIRY FORM ─────────────────────────────────────────
  function wireForm() {
    const form = document.getElementById("enquiry-form");
    if (!form) return;

    function clearErrors() {
      form.querySelectorAll(".field-error").forEach(el => el.remove());
      form.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
    }

    function showError(input, message) {
      input.classList.add("error");
      const err = document.createElement("div");
      err.className = "field-error";
      err.textContent = message;
      input.parentNode.appendChild(err);
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      clearErrors();

      const data = {
        name:    form.elements["name"].value.trim(),
        email:   form.elements["email"].value.trim(),
        piece:   form.elements["piece"].value,
        message: form.elements["message"].value.trim(),
      };

      // Validate required fields
      let valid = true;
      if (!data.name) {
        showError(form.elements["name"], "Please enter your name.");
        valid = false;
      }
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showError(form.elements["email"], "Please enter a valid email address.");
        valid = false;
      }
      if (!data.message) {
        showError(form.elements["message"], "Please enter a message.");
        valid = false;
      }
      if (!valid) return;

      const subject = `Enquiry — ${data.piece || "Auspicious by Design"}`;
      const body = `Hello,

${data.message || "[your message]"}

—
From: ${data.name}
Email: ${data.email}
Piece of interest: ${data.piece || "—"}`;

      const mailto = `mailto:info@antiquetibetanfurniture.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const status = document.getElementById("form-status");
      status.textContent = "Opening your email client…";
      status.className = "form-status show";
      window.location.href = mailto;

      setTimeout(() => {
        status.textContent = "If nothing happens, write to info@antiquetibetanfurniture.com directly.";
      }, 2000);
    });

    // Clear error state on input
    form.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", () => {
        el.classList.remove("error");
        const err = el.parentNode.querySelector(".field-error");
        if (err) err.remove();
      });
    });

    // Populate piece select with all items
    const select = document.getElementById("form-piece");
    if (select) {
      const allOpt = document.createElement("option");
      allOpt.value = "";
      allOpt.textContent = "General enquiry";
      select.appendChild(allOpt);

      CATEGORIES.forEach(cat => {
        const group = document.createElement("optgroup");
        group.label = cat.label;
        CATALOGUE.filter(p => p.category === cat.id).forEach(piece => {
          const o = document.createElement("option");
          const val = `No. ${piece.no} (${piece.code}) — ${piece.title}`;
          o.value = val;
          o.textContent = val;
          group.appendChild(o);
        });
        select.appendChild(group);
      });
    }
  }

  // ─── INIT ─────────────────────────────────────────────────
  function init() {
    renderCategories();
    applyFilters();
    wireFilters();
    wireModal();
    wireHeader();
    wireForm();
    wireBackToTop();
    wireStoryDropdown();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
