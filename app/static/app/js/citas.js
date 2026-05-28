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

  function getCsrfToken() {
    return appointmentForm?.querySelector("[name=csrfmiddlewaretoken]")?.value || "";
  }

  function getSelectedPetName() {
    const option = petSelect?.selectedOptions?.[0];
    return option?.dataset.name || option?.textContent || "";
  }

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
    if (summaryPet) summaryPet.textContent = getSelectedPetName() || "No seleccionada";
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
    appointmentForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!petSelect.value || !reasonSelect.value || !dateInput.value || !timeSelect.value) {
        showAppointmentNotice("Completa mascota, motivo, fecha y jornada.", "error");
        return;
      }

      const selectedDate = new Date(`${dateInput.value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        showAppointmentNotice("La cita no puede programarse en una fecha pasada.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("pet_id", petSelect.value);
      formData.append("reason", reasonSelect.value);
      formData.append("date", dateInput.value);
      formData.append("time", timeSelect.value);
      formData.append("notes", notesInput.value.trim());

      let data;

      try {
        const response = await fetch(appointmentForm.dataset.createUrl, {
          method: "POST",
          headers: {
            "X-CSRFToken": getCsrfToken()
          },
          body: formData
        });

        data = await response.json();

        if (!response.ok) {
          showAppointmentNotice(data.message || "No se pudo guardar la cita.", "error");
          return;
        }
      } catch (error) {
        showAppointmentNotice("No se pudo conectar con el servidor.", "error");
        return;
      }

      if (emptyState) {
        emptyState.remove();
      }

      const card = document.createElement("article");
      card.className = "appointment-request-card";

      const appointment = data.appointment;
      const formattedDate = formatDate(appointment.date);
      const notes = appointment.notes;

      card.innerHTML = `
        <div>
          <h3>${appointment.pet} · ${appointment.reason}</h3>
          <p>${notes || "Solicitud registrada sin observaciones adicionales."}</p>

          <div class="appointment-request-meta">
            <span>${formattedDate}</span>
            <span>${appointment.time}</span>
          </div>
        </div>

        <span class="appointment-request-status">${appointment.status}</span>
      `;

      appointmentsList.prepend(card);

      if (statusLabel) {
        statusLabel.textContent = "Solicitud enviada";
      }

      showAppointmentNotice(data.message || "Cita solicitada correctamente.");

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
