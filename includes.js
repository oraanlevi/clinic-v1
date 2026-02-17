async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return false;

  try {
    const res = await fetch(file);
    const text = await res.text();
    el.innerHTML = text;
    return true;
  } catch (e) {
    console.log("Could not load:", file);
    return false;
  }
}

function getCurrentLang() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const lang = parts[0]?.toLowerCase();
  if (["en", "it", "es", "fr"].includes(lang)) return lang;
  return "en";
}

function getCurrentFile() {
  let file = window.location.pathname.split("/").pop();
  if (!file || !file.includes(".html")) file = "index.html";
  return file;
}

function cleanHref(href) {
  return (href || "").split("?")[0].split("#")[0];
}

function setActiveNav() {
  const currentFile = getCurrentFile();

  // include drawer links too
  const links = document.querySelectorAll(
    ".nav-links a, .header-cta, .mobile-drawer a"
  );

  links.forEach(link => {
    link.classList.remove("active");

    const href = cleanHref(link.getAttribute("href"));
    if (href.endsWith(currentFile)) {
      link.classList.add("active");

      // if inside dropdown, highlight toggle too
      const dropdown = link.closest(".dropdown");
      if (dropdown) {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) toggle.classList.add("active");
      }
    }
  });

  // if on services.html, also highlight Services toggle
  if (currentFile === "services.html") {
    document.querySelectorAll(".dropdown-toggle").forEach(t => t.classList.add("active"));
  }
}

function setLanguageLinksAndActive() {
  const currentLang = getCurrentLang();
  const currentFile = getCurrentFile();

  const langMap = {
    en: `../en/${currentFile}`,
    it: `../it/${currentFile}`,
    es: `../es/${currentFile}`,
    fr: `../fr/${currentFile}`,
  };

  // include drawer language links too
  const langLinks = document.querySelectorAll(".lang-toggle a, .mobile-drawer .lang-toggle a");

  langLinks.forEach(a => {
    a.classList.remove("active");

    const code = (a.textContent || "").trim().toLowerCase();
    if (langMap[code]) a.setAttribute("href", langMap[code]);
    if (code === currentLang) a.classList.add("active");
  });
}

function initMobileDrawer() {
  // prevent double init
  if (document.querySelector(".mobile-drawer")) return;

  const header = document.querySelector(".site-header");
  if (!header) return;

  const headerRight = header.querySelector(".header-right");
  const brand = header.querySelector(".brand");
  const nav = header.querySelector(".nav-links");
  const lang = header.querySelector(".lang-toggle");
  const cta = header.querySelector(".header-cta");

  if (!headerRight || !brand || !nav) return;

  // hamburger button
  const btn = document.createElement("button");
  btn.className = "mobile-menu-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open menu");
  btn.innerHTML = "☰";
  headerRight.prepend(btn);

  // overlay + drawer
  const overlay = document.createElement("div");
  overlay.className = "mobile-overlay";

  const drawer = document.createElement("aside");
  drawer.className = "mobile-drawer";
  drawer.setAttribute("aria-hidden", "true");

  drawer.innerHTML = `
    <div class="mobile-top">
      <a class="mobile-brand" href="${brand.getAttribute("href") || "index.html"}">
        ${brand.textContent.trim()}
      </a>
      <button type="button" class="mobile-close" aria-label="Close menu">Close</button>
    </div>
  `;

  // clone content into drawer
  const navClone = nav.cloneNode(true);
  drawer.appendChild(navClone);

  if (lang) {
    const langClone = lang.cloneNode(true);
    drawer.appendChild(langClone);
  }

  if (cta) {
    const ctaClone = cta.cloneNode(true);
    drawer.appendChild(ctaClone);
  }

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  const openDrawer = () => {
    overlay.classList.add("open");
    drawer.classList.add("open");
    document.body.classList.add("drawer-open");
    drawer.setAttribute("aria-hidden", "false");
  };

  const closeDrawer = () => {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");
  };

  btn.addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeDrawer);
  drawer.querySelector(".mobile-close")?.addEventListener("click", closeDrawer);

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // click link closes
  drawer.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeDrawer();
  });

  // dropdown tap expand in drawer
  drawer.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const parent = toggle.closest(".dropdown");
      if (!parent) return;
      parent.classList.toggle("open");
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname.toLowerCase();

  let headerPath = "";
  let footerPath = "";

  if (path.includes("/es/")) {
    headerPath = "../partials/es/header.html";
    footerPath = "../partials/es/footer.html";
  } else if (path.includes("/it/")) {
    headerPath = "../partials/it/header.html";
    footerPath = "../partials/it/footer.html";
  } else if (path.includes("/fr/")) {
    headerPath = "../partials/fr/header.html";
    footerPath = "../partials/fr/footer.html";
  } else {
    headerPath = "../partials/en/header.html";
    footerPath = "../partials/en/footer.html";
  }

  loadPartial("site-header", headerPath).then(() => {
    setLanguageLinksAndActive();
    setActiveNav();
  });

  loadPartial("site-footer", footerPath);
});
