document.addEventListener("DOMContentLoaded", () => {
  const appointmentForm = document.getElementById("appointmentForm");
  const petSelect = document.getElementById("appointmentPetSelect");
  const reasonSelect = document.getElementById("appointmentReasonSelect");
  const dateInput = document.getElementById("appointmentDateInput");
  const timeSelect = document.getElementById("appointmentTimeSelect");
  const notesInput = document.getElementById("appointmentNotesInput");

  const summaryPet = document.getElementById("summaryPet");
  const summaryReason = document.getElementById("summaryReason");
  const summaryDate = document.getElementById("summaryDate");
  const summaryTime = document.getElementById("summaryTime");
  const statusLabel = document.getElementById("appointmentStatusLabel");

  const appointmentsList = document.getElementById("appointmentsList");
  const emptyState = document.getElementById("appointmentsEmptyState");

  function showAppointmentNotice(message, type = "success") {
    let notice = document.querySelector(".appointment-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "appointment-notice";
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.className = `appointment-notice ${type} active`;

    setTimeout(() => {
      notice.classList.remove("active");
    }, 2600);
  }

  function formatDate(value) {
    if (!value) return "Sin fecha";

    const date = new Date(`${value}T00:00:00`);

    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function updateSummary() {
    if (summaryPet) summaryPet.textContent = petSelect.value || "No seleccionada";
    if (summaryReason) summaryReason.textContent = reasonSelect.value || "Sin información";
    if (summaryDate) summaryDate.textContent = formatDate(dateInput.value);
    if (summaryTime) summaryTime.textContent = timeSelect.value || "Sin jornada";

    if (statusLabel) {
      const hasData = petSelect.value || reasonSelect.value || dateInput.value || timeSelect.value;
      statusLabel.textContent = hasData ? "En preparación" : "Sin completar";
    }
  }

  [petSelect, reasonSelect, dateInput, timeSelect].forEach((field) => {
    if (!field) return;
    field.addEventListener("change", updateSummary);
  });

  if (notesInput) {
    notesInput.addEventListener("input", updateSummary);
  }

  if (appointmentForm) {
    appointmentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!petSelect.value || !reasonSelect.value || !dateInput.value || !timeSelect.value) {
        showAppointmentNotice("Completa mascota, motivo, fecha y jornada.", "error");
        return;
      }

      if (emptyState) {
        emptyState.remove();
      }

      const card = document.createElement("article");
      card.className = "appointment-request-card";

      const formattedDate = formatDate(dateInput.value);
      const notes = notesInput.value.trim();

      card.innerHTML = `
        <div>
          <h3>${petSelect.value} · ${reasonSelect.value}</h3>
          <p>${notes || "Solicitud registrada sin observaciones adicionales."}</p>

          <div class="appointment-request-meta">
            <span>${formattedDate}</span>
            <span>${timeSelect.value}</span>
          </div>
        </div>

        <span class="appointment-request-status">Pendiente de confirmación</span>
      `;

      appointmentsList.prepend(card);

      if (statusLabel) {
        statusLabel.textContent = "Solicitud enviada";
      }

      showAppointmentNotice("Cita solicitada correctamente.");

      appointmentForm.reset();
      updateSummary();

      document.getElementById("upcomingAppointments")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  updateSummary();
});