document.addEventListener("DOMContentLoaded", () => {
  initNewsletter();
  initProductsCarousel();
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