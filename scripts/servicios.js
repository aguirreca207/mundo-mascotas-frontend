document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".service-chip");
  const serviceCards = document.querySelectorAll(".service-card");
  const serviceButtons = document.querySelectorAll(".service-action-btn");
  const walkerButtons = document.querySelectorAll(".walker-btn");

  const summaryService = document.getElementById("summaryService");
  const summaryPet = document.getElementById("summaryPet");
  const summaryTime = document.getElementById("summaryTime");
  const summaryWalker = document.getElementById("summaryWalker");
  const bookingStatusLabel = document.getElementById("bookingStatusLabel");

  let currentFilter = "todos";

  function applyFilter() {
    serviceCards.forEach((card) => {
      const group = card.dataset.group;
      const shouldShow = currentFilter === "todos" || group === currentFilter;
      card.classList.toggle("hidden", !shouldShow);
    });
  }
function resetConfirmButton() {
  confirmBtn.textContent = "Confirmar reserva";
  confirmBtn.disabled = false;
  confirmBtn.style.opacity = "1";
}
  function updateSummary({ service, pet, time, status, walker }) {
  summaryService.textContent = service || "No seleccionado";
  summaryPet.textContent = pet || "No seleccionada";
  summaryTime.textContent = time || "Sin horario";
  summaryWalker.textContent = walker || "No aplica";
  bookingStatusLabel.textContent = status || "Sin selección";
  resetConfirmButton();
}

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      applyFilter();
    });
  });

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSummary({
        service: button.dataset.service,
        pet: button.dataset.pet,
        time: button.dataset.time,
        status: button.dataset.status,
        walker: "No aplica"
      });
    });
  });

  walkerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSummary({
        service: button.dataset.service,
        pet: button.dataset.pet,
        time: button.dataset.time,
        status: button.dataset.status,
        walker: button.dataset.walker
      });
    });
  });

  const reservationList = document.getElementById("reservationList");

  applyFilter();

  const confirmBtn = document.getElementById("confirmBookingBtn");

confirmBtn.addEventListener("click", () => {
  const servicio = summaryService.textContent;
  const mascota = summaryPet.textContent;
  const horario = summaryTime.textContent;
  const paseador = summaryWalker.textContent;

  if (servicio === "No seleccionado") {
    alert("Debes seleccionar un servicio antes de confirmar.");
    return;
  }

  bookingStatusLabel.textContent = "Confirmada";
  confirmBtn.textContent = "Reserva confirmada";
  confirmBtn.disabled = true;
  confirmBtn.style.opacity = "0.7";

  const newReservation = document.createElement("article");
  newReservation.className = "reservation-item";

  let detalle = `Confirmada · ${horario}`;
  if (paseador !== "No aplica") {
    detalle += ` · ${paseador}`;
  }

  newReservation.innerHTML = `
    <strong>${servicio} - ${mascota}</strong>
    <span>${detalle}</span>
  `;

  reservationList.prepend(newReservation);

  alert("Tu reserva fue confirmada correctamente.");

  });
});

