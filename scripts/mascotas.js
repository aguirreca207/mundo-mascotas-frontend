document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".pet-chip");
  const petCards = document.querySelectorAll(".pet-card");
  const petDetailButtons = document.querySelectorAll(".pet-detail-btn");

  const petName = document.getElementById("petName");
  const petType = document.getElementById("petType");
  const petBreed = document.getElementById("petBreed");
  const petAge = document.getElementById("petAge");
  const petOwner = document.getElementById("petOwner");
  const petVaccine = document.getElementById("petVaccine");
  const petHistory = document.getElementById("petHistory");
  const petStatusLabel = document.getElementById("petStatusLabel");
  const activatePetBtn = document.getElementById("activatePetBtn");
  const petHealthList = document.getElementById("petHealthList");

  let currentFilter = "todos";

  function resetPetButton() {
    activatePetBtn.textContent = "Marcar como activa";
    activatePetBtn.disabled = false;
    activatePetBtn.style.opacity = "1";
  }

  function applyFilter() {
    petCards.forEach((card) => {
      const type = card.dataset.type;
      const shouldShow = currentFilter === "todos" || type === currentFilter;
      card.classList.toggle("hidden", !shouldShow);
    });
  }

  function updatePetSummary({ name, type, breed, age, owner, vaccine, history, status }) {
    petName.textContent = name || "No seleccionado";
    petType.textContent = type || "No aplica";
    petBreed.textContent = breed || "No aplica";
    petAge.textContent = age || "Sin información";
    petOwner.textContent = owner || "Sin información";
    petVaccine.textContent = vaccine || "Sin registro";
    petHistory.textContent = history || "Sin información";
    petStatusLabel.textContent = status || "Sin selección";
    resetPetButton();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      applyFilter();
    });
  });

  petDetailButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updatePetSummary({
      name: button.dataset.name,
      type: button.dataset.type,
      breed: button.dataset.breed,
      age: button.dataset.age,
      owner: button.dataset.owner,
      vaccine: button.dataset.vaccine,
      history: button.dataset.history,
      status: button.dataset.status
    });

    if (window.innerWidth <= 1024) {
      const petPanel = document.getElementById("petPanel");
      petPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

  activatePetBtn.addEventListener("click", () => {
    const nombre = petName.textContent;
    const estado = petStatusLabel.textContent;

    if (nombre === "No seleccionado") {
      alert("Debes seleccionar una mascota antes de continuar.");
      return;
    }

    petStatusLabel.textContent = "Mascota activa";
    activatePetBtn.textContent = "Perfil activo";
    activatePetBtn.disabled = true;
    activatePetBtn.style.opacity = "0.7";

    const newHealthItem = document.createElement("article");
    newHealthItem.className = "pet-health-item";
    newHealthItem.innerHTML = `
      <strong>${nombre}</strong>
      <span>Perfil activo · ${estado}</span>
    `;

    petHealthList.prepend(newHealthItem);

    alert("La mascota fue marcada como activa correctamente.");
  });

  applyFilter();
});