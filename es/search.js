document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("siteSearch");
  const resultsBox = document.getElementById("searchResults");

  // If this page doesn't have the search bar, do nothing
  if (!searchInput || !resultsBox) return;

  const searchData = [
    { label: "Book a Visit", icon: "📅", url: "book-a-visit.html" },
    { label: "Contact", icon: "💬", url: "contact.html" },
    { label: "How it works", icon: "✅", url: "how-it-works.html" },
    { label: "Services", icon: "🩺", url: "services.html" },

    { label: "Telemedicine", icon: "💻", url: "telemedicine.html" },
    { label: "Clinic Visit (GP)", icon: "🏥", url: "clinic-visits.html" },
    { label: "Home / Hotel Visit", icon: "🏠", url: "home-hotel-visits.html" },
    { label: "Pediatric Visit", icon: "👶", url: "home-hotel-visits.html" },
    { label: "Specialist Visit", icon: "⭐️", url: "wellness-specialty.html" },
    { label: "Medical Certificates", icon: "📄", url: "medical-certificates.html" },
    { label: "Diagnostic Testing", icon: "🧪", url: "diagnostic-testing.html" },
    { label: "Preventive Medicine", icon: "🛡️", url: "preventive-checkups.html" },

    { label: "Rome", icon: "📍", url: "book-a-visit.html" },
    { label: "Milan", icon: "📍", url: "book-a-visit.html" },
    { label: "Florence", icon: "📍", url: "book-a-visit.html" },
    { label: "Venice", icon: "📍", url: "book-a-visit.html" },
    { label: "Naples", icon: "📍", url: "book-a-visit.html" },
    { label: "Amalfi Coast", icon: "📍", url: "book-a-visit.html" }
  ];

  function renderResults(matches) {
    resultsBox.innerHTML = "";

    if (!matches.length) {
      resultsBox.innerHTML = `<div class="search-result-item">No results found</div>`;
      resultsBox.style.display = "block";
      return;
    }

    matches.forEach(match => {
      const div = document.createElement("div");
      div.className = "search-result-item";
      div.innerHTML = `
        <span class="search-result-icon">${match.icon}</span>
        <span>${match.label}</span>
      `;
      div.addEventListener("click", () => {
        window.location.href = match.url;
      });
      resultsBox.appendChild(div);
    });

    resultsBox.style.display = "block";
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      resultsBox.style.display = "none";
      resultsBox.innerHTML = "";
      return;
    }

    const matches = searchData
      .filter(item => item.label.toLowerCase().includes(query))
      .slice(0, 7);

    renderResults(matches);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".site-search")) {
      resultsBox.style.display = "none";
    }
  });
});
