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
  const productDetailModal = document.getElementById("productDetailModal");
  const detailProductButtons = document.querySelectorAll(".detail-product-btn");
  const productDetailMedia = document.getElementById("productDetailMedia");
  const productDetailCategory = document.getElementById("productDetailCategory");
  const productDetailTitle = document.getElementById("productDetailTitle");
  const productDetailDescription = document.getElementById("productDetailDescription");
  const productDetailPet = document.getElementById("productDetailPet");
  const productDetailStock = document.getElementById("productDetailStock");
  const productDetailPrice = document.getElementById("productDetailPrice");
  const productDetailQuantity = document.getElementById("productDetailQuantity");
  const productDetailAddBtn = document.getElementById("productDetailAddBtn");
  const productQtyMinus = document.getElementById("productQtyMinus");
  const productQtyPlus = document.getElementById("productQtyPlus");

  let currentCategory = "todos";
  let currentDetailProduct = null;
  const cart = [];

  function getCsrfToken() {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

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

  function applySearchFromUrl() {
    if (!searchInput) return;

    const params = new URLSearchParams(window.location.search);
    const searchValue = params.get("buscar") || params.get("q") || "";

    if (!searchValue) return;

    searchInput.value = searchValue;
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
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

  function addToCart({ id, name, price, stock }) {
    const existingProduct = cart.find((item) => item.id === id);

    if (existingProduct) {
      if (existingProduct.quantity >= stock) {
        showStoreNotice(`No hay más stock disponible para ${name}.`, "error");
        return;
      }
      existingProduct.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        stock,
        quantity: 1
      });
    }

    renderCart();
    showStoreNotice(`${name} agregado al carrito.`);
  }

  function addManyToCart(product, quantity) {
    for (let index = 0; index < quantity; index += 1) {
      const existingProduct = cart.find((item) => item.id === product.id);

      if (existingProduct && existingProduct.quantity >= product.stock) {
        showStoreNotice(`No hay más stock disponible para ${product.name}.`, "error");
        return;
      }

      addToCart(product);
    }
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

  function getProductDataFromCard(card) {
    return {
      id: card.querySelector(".add-cart-btn")?.dataset.id,
      name: card.dataset.title || card.querySelector("h3")?.textContent.trim(),
      description: card.dataset.description || "",
      category: card.dataset.categoryLabel || "Producto",
      pet: card.dataset.petLabel || "Mascotas",
      price: Number(card.dataset.price || 0),
      stock: Number(card.dataset.stock || 0),
      image: card.dataset.image || ""
    };
  }

  function syncDetailQuantity() {
    if (!currentDetailProduct || !productDetailQuantity) return;

    const value = Math.max(1, Math.min(Number(productDetailQuantity.value || 1), currentDetailProduct.stock));
    productDetailQuantity.value = value;
  }

  function openProductDetail(product) {
    if (!productDetailModal) return;

    currentDetailProduct = product;

    if (productDetailMedia) {
      productDetailMedia.innerHTML = product.image
        ? `<img src="${product.image}" alt="${product.name}">`
        : `<span class="material-symbols-outlined">shopping_bag</span>`;
    }

    if (productDetailCategory) productDetailCategory.textContent = product.category;
    if (productDetailTitle) productDetailTitle.textContent = product.name;
    if (productDetailDescription) productDetailDescription.textContent = product.description;
    if (productDetailPet) productDetailPet.textContent = product.pet;
    if (productDetailStock) productDetailStock.textContent = product.stock > 0 ? `Stock disponible: ${product.stock}` : "Sin stock";
    if (productDetailPrice) productDetailPrice.textContent = formatCurrency(product.price);
    if (productDetailQuantity) {
      productDetailQuantity.max = product.stock;
      productDetailQuantity.value = 1;
    }

    productDetailModal.classList.add("is-open");
    productDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeProductDetail() {
    if (!productDetailModal) return;

    productDetailModal.classList.remove("is-open");
    productDetailModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    currentDetailProduct = null;
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
        price: Number(button.dataset.price),
        stock: Number(button.dataset.stock)
      });
    });
  });

  detailProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".store-product-card");
      if (!card) return;

      openProductDetail(getProductDataFromCard(card));
    });
  });

  document.querySelectorAll("[data-close-product-modal]").forEach((button) => {
    button.addEventListener("click", closeProductDetail);
  });

  if (productDetailQuantity) {
    productDetailQuantity.addEventListener("input", syncDetailQuantity);
  }

  if (productQtyMinus) {
    productQtyMinus.addEventListener("click", () => {
      if (!productDetailQuantity) return;
      productDetailQuantity.value = Math.max(1, Number(productDetailQuantity.value || 1) - 1);
    });
  }

  if (productQtyPlus) {
    productQtyPlus.addEventListener("click", () => {
      if (!productDetailQuantity || !currentDetailProduct) return;
      productDetailQuantity.value = Math.min(currentDetailProduct.stock, Number(productDetailQuantity.value || 1) + 1);
    });
  }

  if (productDetailAddBtn) {
    productDetailAddBtn.addEventListener("click", () => {
      if (!currentDetailProduct || !productDetailQuantity) return;

      syncDetailQuantity();
      addManyToCart(currentDetailProduct, Number(productDetailQuantity.value || 1));
      closeProductDetail();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProductDetail();
  });

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".remove-cart-btn");

      if (!removeButton) return;

      removeFromCart(removeButton.dataset.id);
    });
  }

  if (finishOrderBtn) {
    finishOrderBtn.addEventListener("click", async () => {
      if (cart.length === 0) {
        showStoreNotice("Agrega al menos un producto antes de finalizar.", "error");
        return;
      }

      let data;

      try {
        const response = await fetch(finishOrderBtn.dataset.createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              id: item.id,
              quantity: item.quantity
            }))
          })
        });

        data = await response.json();

        if (!response.ok) {
          showStoreNotice(data.message || "No se pudo confirmar el pedido.", "error");
          return;
        }
      } catch (error) {
        showStoreNotice("No se pudo conectar con el servidor.", "error");
        return;
      }

      if (ordersList) {
        const emptyMessage = ordersList.querySelector(".order-empty");
        if (emptyMessage) emptyMessage.remove();

        const orderElement = document.createElement("article");
        orderElement.className = "order-status-item order-status-pendiente";
        orderElement.innerHTML = `
          <strong>Pedido #${data.order.id}</strong>
          <span>${data.order.status} · ${formatCurrency(data.order.total)}</span>
          <small>El administrador revisará tu pedido.</small>
        `;

        ordersList.prepend(orderElement);
      }

      cart.splice(0, cart.length);
      renderCart();

      showStoreNotice(data.message || "Pedido confirmado correctamente.");

      setTimeout(() => {
        window.location.reload();
      }, 900);
    });
  }

  renderCart();
  applySearchFromUrl();
  applyFilters();
});
