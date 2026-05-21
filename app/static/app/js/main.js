document.addEventListener("DOMContentLoaded", () => {
  initNewsletter();
  initProductsCarousel();
  initPasswordToggles();
  initSavedCredentialsLogin();
});

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

/* =========================
   MOSTRAR / OCULTAR CONTRASEÑA
========================= */

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);
      const icon = button.querySelector(".material-symbols-outlined");

      if (!input) return;

      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");

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
