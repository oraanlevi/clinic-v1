(function () {
  const sharedReviews = [
    {
      firstName: "Lucas",
      lastInitial: "M",
      city: "Barcelona",
      rating: 5,
      messages: {
        en: "Great experience. Traveling with family can be stressful when someone gets sick, but the doctor arrived the same day and helped immediately. Excellent service.",
        it: "Ottima esperienza. Viaggiare con la famiglia puo essere stressante quando qualcuno si ammala, ma il medico e arrivato lo stesso giorno e ha aiutato subito. Servizio eccellente.",
        fr: "Excellente experience. Voyager en famille peut etre stressant quand quelqu un tombe malade, mais le medecin est arrive le jour meme et a aide immediatement. Service excellent.",
        es: "Gran experiencia. Viajar con la familia puede ser estresante cuando alguien se enferma, pero el medico llego el mismo dia y ayudo de inmediato. Servicio excelente."
      }
    },
    {
      firstName: "Anna",
      lastInitial: "K",
      city: "Berlin",
      rating: 5,
      messages: {
        en: "Very convenient medical service for travelers in Italy. Booking was easy and the doctor explained everything clearly in English.",
        it: "Servizio medico molto comodo per chi viaggia in Italia. Prenotare e stato facile e il medico ha spiegato tutto con chiarezza in inglese.",
        fr: "Service medical tres pratique pour les voyageurs en Italie. La reservation etait simple et le medecin a tout explique clairement en anglais.",
        es: "Servicio medico muy practico para viajeros en Italia. Reservar fue facil y el medico explico todo claramente en ingles."
      }
    }
  ];

  function getLang() {
    const fromHtml = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    if (["en", "it", "fr", "es"].includes(fromHtml)) return fromHtml;
    const parts = window.location.pathname.split("/").filter(Boolean);
    const first = (parts[0] || "en").toLowerCase();
    return ["en", "it", "fr", "es"].includes(first) ? first : "en";
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

    return article;
  }

  function getLocalizedReviews(lang) {
    return sharedReviews.map((review) => ({
      firstName: review.firstName,
      lastInitial: review.lastInitial,
      city: review.city,
      rating: review.rating,
      message: review.messages[lang] || review.messages.en
    }));
  }

  function initReviews() {
    const list = document.getElementById("reviews-list");
    const empty = document.getElementById("reviews-empty");
    if (!list || !empty) return;

    const lang = getLang();
    const reviews = getLocalizedReviews(lang);

    list.innerHTML = "";

    if (!reviews.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    reviews.forEach((review) => {
      list.appendChild(makeReviewCard(review));
    });
  }

  document.addEventListener("DOMContentLoaded", initReviews);
})();
