(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Tema terang / gelap ---------- */
  const saved = store.get("theme");
  const setTheme = (t) => {
    root.setAttribute("data-theme", t);
    root.setAttribute("data-bs-theme", t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f5f2ea" : "#0e0f11");
  };
  setTheme(saved === "light" ? "light" : "dark");
  $("#themeBtn").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
    store.set("theme", next);
  });

  /* ---------- Menu HP (Bootstrap collapse) ---------- */
  const menu = $("#menu");
  const closeMenu = () => {
    if (window.bootstrap && menu.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
    }
  };
  $$("a", menu).forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Progress, tombol ke atas ---------- */
  const bar = $(".scroll-progress span"), toTop = $("#toTop");
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    bar.style.transform = `scaleX(${p})`;
    toTop.classList.toggle("show", scrollY > 700);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---------- Scroll-spy (menu aktif) lewat Bootstrap ScrollSpy ---------- */
  if (window.bootstrap) {
    new bootstrap.ScrollSpy(root, { target: "#menu", rootMargin: "-45% 0px -50% 0px", threshold: [0], smoothScroll: false });
  }

  /* ---------- Reveal saat gulir ---------- */
  const rev = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); rev.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    rev.observe(el);
  });

  /* ---------- Efek mengetik ---------- */
  const typed = $("#typed");
  const roles = (typed.dataset.roles || "").split("|").filter(Boolean);
  if (reduce || roles.length < 2) {
    typed.textContent = roles[0] || "";
  } else {
    let r = 0, c = 0, del = false;
    const tick = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, c);
      let wait = del ? 45 : 90;
      if (!del && c === word.length) { del = true; wait = 1400; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
      else { c += del ? -1 : 1; }
      setTimeout(tick, wait);
    };
    tick();
  }

  /* ---------- Cahaya mengikuti kursor di hero ---------- */
  const hero = $(".hero");
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
      hero.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }

  /* ---------- Filter proyek ---------- */
  const chips = $$(".chip");
  const cards = $$(".card");
  chips.forEach(ch => ch.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    ch.classList.add("active");
    const f = ch.dataset.filter;
    cards.forEach(card => card.classList.toggle("hide", f !== "semua" && card.dataset.cat !== f));
  }));

  /* ---------- Jendela detail proyek ---------- */
  const modal = $("#modal");
  const fill = (card) => {
    $("#mTitle").textContent = card.dataset.title || "";
    $("#mDesc").textContent = card.dataset.desc || "";
    $("#mTech").textContent = card.dataset.tech || "";
    const link = $("#mLink");
    const href = card.dataset.link || "#";
    link.href = href;
    link.style.display = href === "#" ? "none" : "";
  };
  cards.forEach(card => card.addEventListener("click", () => {
    fill(card);
    if (typeof modal.showModal === "function") modal.showModal();
  }));
  modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

  /* ---------- Salin email ---------- */
  const toast = $("#toast");
  let tt;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  $("#copyBtn").addEventListener("click", async () => {
    const mail = $("#mailLink").textContent.trim();
    try {
      await navigator.clipboard.writeText(mail);
      say("Email disalin ke papan klip");
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = mail; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); say("Email disalin ke papan klip"); }
      catch (err) { say("Salin manual: " + mail); }
      ta.remove();
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();
