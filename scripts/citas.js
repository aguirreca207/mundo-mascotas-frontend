document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".appointment-chip");
  const appointmentCards = document.querySelectorAll(".appointment-card");
  const appointmentDetailButtons = document.querySelectorAll(".appointment-detail-btn");

  const appointmentPet = document.getElementById("appointmentPet");
  const appointmentDate = document.getElementById("appointmentDate");
  const appointmentTime = document.getElementById("appointmentTime");
  const appointmentReason = document.getElementById("appointmentReason");
  const appointmentVet = document.getElementById("appointmentVet");
  const appointmentSpecialty = document.getElementById("appointmentSpecialty");
  const appointmentClinical = document.getElementById("appointmentClinical");
  const appointmentTreatment = document.getElementById("appointmentTreatment");
  const appointmentStatusLabel = document.getElementById("appointmentStatusLabel");
  const confirmAppointmentBtn = document.getElementById("confirmAppointmentBtn");
  const appointmentsHistoryList = document.getElementById("appointmentsHistoryList");

  let currentFilter = "todos";

  function resetAppointmentButton() {
    confirmAppointmentBtn.textContent = "Confirmar seguimiento";
    confirmAppointmentBtn.disabled = false;
    confirmAppointmentBtn.style.opacity = "1";
  }

  function applyFilter() {
    appointmentCards.forEach((card) => {
      const status = card.dataset.status;
      const shouldShow = currentFilter === "todos" || status === currentFilter;
      card.classList.toggle("hidden", !shouldShow);
    });
  }

  function updateAppointmentSummary({
    pet,
    date,
    time,
    reason,
    vet,
    specialty,
    status,
    clinical,
    treatment
  }) {
    appointmentPet.textContent = pet || "No seleccionada";
    appointmentDate.textContent = date || "Sin información";
    appointmentTime.textContent = time || "Sin información";
    appointmentReason.textContent = reason || "Sin información";
    appointmentVet.textContent = vet || "Sin información";
    appointmentSpecialty.textContent = specialty || "Sin información";
    appointmentClinical.textContent = clinical || "Sin información";
    appointmentTreatment.textContent = treatment || "Sin información";
    appointmentStatusLabel.textContent = status || "Sin selección";
    resetAppointmentButton();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      applyFilter();
    });
  });

  appointmentDetailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateAppointmentSummary({
        pet: button.dataset.pet,
        date: button.dataset.date,
        time: button.dataset.time,
        reason: button.dataset.reason,
        vet: button.dataset.vet,
        specialty: button.dataset.specialty,
        status: button.dataset.status,
        clinical: button.dataset.clinical,
        treatment: button.dataset.treatment
      });

      if (window.innerWidth <= 1024) {
        const appointmentPanel = document.getElementById("appointmentPanel");
        appointmentPanel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  confirmAppointmentBtn.addEventListener("click", () => {
    const mascota = appointmentPet.textContent;
    const diagnostico = appointmentClinical.textContent;
    const tratamiento = appointmentTreatment.textContent;

    if (mascota === "No seleccionada") {
      alert("Debes seleccionar una cita antes de continuar.");
      return;
    }

    appointmentStatusLabel.textContent = "Seguimiento confirmado";
    confirmAppointmentBtn.textContent = "Seguimiento registrado";
    confirmAppointmentBtn.disabled = true;
    confirmAppointmentBtn.style.opacity = "0.7";

    const newHistoryItem = document.createElement("article");
    newHistoryItem.className = "appointments-history-item";
    newHistoryItem.innerHTML = `
      <strong>${mascota}</strong>
      <span>${diagnostico} · ${tratamiento}</span>
    `;

    appointmentsHistoryList.prepend(newHistoryItem);

    alert("El seguimiento de la cita fue registrado correctamente.");
  });

  applyFilter();
});