document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicio cargado correctamente");
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

    productsPrev.disabled = currentPage === 0;
    productsNext.disabled = currentPage === totalPages - 1;
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