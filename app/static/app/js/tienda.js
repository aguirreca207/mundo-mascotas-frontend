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
  const finishOrderBtn = document.getElementById("finishOrderBtn");
  const ordersList = document.getElementById("ordersList");

  let currentCategory = "todos";
  const cart = [];

  function showStoreNotice(message, type = "success") {
    let notice = document.querySelector(".store-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "store-notice";
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.className = `store-notice ${type} is-visible`;

    setTimeout(() => {
      notice.classList.remove("is-visible");
    }, 2400);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);
  }

  function applyFilters() {
    if (!productGrid) return;

    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const petValue = petFilter ? petFilter.value : "todos";
    const sortValue = sortFilter ? sortFilter.value : "default";

    let visibleCards = [...productCards];

    productCards.forEach((card) => {
      const cardCategory = card.dataset.category;
      const cardPet = card.dataset.pet;
      const cardName = card.dataset.name || "";

      const matchesCategory =
        currentCategory === "todos" || cardCategory === currentCategory;

      const matchesPet =
        petValue === "todos" || cardPet === petValue || cardPet === "ambos";

      const matchesSearch = cardName.includes(searchValue);

      card.classList.toggle("hidden", !(matchesCategory && matchesPet && matchesSearch));
    });

    visibleCards = visibleCards.filter((card) => !card.classList.contains("hidden"));

    if (sortValue !== "default") {
      visibleCards.sort((a, b) => {
        const priceA = Number(a.dataset.price);
        const priceB = Number(b.dataset.price);
        const nameA = (a.dataset.name || "").toLowerCase();
        const nameB = (b.dataset.name || "").toLowerCase();

        if (sortValue === "price-asc") return priceA - priceB;
        if (sortValue === "price-desc") return priceB - priceA;
        if (sortValue === "name-asc") return nameA.localeCompare(nameB);

        return 0;
      });

      visibleCards.forEach((card) => productGrid.appendChild(card));
    }
  }

  function getCartTotals() {
    return cart.reduce(
      (summary, item) => {
        summary.units += item.quantity;
        summary.total += item.price * item.quantity;
        return summary;
      },
      { units: 0, total: 0 }
    );
  }

  function renderCart() {
    if (!cartItemsContainer || !cartCount || !cartTotal) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <p class="cart-empty">Aún no has agregado productos al carrito.</p>
      `;
      cartCount.textContent = "0 productos";
      cartTotal.textContent = "$0";
      return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach((item) => {
      const itemElement = document.createElement("article");
      itemElement.className = "cart-item";

      itemElement.innerHTML = `
        <div class="cart-item-top">
          <div>
            <strong>${item.name}</strong>
            <span>Cantidad: ${item.quantity}</span>
          </div>

          <button
            type="button"
            class="remove-cart-btn"
            data-id="${item.id}"
            aria-label="Quitar ${item.name}"
          >
            ×
          </button>
        </div>

        <span>${formatCurrency(item.price * item.quantity)}</span>
      `;

      cartItemsContainer.appendChild(itemElement);
    });

    const totals = getCartTotals();

    cartCount.textContent = `${totals.units} producto${totals.units !== 1 ? "s" : ""}`;
    cartTotal.textContent = formatCurrency(totals.total);
  }

  function addToCart({ id, name, price }) {
    const existingProduct = cart.find((item) => item.id === id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        quantity: 1
      });
    }

    renderCart();
    showStoreNotice(`${name} agregado al carrito.`);
  }

  function removeFromCart(productId) {
    const productIndex = cart.findIndex((item) => item.id === productId);

    if (productIndex === -1) return;

    const product = cart[productIndex];

    if (product.quantity > 1) {
      product.quantity -= 1;
    } else {
      cart.splice(productIndex, 1);
    }

    renderCart();
    showStoreNotice("Producto eliminado del carrito.");
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.dataset.category;
      applyFilters();
    });
  });

  if (petFilter) {
    petFilter.addEventListener("change", applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  addCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      addToCart({
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price)
      });
    });
  });

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".remove-cart-btn");

      if (!removeButton) return;

      removeFromCart(removeButton.dataset.id);
    });
  }

  if (finishOrderBtn) {
    finishOrderBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        showStoreNotice("Agrega al menos un producto antes de finalizar.", "error");
        return;
      }

      const totals = getCartTotals();
      const orderCode = `MM-${Date.now().toString().slice(-5)}`;

      if (ordersList) {
        const emptyMessage = ordersList.querySelector(".order-empty");
        if (emptyMessage) emptyMessage.remove();

        const orderElement = document.createElement("article");
        orderElement.className = "order-status-item";
        orderElement.innerHTML = `
          <strong>Pedido #${orderCode}</strong>
          <span>Confirmado · ${formatCurrency(totals.total)}</span>
        `;

        ordersList.prepend(orderElement);
      }

      cart.splice(0, cart.length);
      renderCart();

      showStoreNotice("Pedido confirmado correctamente.");
    });
  }

  renderCart();
  applyFilters();
});