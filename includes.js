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

function setActiveNav() {
  const currentFile = getCurrentFile();

  // highlight ALL nav links including CTA
  const navLinks = document.querySelectorAll(
    ".nav-links a, .header-cta"
  );

  navLinks.forEach(link => {
    link.classList.remove("active");

    const href = link.getAttribute("href") || "";

    if (href.endsWith(currentFile)) {
      link.classList.add("active");
    }
  });

  // highlight dropdown toggle if inside dropdown
  const dropdownLinks = document.querySelectorAll(".dropdown-menu a");

  dropdownLinks.forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(currentFile)) {
      const dropdown = link.closest(".dropdown");
      const toggle = dropdown?.querySelector(".dropdown-toggle");
      if (toggle) toggle.classList.add("active");
    }
  });
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

  const langLinks = document.querySelectorAll(".lang-toggle a");

  langLinks.forEach(a => {
    a.classList.remove("active");

    const code = (a.textContent || "").trim().toLowerCase();

    if (langMap[code]) {
      a.setAttribute("href", langMap[code]);
    }

    if (code === currentLang) {
      a.classList.add("active");
    }
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
    setActiveNav();
    setLanguageLinksAndActive();
  });

  loadPartial("site-footer", footerPath);
});
