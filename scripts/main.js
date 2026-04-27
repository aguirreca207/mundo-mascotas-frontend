document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicio cargado correctamente");

  const footerNewsletterForm = document.getElementById("footerNewsletterForm");
  const footerNewsletterEmail = document.getElementById("footerNewsletterEmail");
  const footerNewsletterMessage = document.getElementById("footerNewsletterMessage");

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  if (footerNewsletterForm && footerNewsletterEmail && footerNewsletterMessage) {
    footerNewsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      footerNewsletterMessage.textContent = "";
      footerNewsletterMessage.classList.remove("error", "success");

      if (!footerNewsletterEmail.value.trim()) {
        footerNewsletterMessage.textContent = "Ingresa un correo electrónico.";
        footerNewsletterMessage.classList.add("error");
        return;
      }

      if (!validateEmail(footerNewsletterEmail.value)) {
        footerNewsletterMessage.textContent = "Ingresa un correo válido.";
        footerNewsletterMessage.classList.add("error");
        return;
      }

      footerNewsletterMessage.textContent = "¡Suscripción registrada correctamente!";
      footerNewsletterMessage.classList.add("success");

      footerNewsletterForm.reset();
    });
  }
});
const productsTrack = document.getElementById("productsTrack");
const productsPrev = document.getElementById("productsPrev");
const productsNext = document.getElementById("productsNext");

if (productsTrack && productsPrev && productsNext) {
  let currentPage = 0;
  const totalPages = 2;

  function updateProductsCarousel() {
    const viewport = productsTrack.parentElement;
    const viewportWidth = viewport.offsetWidth;
    productsTrack.style.transform = `translateX(-${currentPage * viewportWidth}px)`;

    productsPrev.style.display = currentPage === 0 ? "none" : "grid";
    productsNext.style.display = currentPage === totalPages - 1 ? "none" : "grid";
  }

  productsNext.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateProductsCarousel();
    }
  });

  productsPrev.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      updateProductsCarousel();
    }
  });

  window.addEventListener("resize", updateProductsCarousel);

  updateProductsCarousel();
}