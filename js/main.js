/**
 * FSS Redesign - Main JavaScript
 * Handles navigation, dynamic content, and interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScrolling();
  initInternalNavigation();
  initMobileNav();
  initDropdownToggles();
  initAnimations();
  initHeroSlider();
  updateYear();
  loadAnnouncements();
  loadProgrammes();
  loadNews();
  initCalendar();
  initFooterSearch();
});


/* =========================================
   1. NAVIGATION & UI INTERACTIONS
   ========================================= */

function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slider .slide");
  const dots = document.querySelectorAll(".dot");

  if (slides.length <= 1) return;

  let currentSlide = 0;
  const intervalTime = 5000;
  let slideInterval;

  const updateSlider = (index) => {
    if (index === currentSlide) return;

    // Determine direction
    // If we are at the last slide and go to first, treat as Next (Forward)
    // If we are at the first slide and go to last, treat as Prev (Backward)
    // Otherwise, numerical comparison.
    let direction = "next";
    if (currentSlide === 0 && index === slides.length - 1) {
      direction = "prev";
    } else if (currentSlide === slides.length - 1 && index === 0) {
      direction = "next";
    } else {
      direction = index > currentSlide ? "next" : "prev";
    }

    const current = slides[currentSlide];
    const next = slides[index];

    // Reset classes
    slides.forEach((s) => {
      s.classList.remove("active", "exit-left", "exit-right", "from-left");
      s.style.transition = "";
    });

    if (direction === "next") {
      // Forward: Current -> Exit Left (-100%), Next starts Right (100%) -> Center (0)

      // 1. Prepare Next (ensure it's at 100%, which is default state for .slide)
      // If next happened to be 'from-left' or 'exit-left', we must reset it to 100% instantly
      next.style.transition = "none";
      next.style.transform = "translateX(100%)";
      void next.offsetWidth; // Force reflow
      next.style.transition = "";
      next.style.transform = "";

      // 2. Animate
      current.classList.add("exit-left");
      next.classList.add("active");
    } else {
      // Backward: Current -> Exit Right (100%), Next starts Left (-100%) -> Center (0)

      // 1. Prepare Next (start at -100%)
      next.style.transition = "none";
      next.classList.add("from-left"); // Sets translateX(-100%)
      void next.offsetWidth; // Force reflow
      next.style.transition = "";

      // 2. Animate
      current.classList.add("exit-right"); // Moves to 100%
      setTimeout(() => {
        next.classList.remove("from-left");
        next.classList.add("active");
      }, 20); // Small delay to ensure transition engages
    }

    // Update state
    currentSlide = index;
    dots.forEach((d) => d.classList.remove("active"));
    dots[currentSlide].classList.add("active");
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    updateSlider(nextIndex);
  };

  // Auto slide
  slideInterval = setInterval(nextSlide, intervalTime);

  // Event Listeners for Dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      updateSlider(index);
      resetInterval();
    });
  });

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, intervalTime);
  }
}

function initAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) {
    // If reduced motion is preferred, just show everything immediately
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("active");
      el.classList.remove("reveal"); // Remove class to prevent future animations
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px", // Trigger when element touches viewport edge
    threshold: 0.15, // 15% visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Entance
        entry.target.classList.add("active");
        entry.target.classList.remove("exiting");
      } else {
        // Exit (Optional: Uncomment next lines if you want elements to fade out when scrolling away)
        // For a smoother experience, we typically only animate IN, but user asked for "entrance and exit".
        // Let's implement it such that if it goes completely out of view, it resets for next time.

        // entry.target.classList.remove("active");
        // entry.target.classList.add("exiting");

        // Valid Strategy:
        // 1. Play entrance when it comes into view.
        // 2. Play exit when it leaves view (can be annoying if reading).
        // 3. Current implementation: Animate IN. If user scrolls UP and then back DOWN, should it animate again?
        // Let's make it Reversible.

        if (entry.boundingClientRect.y > 0) {
          // Element went below the fold (scrolled up) - maybe keep it visible?
          // Usually we only exit if we want to re-trigger the entrance.
          // Let's strictly follow "Entrance AND Exit" request.
          // This implies when I scroll past it, it might fade out, or when I scroll back it fades out.

          // Simple Reversible Animation Logic:
          entry.target.classList.remove("active");
          // We don't necessarily need an explicit 'exiting' class if removing 'active' reverts to the hidden state defined in CSS (.reveal)
          // .reveal has opacity: 0; transform: translateY(30px);
          // So removing .active will animate it back to invisible state.
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => {
    observer.observe(el);
  });
}

/* =========================================
   2. NAVIGATION & UI INTERACTIONS
   ========================================= */

function initMobileNav() {
  const toggleBtn = document.querySelector(".mobile-toggle");
  const navList = document.querySelector(".nav-list");
  const links = document.querySelectorAll(".nav-list a");
  const closeBtn = document.querySelector(".mobile-close-btn");

  if (!toggleBtn || !navList) return;

  // Create backdrop if it doesn't exist
  let backdrop = document.querySelector(".mobile-nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "mobile-nav-backdrop";
    document.body.appendChild(backdrop);
  }

  const closeMenu = () => {
    navList.classList.remove("active");
    backdrop.classList.remove("active");
    document.body.classList.remove("no-scroll");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    navList.classList.add("active");
    backdrop.classList.add("active");
    document.body.classList.add("no-scroll");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  toggleBtn.addEventListener("click", () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Close menu when clicking a navigation link (but not dropdown toggles)
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Don't close if it's a dropdown toggle on mobile
      if (
        link.parentElement.classList.contains("has-dropdown") &&
        window.innerWidth <= 820
      ) {
        return; // Let the dropdown toggle work
      }
      // No automatic close on link click; user must close manually
    });
  });

  // Prevent clicks inside nav from closing the menu
  navList.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Close menu when clicking backdrop
  backdrop.addEventListener("click", closeMenu);

  // Handle ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navList.classList.contains("active")) {
      closeMenu();
    }
  });
}

function initDropdownToggles() {
  const dropdowns = document.querySelectorAll(".has-dropdown > a");

  dropdowns.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      // Only toggle on mobile or if needed. For now, we enable it generally for touch support.
      if (window.innerWidth <= 820) {
        e.preventDefault();
        const parent = trigger.parentElement;
        parent.classList.toggle("dropdown-active");
      }
    });
  });
}

function initInternalNavigation() {
  // Smooth scroll offset for fixed header
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 85;

        // Use Lenis if available
        if (window.lenis) {
          window.lenis.scrollTo(targetElement, {
            offset: -headerOffset,
            duration: 1.5, // Slightly slower for dramatic effect if desired
          });
        } else {
          // Fallback to native
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

function initSmoothScrolling() {
  // Inject Lenis script dynamically
  const script = document.createElement("script");
  script.src = "https://unpkg.com/lenis@1.1.20/dist/lenis.min.js";
  script.async = true;
  script.onload = () => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

  };
  document.head.appendChild(script);
}

function updateYear() {
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/* =========================================
   2. DATA & CONTENT MANAGEMENT
   ========================================= */

// Expose functions to window for Web Components
window.initMobileNav = initMobileNav;
window.initDropdownToggles = initDropdownToggles;
window.updateYear = updateYear;

const data = {
  programmes: [
    {
      title: "Surveying & Geoinformatics",
      dept: "surveying",
      level: "ND / HND / PPD / PD",
      desc: "The foundational course covering geodesy, photogrammetry, and hydrography.",
    },

    {
      title: "Cartography & GIS",
      dept: "cartography",
      level: "ND / HND / PGD GIS",
      desc: "The art and science of map making combined with modern GIS technologies.",
    },
    {
      title: "Photogrammetry & Remote Sensing",
      dept: "surveying",
      level: "ND / HND",
      desc: "Extracting 3D information from 2D images and satellite data analysis.",
    },
    {
      title: "Computer Science",
      dept: "science",
      level: "ND",
      desc: "Software engineering, data science, and computational theory tailored for geospatial apps.",
    },
    {
      title: "Software & Web Development",
      dept: "science",
      level: "HND",
      desc: "Advanced training in full-stack web development, software engineering, and mobile app creation.",
    },
  ],
  news: [
    {
      title:
        "Student Matriculation Ceremony Scheduled for January 22, 2026",
      date: "22",
      month: "JAN",
      excerpt:
        "The school will hold its matriculation ceremony for newly admitted students on January 22. The event formally admits fresh students into the institution and marks the beginning of their academic journey. All newly admitted students are expected to attend and participate fully in the exercise.",
    },
    {
      title: "FSS Oyo Partners with NASRDA for Space Research Training",
      date: "20",
      month: "Nov",
      excerpt:
        "A strategic partnership has been signed between FSS Oyo and the National Space Research and Development Agency to foster collaborative research.",
    },
    {
      title: "Surveyors Registration Council of Nigeria Accreditation Visit",
      date: "14",
      month: "Oct",
      excerpt:
        "SURCON accreditation team lauds the school's state-of-the-art laboratory facilities during their recent accreditation visit.",
    },
  ],

  //UPDATE ADDED EVENT DATE HERE FOR THE CALENDAR  
  events: [
    { date: 5, month: 0, year: 2026 }, // Jan 5, 2026
    { date: 11, month: 11, year: 2025 }, // Dec 11, 2025
    { date: 22, month: 0, year: 2026 }, // Jan 22, 2026
    { date: 1, month: 9, year: 2026 }, // Oct 1, 2026
  ],
};

/* =========================================
   3. DYNAMIC CONTENT LOADERS
   ========================================= */

function loadAnnouncements() {
  try {
    const ticker = document.querySelector('.announcement-bar .ticker-content');
    if (!ticker || !window.data || !Array.isArray(window.data.news)) return;
    const items = data.news.map((n) => n.title || '').filter(Boolean);
    if (items.length === 0) return;
    // Join with separators similar to the original markup
    ticker.textContent = items.join(' | ');
  } catch (e) {
    // fail silently to avoid blocking other inits
  }
}


function loadProgrammes() {
  const grid = document.getElementById("programmes-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (!grid) return;

  function render(filter) {
    grid.innerHTML = "";
    const filteredData =
      filter === "all"
        ? data.programmes
        : data.programmes.filter((p) => p.dept === filter);

    if (filteredData.length === 0) {
      grid.innerHTML = `<div class="text-center" style="grid-column: 1/-1; padding: 2rem;">No programmes found for this category.</div>`;
      return;
    }

    filteredData.forEach((prog, index) => {
      const card = document.createElement("div");
      card.className = "programme-card fade-in";
      card.style.animationDelay = `${index * 100}ms`;

      card.innerHTML = `
                <span class="dept-tag">${prog.level}</span>
                <h3>${prog.title}</h3>
                <p>${prog.desc}</p>
                <a href="#" class="btn btn-secondary btn-sm">View Details &rarr;</a>
            `;
      grid.appendChild(card);
    });
  }

  // Initial Render
  render("all");

  // Filter Logic
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Add to click
      btn.classList.add("active");

      const category = btn.getAttribute("data-filter");
      render(category);
    });
  });
}

function loadNews() {
  const feed = document.getElementById("news-feed");
  if (!feed) return;

  feed.innerHTML = data.news
    .map(
      (item) => `
        <article class="news-item">
            <div class="news-date">
                <span class="day">${item.date}</span>
                <span class="month">${item.month}</span>
            </div>
            <div class="news-content">
                <h3><a href="#">${item.title}</a></h3>
                <p>${item.excerpt}</p>
                <a href="#" style="font-size: 0.9rem; font-weight: 500;">Read More</a>
            </div>
        </article>
    `
    )
    .join("");
}

// Add simple fade-in animation styles dynamically
const style = document.createElement("style");
style.textContent = `
    .fade-in {
        opacity: 0;
        animation: fadeIn 0.5s ease forwards;
    }
    @keyframes fadeIn {
        to { opacity: 1; transform: translateY(0); }
        from { opacity: 0; transform: translateY(20px); }
    }
`;
document.head.appendChild(style);

/* =========================================
   4. CALENDAR FUNCTIONALITY
   ========================================= */

let currentViewYear;
let currentViewMonth;

function initCalendar() {
  const monthEl = document.getElementById("calendar-month");
  const daysEl = document.getElementById("calendar-days");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");

  if (!monthEl || !daysEl) return;

  const now = new Date();
  currentViewYear = now.getFullYear();
  currentViewMonth = now.getMonth();

  renderCalendar();

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentViewMonth--;
      if (currentViewMonth < 0) {
        currentViewMonth = 11;
        currentViewYear--;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentViewMonth++;
      if (currentViewMonth > 11) {
        currentViewMonth = 0;
        currentViewYear++;
      }
      renderCalendar();
    });
  }
}

function renderCalendar() {
  const monthEl = document.getElementById("calendar-month");
  const daysEl = document.getElementById("calendar-days");

  if (!monthEl || !daysEl) return;

  const now = new Date();
  const realYear = now.getFullYear();
  const realMonth = now.getMonth();
  const realDate = now.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  monthEl.textContent = `${monthNames[currentViewMonth]} ${currentViewYear}`;

  const firstDay = new Date(currentViewYear, currentViewMonth, 1).getDay();
  const daysInMonth = new Date(
    currentViewYear,
    currentViewMonth + 1,
    0
  ).getDate();
  const daysInPrevMonth = new Date(
    currentViewYear,
    currentViewMonth,
    0
  ).getDate();

  let html = "";

  // Previous month filler
  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrevMonth - firstDay + 1 + i;
    html += `<span class="dim">${d}</span>`;
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    let className = "";

    // Check for Today
    if (
      i === realDate &&
      currentViewMonth === realMonth &&
      currentViewYear === realYear
    ) {
      className += " active";
    }

    // Check for Events
    const hasEvent = data.events.some(
      (e) =>
        e.date === i &&
        e.month === currentViewMonth &&
        e.year === currentViewYear
    );

    if (hasEvent) {
      className += " has-event";
    }

    html += `<span class="${className.trim()}">${i}</span>`;
  }

  // Next month filler
  const totalCells = firstDay + daysInMonth;
  const remaining = 7 - (totalCells % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      html += `<span class="dim">${i}</span>`;
    }
  }

  // Headers + generated days
  const headers = `<span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>`;
  daysEl.innerHTML = headers + html;
}

// Append CSS for active date and event indicators
const calendarStyle = document.createElement("style");
calendarStyle.textContent = `
    .calendar-days span.active {
        background-color: var(--primary-color, #0056b3);
        color: #fff;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        margin: auto;
    }
    .calendar-days span {
        position: relative; /* For Pseudo-element positioning */
    }
    .calendar-days span.has-event {
        background-color: #f97316; /* Orange background */
        color: #fff; /* White text */
        font-weight: bold;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        margin: auto;
    }
    
    /* Active day styling (overrides has-event background if both apply, or we combine) */
    .calendar-days span.active {
        background-color: var(--primary-color, #0056b3) !important;
        color: #fff !important;
    }

    /* Distinct look for Active + Event: Blue bg with Orange Border */
    .calendar-days span.active.has-event {
        border: 2px solid #f97316; 
    }
`;
document.head.appendChild(calendarStyle);

/* =========================================
   5. FOOTER SEARCH
   Client-side search over a small set of site pages.
   ========================================= */

function initFooterSearch() {
  const input = document.getElementById("footer-search-input");
  const btn = document.getElementById("footer-search-btn");
  const resultsEl = document.getElementById("footer-search-results");
  if (!input || !resultsEl) return;

  const pages = [
    "index.html",
    "pages/about/about-us.html",
    "pages/about/vision-mission.html",
    "pages/about/anthem.html",
    "pages/about/governing-council.html",
    "pages/about/academic-board.html",
    "pages/about/principal-officers.html",
    // PDFs and downloadable documents (indexed by filename and linked)
    "pdf/FSS conditions of service.pdf",
    "pdf/Revised Schemes of Service for NBTE and Fed Polys july 2013.pdf",
  ];

  let index = null;

  function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  async function buildIndex() {
    if (index) return index;
    const idx = [];

    // Index the currently loaded document so searches work when running via file:// or when fetch is blocked
    try {
      const currentPath = (window.location.pathname || "index.html").split("/").pop() || "index.html";
      const docBody = document.body ? document.body.textContent : "";
      idx.push({ path: currentPath, title: (document.title || currentPath).trim(), body: (docBody || "").replace(/\s+/g, " ") });
    } catch (e) {
      // ignore
    }

    // Index visible links and their surrounding text to improve match chances for navigation labels
    try {
      document.querySelectorAll("a[href]").forEach((a) => {
        try {
          const href = a.getAttribute("href");
          if (!href) return;
          // skip external, mailto, tel
          if (/^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) return;
          const path = href.split("#")[0] || (window.location.pathname || "index.html");
          const text = (a.textContent || "").trim();
          if (text) {
            // include a bit of surrounding context if available
            const surrounding = a.closest && a.closest("li") ? (a.closest("li").textContent || "") : text;
            idx.push({ path: path, title: text, body: (surrounding || text).replace(/\s+/g, " ") });
          }
        } catch (e) {}
      });
    } catch (e) {}
    await Promise.all(
      pages.map(async (p) => {
        try {
          // If it's a PDF or other non-HTML document, avoid fetching and index by filename
          if (p.toLowerCase().endsWith(".pdf") || p.toLowerCase().endsWith(".doc") || p.toLowerCase().endsWith(".docx")) {
            const name = p.split("/").pop();
            // avoid duplicates
            if (!idx.some((it) => it.path === p && it.title === name)) idx.push({ path: p, title: name, body: "" });
            return;
          }

          const res = await fetch(p);
          if (!res.ok) throw new Error("fetch failed");
          const txt = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(txt, "text/html");
          const title = doc.querySelector("title")?.textContent || p;
          const body = doc.body?.textContent || "";
          // avoid duplicates
          const cleanTitle = title.trim();
          const cleanBody = body.replace(/\s+/g, " ");
          if (!idx.some((it) => it.path === p && it.title === cleanTitle)) idx.push({ path: p, title: cleanTitle, body: cleanBody });
        } catch (e) {
          // If fetch fails (file:// or CORS), fallback to title-only entry
          const name = p.split("/").pop();
          if (!idx.some((it) => it.path === p && it.title === name)) idx.push({ path: p, title: name, body: "" });
        }
      })
    );
    index = idx;
    return index;
  }

  function scoreMatch(item, q) {
    const qlc = q.toLowerCase();
    let score = 0;
    if (item.title.toLowerCase().includes(qlc)) score += 30;
    if (item.body.toLowerCase().includes(qlc)) score += 10;
    return score;
  }

  function renderResults(results, q) {
    if (!results || results.length === 0) {
      resultsEl.innerHTML = `<div class="no-results">No results for "${escapeHtml(q)}"</div>`;
      return;
    }
    resultsEl.innerHTML = results
      .map((r) => {
        const excerpt = makeExcerpt(r, q);
        return `<a class="search-result" href="${r.path}"><div class="sr-title">${escapeHtml(r.title)}</div><div class="sr-excerpt">${escapeHtml(excerpt)}</div></a>`;
      })
      .join("");
  }

  function makeExcerpt(item, q) {
    const qlc = q.toLowerCase();
    const body = item.body || "";
    const idx = body.toLowerCase().indexOf(qlc);
    if (idx === -1) return body.slice(0, 140).trim();
    const start = Math.max(0, idx - 40);
    return body.slice(start, Math.min(body.length, idx + 100)).trim();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function doSearch(q) {
    q = q.trim();
    if (!q) {
      resultsEl.innerHTML = "";
      return;
    }
    await buildIndex();
    const matches = index
      .map((it) => ({ ...it, score: scoreMatch(it, q) }))
      .filter((it) => it.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    renderResults(matches, q);
  }

  const debounced = debounce(() => doSearch(input.value), 250);

  input.addEventListener("input", debounced);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch(input.value);
    }
  });

  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      doSearch(input.value);
    });
  }
}
