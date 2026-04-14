document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".adoption-chip");
  const adoptionCards = document.querySelectorAll(".adoption-card");
  const adoptButtons = document.querySelectorAll(".adopt-btn");

  const adoptionPetName = document.getElementById("adoptionPetName");
  const adoptionPetType = document.getElementById("adoptionPetType");
  const adoptionPetStatus = document.getElementById("adoptionPetStatus");
  const adoptionPetDescription = document.getElementById("adoptionPetDescription");
  const adoptionStatusLabel = document.getElementById("adoptionStatusLabel");
  const confirmAdoptionBtn = document.getElementById("confirmAdoptionBtn");
  const adoptionRequestList = document.getElementById("adoptionRequestList");

  let currentFilter = "todos";

  function resetAdoptionButton() {
    confirmAdoptionBtn.textContent = "Confirmar solicitud";
    confirmAdoptionBtn.disabled = false;
    confirmAdoptionBtn.style.opacity = "1";
  }

  function applyFilter() {
    adoptionCards.forEach((card) => {
      const type = card.dataset.type;
      const shouldShow = currentFilter === "todos" || type === currentFilter;
      card.classList.toggle("hidden", !shouldShow);
    });
  }

  function updateAdoptionSummary({ name, type, status, description }) {
    adoptionPetName.textContent = name || "No seleccionada";
    adoptionPetType.textContent = type || "No aplica";
    adoptionPetStatus.textContent = status || "Sin solicitud";
    adoptionPetDescription.textContent = description || "Sin información";
    adoptionStatusLabel.textContent = status || "Sin selección";
    resetAdoptionButton();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      applyFilter();
    });
  });

  adoptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateAdoptionSummary({
        name: button.dataset.name,
        type: button.dataset.type,
        status: button.dataset.status,
        description: button.dataset.description
      });
    });
  });

  confirmAdoptionBtn.addEventListener("click", () => {
    const mascota = adoptionPetName.textContent;
    const tipo = adoptionPetType.textContent;

    if (mascota === "No seleccionada") {
      alert("Debes seleccionar una mascota antes de confirmar la solicitud.");
      return;
    }

    adoptionPetStatus.textContent = "Confirmada";
    adoptionStatusLabel.textContent = "Confirmada";

    confirmAdoptionBtn.textContent = "Solicitud confirmada";
    confirmAdoptionBtn.disabled = true;
    confirmAdoptionBtn.style.opacity = "0.7";

    const newRequest = document.createElement("article");
    newRequest.className = "adoption-request-item";
    newRequest.innerHTML = `
      <strong>${mascota} - Usuario interesado</strong>
      <span>Confirmada · ${tipo}</span>
    `;

    adoptionRequestList.prepend(newRequest);

    alert("Tu solicitud de adopción fue registrada correctamente.");
  });

  applyFilter();
});