document.addEventListener("DOMContentLoaded", () => {
  initRawAuthMessageCleanup();
  initDjangoMessages();
  initNewsletter();
  initProductsCarousel();
  initFeaturedProductLinks();
  initPasswordToggles();
  initSavedCredentialsLogin();
});

function normalizeSystemMessage(message) {
  if (!message) return "";

  const cleanMessage = message.trim();

  if (/^Successfully signed in as/i.test(cleanMessage) || /^Bienvenida\/o a Mundo Mascotas/i.test(cleanMessage)) {
    return "Bienvenida/o a Mundo Mascotas.";
  }

  if (/^Successfully signed out/i.test(cleanMessage)) {
    return "Sesión cerrada correctamente.";
  }

  return cleanMessage;
}

function initRawAuthMessageCleanup() {
  const bodyNodes = Array.from(document.body.childNodes);

  bodyNodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent.trim();

    if (
      /^Successfully signed in as/i.test(text) ||
      /^Successfully signed out/i.test(text) ||
      /^Bienvenida\/o a Mundo Mascotas/i.test(text)
    ) {
      const normalizedMessage = normalizeSystemMessage(text);
      node.remove();

      window.setTimeout(() => {
        showToast(normalizedMessage);
      }, 150);
    }
  });
}

function initDjangoMessages() {
  const messages = document.querySelectorAll("[data-django-messages] .django-message");

  messages.forEach((message, index) => {
    window.setTimeout(() => {
      showToast(normalizeSystemMessage(message.textContent));
    }, index * 450);
  });
}

/* =========================
   NEWSLETTER
========================= */

function initNewsletter() {
  const form = document.getElementById("newsletterForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = form.querySelector("input[name='email']");
    const petSelect = form.querySelector("select[name='pet_type']");

    const email = emailInput ? emailInput.value.trim() : "";
    const pet = petSelect ? petSelect.value : "";

    if (!email) {
      showToast("Debes ingresar un correo electrónico.");
      return;
    }

    if (!validateEmail(email)) {
      showToast("Ingresa un correo válido.");
      return;
    }

    try {
      const response = await fetch("/newsletter/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({
          email,
          pet_type: pet
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "No pudimos registrar tu suscripción.");
        return;
      }

      showToast(data.message || "Suscripción registrada correctamente.");
      form.reset();
    } catch (error) {
      showToast("Error al enviar. Intenta nuevamente.");
    }
  });
}

/* =========================
   CARRUSEL PRODUCTOS HOME
========================= */

function initProductsCarousel() {
  const viewport = document.querySelector(".products-viewport");
  const prevBtn = document.getElementById("productsPrev");
  const nextBtn = document.getElementById("productsNext");

  if (!viewport || !prevBtn || !nextBtn) return;

  function getScrollAmount() {
    return Math.max(260, viewport.clientWidth * 0.85);
  }

  function updateButtons() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;

    prevBtn.disabled = viewport.scrollLeft <= 4;
    nextBtn.disabled = viewport.scrollLeft >= maxScroll - 4;
  }

  prevBtn.addEventListener("click", () => {
    viewport.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth"
    });
  });

  nextBtn.addEventListener("click", () => {
    viewport.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth"
    });
  });

  viewport.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);

  updateButtons();
}

function initFeaturedProductLinks() {
  const productCards = document.querySelectorAll(".featured-products .product-card");

  productCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    if (!title) return;

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Ver ${title} en la tienda`);

    const goToProduct = () => {
      window.location.href = `/tienda/?buscar=${encodeURIComponent(title)}#catalogo`;
    };

    card.addEventListener("click", goToProduct);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToProduct();
      }
    });
  });
}

/* =========================
   MOSTRAR / OCULTAR CONTRASEÑA
========================= */

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    if (button.dataset.toggleBound === "true") return;
    button.dataset.toggleBound = "true";

    button.addEventListener("click", () => {
      const targetId = button.dataset.target || button.dataset.passwordToggle;
      const input = document.getElementById(targetId);
      const icon = button.querySelector(".material-symbols-outlined");

      if (!input) return;

      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");
      button.classList.toggle("is-visible", shouldShow);

      if (icon) {
        icon.textContent = shouldShow ? "visibility_off" : "visibility";
      }
    });
  });
}

/* =========================
   CREDENCIALES GUARDADAS
========================= */

function initSavedCredentialsLogin() {
  const savedButton = document.getElementById("useSavedCredentialsBtn");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!savedButton || !loginForm || !emailInput || !passwordInput) return;

  savedButton.addEventListener("click", async () => {
    if (window.PasswordCredential && navigator.credentials) {
      try {
        const credential = await navigator.credentials.get({
          password: true,
          mediation: "optional"
        });

        if (credential) {
          emailInput.value = credential.id || "";
          passwordInput.value = credential.password || "";
          showToast("Credenciales guardadas cargadas correctamente.");
          loginForm.requestSubmit();
          return;
        }
      } catch (error) {
        showToast("No pudimos cargar credenciales guardadas automáticamente.");
      }
    }

    emailInput.focus();
    showToast("Selecciona las credenciales guardadas sugeridas por tu navegador.");
  });
}

/* =========================
   TOAST
========================= */

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(toast.dataset.timeoutId);

  const timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);

  toast.dataset.timeoutId = timeoutId;
}

/* =========================
   HELPERS
========================= */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getCSRFToken() {
  const token = document.querySelector("[name=csrfmiddlewaretoken]");
  return token ? token.value : "";
}
