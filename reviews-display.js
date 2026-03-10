(function () {
  const labels = {
    en: {
      loading: "Loading approved patient reviews...",
      empty: "No approved reviews yet."
    },
    it: {
      loading: "Caricamento recensioni approvate...",
      empty: "Nessuna recensione approvata al momento."
    },
    fr: {
      loading: "Chargement des avis approuves...",
      empty: "Aucun avis approuve pour le moment."
    },
    es: {
      loading: "Cargando resenas aprobadas...",
      empty: "No hay resenas aprobadas por ahora."
    }
  };

  function getLang() {
    const fromHtml = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    if (["en", "it", "fr", "es"].includes(fromHtml)) return fromHtml;
    const parts = window.location.pathname.split("/").filter(Boolean);
    const first = (parts[0] || "en").toLowerCase();
    return ["en", "it", "fr", "es"].includes(first) ? first : "en";
  }

  function sanitizeText(value, maxLen) {
    const clean = String(value || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return clean.slice(0, maxLen);
  }

  function normalizeReview(item, lang) {
    const firstName = sanitizeText(item.first_name, 50);
    const lastInitial = sanitizeText(item.last_initial, 1).toUpperCase();
    const city = sanitizeText(item.city, 60);
    const message = sanitizeText(item.message, 700);
    const serviceType = sanitizeText(item.service_type, 80);
    const ratingRaw = Number(item.rating);
    const rating = Number.isInteger(ratingRaw) ? Math.max(1, Math.min(5, ratingRaw)) : 5;

    if (!firstName || !lastInitial || !city || !message) return null;
    if (item.language && item.language !== lang) return null;

    return {
      firstName,
      lastInitial,
      city,
      message,
      rating,
      serviceType
    };
  }

  function renderStars(rating) {
    const filled = "★".repeat(rating);
    const empty = "☆".repeat(5 - rating);
    return `${filled}${empty}`;
  }

  function makeReviewCard(review) {
    const article = document.createElement("article");
    article.className = "review-card";

    const top = document.createElement("div");
    top.className = "review-card-top";

    const name = document.createElement("p");
    name.className = "review-name";
    name.textContent = `${review.firstName} ${review.lastInitial}.`;

    const city = document.createElement("p");
    city.className = "review-city";
    city.textContent = review.city;

    const stars = document.createElement("p");
    stars.className = "review-stars";
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    stars.textContent = renderStars(review.rating);

    top.appendChild(name);
    top.appendChild(city);
    top.appendChild(stars);

    const message = document.createElement("p");
    message.className = "review-message";
    message.textContent = review.message;

    article.appendChild(top);
    article.appendChild(message);

    if (review.serviceType) {
      const service = document.createElement("p");
      service.className = "review-service";
      service.textContent = review.serviceType;
      article.appendChild(service);
    }

    return article;
  }

  async function fetchFallback(lang) {
    try {
      const res = await fetch("../data/approved-reviews.json", { cache: "no-store" });
      if (!res.ok) return [];
      const json = await res.json();
      const rows = Array.isArray(json[lang]) ? json[lang] : [];
      return rows
        .map((row) => normalizeReview({ ...row, language: lang }, lang))
        .filter(Boolean)
        .slice(0, 6);
    } catch (_) {
      return [];
    }
  }

  async function fetchFromSupabase(lang) {
    const cfg = window.DOCTOR_REVIEWS_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return [];
    if (!window.supabase || !window.supabase.createClient) return [];

    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const table = cfg.table || "reviews";

    const { data, error } = await client
      .from(table)
      .select("first_name,last_initial,city,language,rating,message,service_type,approved")
      .eq("approved", true)
      .eq("language", lang)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !Array.isArray(data)) return [];

    return data
      .map((row) => normalizeReview(row, lang))
      .filter(Boolean)
      .slice(0, 6);
  }

  async function initReviews() {
    const list = document.getElementById("reviews-list");
    const empty = document.getElementById("reviews-empty");
    if (!list || !empty) return;

    const lang = getLang();
    const t = labels[lang] || labels.en;
    empty.hidden = false;
    empty.textContent = t.loading;

    let reviews = await fetchFromSupabase(lang);
    if (!reviews.length) {
      reviews = await fetchFallback(lang);
    }

    list.innerHTML = "";

    if (!reviews.length) {
      empty.textContent = t.empty;
      return;
    }

    empty.hidden = true;
    reviews.forEach((review) => {
      list.appendChild(makeReviewCard(review));
    });
  }

  document.addEventListener("DOMContentLoaded", initReviews);
})();
