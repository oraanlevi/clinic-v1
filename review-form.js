(function () {
  const i18n = {
    en: {
      success: "Thank you. Your review was submitted for moderation.",
      configError: "Review submission is not configured yet. Please try again later.",
      genericError: "Could not submit your review right now. Please try again.",
      consentRequired: "Please confirm your review is genuine.",
      invalidName: "Enter a valid first name.",
      invalidLastInitial: "Enter a valid last initial.",
      invalidCity: "Enter a valid city.",
      invalidLanguage: "Select a valid language.",
      invalidRating: "Select a rating between 1 and 5.",
      invalidMessage: "Review message must be between 30 and 700 characters.",
      invalidService: "Service type is too long.",
      submitting: "Submitting...",
      submit: "Submit Review"
    },
    it: {
      success: "Grazie. La tua recensione e stata inviata per la moderazione.",
      configError: "Invio recensioni non ancora configurato. Riprova piu tardi.",
      genericError: "Impossibile inviare la recensione ora. Riprova.",
      consentRequired: "Conferma che la recensione e autentica.",
      invalidName: "Inserisci un nome valido.",
      invalidLastInitial: "Inserisci un iniziale valida.",
      invalidCity: "Inserisci una citta valida.",
      invalidLanguage: "Seleziona una lingua valida.",
      invalidRating: "Seleziona un voto da 1 a 5.",
      invalidMessage: "Il messaggio deve contenere tra 30 e 700 caratteri.",
      invalidService: "Il tipo di servizio e troppo lungo.",
      submitting: "Invio in corso...",
      submit: "Invia recensione"
    },
    fr: {
      success: "Merci. Votre avis a ete envoye pour moderation.",
      configError: "L envoi des avis n est pas encore configure. Reessayez plus tard.",
      genericError: "Impossible d envoyer votre avis pour le moment.",
      consentRequired: "Veuillez confirmer que votre avis est authentique.",
      invalidName: "Saisissez un prenom valide.",
      invalidLastInitial: "Saisissez une initiale valide.",
      invalidCity: "Saisissez une ville valide.",
      invalidLanguage: "Selectionnez une langue valide.",
      invalidRating: "Selectionnez une note entre 1 et 5.",
      invalidMessage: "Le message doit contenir entre 30 et 700 caracteres.",
      invalidService: "Le type de service est trop long.",
      submitting: "Envoi en cours...",
      submit: "Envoyer l avis"
    },
    es: {
      success: "Gracias. Tu resena fue enviada para moderacion.",
      configError: "El envio de resenas aun no esta configurado. Intentalo mas tarde.",
      genericError: "No se pudo enviar tu resena en este momento.",
      consentRequired: "Confirma que tu resena es autentica.",
      invalidName: "Introduce un nombre valido.",
      invalidLastInitial: "Introduce una inicial valida.",
      invalidCity: "Introduce una ciudad valida.",
      invalidLanguage: "Selecciona un idioma valido.",
      invalidRating: "Selecciona una puntuacion entre 1 y 5.",
      invalidMessage: "El mensaje debe tener entre 30 y 700 caracteres.",
      invalidService: "El tipo de servicio es demasiado largo.",
      submitting: "Enviando...",
      submit: "Enviar resena"
    }
  };

  function getLang() {
    const code = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
    return ["en", "it", "fr", "es"].includes(code) ? code : "en";
  }

  function sanitize(value, maxLen) {
    return String(value || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLen);
  }

  function setStatus(statusEl, msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `review-form-status ${type}`;
  }

  function validate(payload, t) {
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,40}$/.test(payload.first_name)) return t.invalidName;
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]$/.test(payload.last_initial)) return t.invalidLastInitial;
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' .-]{2,60}$/.test(payload.city)) return t.invalidCity;
    if (!["en", "it", "fr", "es"].includes(payload.language)) return t.invalidLanguage;
    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) return t.invalidRating;
    if (payload.message.length < 30 || payload.message.length > 700) return t.invalidMessage;
    if (payload.service_type.length > 80) return t.invalidService;
    if (!payload.consent) return t.consentRequired;
    return "";
  }

  async function submitReview(payload) {
    const cfg = window.DOCTOR_REVIEWS_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      return { error: { message: "Missing Supabase configuration." } };
    }
    if (!window.supabase || !window.supabase.createClient) {
      return { error: { message: "Supabase client not loaded." } };
    }

    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const table = cfg.table || "reviews";

    return client.from(table).insert({
      first_name: payload.first_name,
      last_initial: payload.last_initial,
      city: payload.city,
      language: payload.language,
      rating: payload.rating,
      message: payload.message,
      service_type: payload.service_type || null,
      consent: payload.consent,
      approved: false
    });
  }

  function initReviewForm() {
    const form = document.getElementById("review-form");
    const statusEl = document.getElementById("review-form-status");
    const submitBtn = form?.querySelector("button[type='submit']");
    if (!form || !statusEl || !submitBtn) return;

    const lang = getLang();
    const t = i18n[lang] || i18n.en;

    const languageInput = form.querySelector("select[name='language']");
    if (languageInput) languageInput.value = lang;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        first_name: sanitize(formData.get("first_name"), 40),
        last_initial: sanitize(formData.get("last_initial"), 1).toUpperCase(),
        city: sanitize(formData.get("city"), 60),
        language: sanitize(formData.get("language"), 2).toLowerCase(),
        rating: Number(formData.get("rating")),
        message: sanitize(formData.get("message"), 700),
        service_type: sanitize(formData.get("service_type"), 80),
        consent: formData.get("consent") === "on"
      };

      const errorText = validate(payload, t);
      if (errorText) {
        setStatus(statusEl, errorText, "error");
        return;
      }

      if (!window.DOCTOR_REVIEWS_CONFIG?.supabaseUrl || !window.DOCTOR_REVIEWS_CONFIG?.supabaseAnonKey) {
        setStatus(statusEl, t.configError, "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = t.submitting;

      try {
        const { error } = await submitReview(payload);
        if (error) {
          setStatus(statusEl, t.genericError, "error");
        } else {
          form.reset();
          if (languageInput) languageInput.value = lang;
          setStatus(statusEl, t.success, "success");
        }
      } catch (_) {
        setStatus(statusEl, t.genericError, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t.submit;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initReviewForm);
})();
