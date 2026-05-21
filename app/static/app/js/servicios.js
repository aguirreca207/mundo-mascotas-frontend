document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".service-chip");
  const serviceCards = document.querySelectorAll(".service-card");
  const serviceButtons = document.querySelectorAll(".service-action-btn");
  const walkerButtons = document.querySelectorAll(".walker-btn");
  const reservationList = document.getElementById("reservationList");
  const confirmBtn = document.getElementById("confirmBookingBtn");
  const petSelect = document.getElementById("servicePetSelect");
  const timeSelect = document.getElementById("serviceTimeSelect");

  const summaryService = document.getElementById("summaryService");
  const summaryPet = document.getElementById("summaryPet");
  const summaryTime = document.getElementById("summaryTime");
  const summaryWalker = document.getElementById("summaryWalker");
  const bookingStatusLabel = document.getElementById("bookingStatusLabel");

  let currentFilter = "todos";

  function showServiceNotice(message, type = "success") {
    let notice = document.querySelector(".service-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "service-notice";
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.className = `service-notice ${type} active`;

    setTimeout(() => {
      notice.classList.remove("active");
    }, 2600);
  }

  function resetConfirmButton() {
    if (!confirmBtn) return;

    confirmBtn.textContent = "Confirmar reserva";
    confirmBtn.disabled = false;
    confirmBtn.classList.remove("is-confirmed");
  }

  function applyFilter() {
    serviceCards.forEach((card) => {
      const group = card.dataset.group;
      const shouldShow = currentFilter === "todos" || group === currentFilter;
      card.classList.toggle("hidden", !shouldShow);
    });
  }

  function focusBookingField(field) {
    if (!field) return;

    field.focus();
    field.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function getSelectedBookingData() {
    const pet = petSelect?.value.trim() || "";
    const time = timeSelect?.value.trim() || "";

    if (!pet) {
      showServiceNotice("Selecciona una mascota registrada para continuar.", "error");
      focusBookingField(petSelect);
      return null;
    }

    if (!time) {
      showServiceNotice("Selecciona una jornada preferida para continuar.", "error");
      focusBookingField(timeSelect);
      return null;
    }

    return { pet, time };
  }

  function updateSummary({ service, pet, time, status, walker }) {
    if (summaryService) summaryService.textContent = service || "No seleccionado";
    if (summaryPet) summaryPet.textContent = pet || "No seleccionada";
    if (summaryTime) summaryTime.textContent = time || "Sin horario";
    if (summaryWalker) summaryWalker.textContent = walker || "No aplica";
    if (bookingStatusLabel) bookingStatusLabel.textContent = status || "Sin selección";

    resetConfirmButton();
    showServiceNotice("Solicitud agregada al resumen. Revisa y confirma.");
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      currentFilter = button.dataset.filter || "todos";
      applyFilter();
    });
  });

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const bookingData = getSelectedBookingData();

      if (!bookingData) return;

      updateSummary({
        service: button.dataset.service,
        pet: bookingData.pet,
        time: bookingData.time,
        status: button.dataset.status,
        walker: "No aplica"
      });
    });
  });

  walkerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const bookingData = getSelectedBookingData();

      if (!bookingData) return;

      updateSummary({
        service: button.dataset.service,
        pet: bookingData.pet,
        time: bookingData.time,
        status: button.dataset.status,
        walker: button.dataset.walker
      });
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const servicio = summaryService?.textContent || "No seleccionado";
      const mascota = summaryPet?.textContent || "No seleccionada";
      const horario = summaryTime?.textContent || "Sin horario";
      const paseador = summaryWalker?.textContent || "No aplica";

      if (servicio === "No seleccionado") {
        showServiceNotice("Selecciona un servicio antes de confirmar.", "error");
        return;
      }

      if (bookingStatusLabel) bookingStatusLabel.textContent = "Confirmada";

      confirmBtn.textContent = "Reserva confirmada";
      confirmBtn.disabled = true;
      confirmBtn.classList.add("is-confirmed");

      if (reservationList) {
        reservationList.querySelector(".reservation-empty")?.remove();

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
      }

      showServiceNotice("Reserva confirmada correctamente.");
    });
  }

  applyFilter();
});
