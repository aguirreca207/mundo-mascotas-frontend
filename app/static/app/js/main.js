document.addEventListener("DOMContentLoaded", function () {

  console.log("JS cargado correctamente");

  /* =========================
     🔔 NEWSLETTER
  ========================= */

  const form = document.getElementById("newsletterForm");

  if (form) {

    form.addEventListener("submit", function(e) {
      e.preventDefault(); // 🔥 evita recarga y salto SIEMPRE

      const email = form.querySelector("input[name='email']").value.trim();
      const pet = form.querySelector("select[name='pet_type']").value;

      // VALIDACIONES
      if (!email) {
        showToast("Debes ingresar un correo");
        return;
      }

      if (!validateEmail(email)) {
        showToast("Correo inválido");
        return;
      }

      fetch("/newsletter/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({
          email: email,
          pet_type: pet
        })
      })
      .then(res => res.json())
      .then(data => {
        showToast(data.message || "Suscripción exitosa");
        form.reset();
      })
      .catch(() => {
        showToast("Error al enviar. Intenta nuevamente.");
      });

    });
  }


  /* =========================
     🎯 CARRUSEL PRODUCTOS
  ========================= */

  const track = document.getElementById("productsTrack");
  const prevBtn = document.getElementById("productsPrev");
  const nextBtn = document.getElementById("productsNext");

  if (track && prevBtn && nextBtn) {

    let currentPage = 0;
    const pages = document.querySelectorAll(".products-page");
    const totalPages = pages.length;

    function updateCarousel() {
      const viewport = track.parentElement;
      const width = viewport.clientWidth;

      track.style.transform = `translateX(-${currentPage * width}px)`;

      prevBtn.style.display = currentPage === 0 ? "none" : "flex";
      nextBtn.style.display = currentPage === totalPages - 1 ? "none" : "flex";
    }

    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener("click", () => {
      if (currentPage > 0) {
        currentPage--;
        updateCarousel();
      }
    });

    window.addEventListener("resize", updateCarousel);

    updateCarousel();
  }

});


/* =========================
   🔔 TOAST
========================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


/* =========================
   📧 VALIDACIÓN EMAIL
========================= */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* =========================
   🔐 CSRF TOKEN DJANGO
========================= */
function getCSRFToken() {
  const token = document.querySelector('[name=csrfmiddlewaretoken]');
  return token ? token.value : "";
}