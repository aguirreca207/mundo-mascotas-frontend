document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = document.querySelectorAll(".category-chip");
  const petFilter = document.getElementById("petFilter");
  const sortFilter = document.getElementById("sortFilter");
  const searchInput = document.getElementById("searchProduct");
  const productGrid = document.getElementById("storeProductsGrid");
  const productCards = Array.from(document.querySelectorAll(".store-product-card"));
  const addCartButtons = document.querySelectorAll(".add-cart-btn");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  let currentCategory = "todos";
  const cart = [];

  function formatCurrency(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);
  }

  function applyFilters() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const petValue = petFilter.value;
    const sortValue = sortFilter.value;

    let visibleCards = [...productCards];

    visibleCards.forEach((card) => {
      const matchesCategory =
        currentCategory === "todos" ||
        card.dataset.category === currentCategory;

      const matchesPet =
        petValue === "todos" ||
        card.dataset.pet === petValue;

      const matchesSearch =
        card.dataset.name.includes(searchValue);

      const shouldShow = matchesCategory && matchesPet && matchesSearch;

      card.classList.toggle("hidden", !shouldShow);
    });

    visibleCards = visibleCards.filter((card) => !card.classList.contains("hidden"));

    if (sortValue !== "default") {
      visibleCards.sort((a, b) => {
        const priceA = Number(a.dataset.price);
        const priceB = Number(b.dataset.price);
        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();

        if (sortValue === "price-asc") return priceA - priceB;
        if (sortValue === "price-desc") return priceB - priceA;
        if (sortValue === "name-asc") return nameA.localeCompare(nameB);
        return 0;
      });

      visibleCards.forEach((card) => productGrid.appendChild(card));
    }
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p class="cart-empty">Aún no has agregado productos al carrito.</p>`;
      cartCount.textContent = "0 productos";
      cartTotal.textContent = "$0";
      return;
    }

    cartItemsContainer.innerHTML = "";

    let total = 0;
    let totalUnits = 0;

    cart.forEach((item) => {
      total += item.price * item.quantity;
      totalUnits += item.quantity;

      const itemElement = document.createElement("article");
      itemElement.className = "cart-item";
      itemElement.innerHTML = `
        <strong>${item.name}</strong>
        <span>Cantidad: ${item.quantity}</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      `;
      cartItemsContainer.appendChild(itemElement);
    });

    cartCount.textContent = `${totalUnits} producto${totalUnits > 1 ? "s" : ""}`;
    cartTotal.textContent = formatCurrency(total);
  }

  function addToCart(name, price) {
    const existingProduct = cart.find((item) => item.name === name);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        name,
        price,
        quantity: 1
      });
    }

    renderCart();
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.dataset.category;
      applyFilters();
    });
  });

  petFilter.addEventListener("change", applyFilters);
  sortFilter.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);

  addCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);
      addToCart(name, price);
    });
  });

  renderCart();
  applyFilters();
});