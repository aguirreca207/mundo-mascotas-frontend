document.addEventListener("DOMContentLoaded", () => {
  const petForm = document.getElementById("petForm");
  const editingPetId = document.getElementById("editingPetId");
  const petNameInput = document.getElementById("petNameInput");
  const petTypeSelect = document.getElementById("petTypeSelect");
  const petBreedInput = document.getElementById("petBreedInput");
  const petBirthInput = document.getElementById("petBirthInput");
  const petVaccineInput = document.getElementById("petVaccineInput");
  const petStatusSelect = document.getElementById("petStatusSelect");
  const petNotesInput = document.getElementById("petNotesInput");
  const petSubmitBtn = document.getElementById("petSubmitBtn");

  const filterButtons = document.querySelectorAll(".pet-chip");
  const petCards = document.querySelectorAll(".pet-card");

  function showPetNotice(message, type = "success") {
    let notice = document.querySelector(".pet-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "pet-notice";
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.className = `pet-notice ${type} active`;

    setTimeout(() => {
      notice.classList.remove("active");
    }, 2600);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentFilter = button.dataset.filter || "todos";

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      petCards.forEach((card) => {
        const type = card.dataset.type;
        const shouldShow = currentFilter === "todos" || type === currentFilter;
        card.classList.toggle("hidden", !shouldShow);
      });
    });
  });

  document.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-action='edit']");

    if (!editButton) return;

    editingPetId.value = editButton.dataset.id;
    petNameInput.value = editButton.dataset.name;
    petTypeSelect.value = editButton.dataset.type;
    petBreedInput.value = editButton.dataset.breed;
    petBirthInput.value = editButton.dataset.birth;
    petVaccineInput.value = editButton.dataset.vaccines;
    petStatusSelect.value = editButton.dataset.status;
    petNotesInput.value = editButton.dataset.notes || "";

    if (petSubmitBtn) {
      petSubmitBtn.textContent = "Guardar cambios";
    }

    document.getElementById("petRegisterForm")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    showPetNotice("Edita los datos y guarda los cambios.");
  });

  if (petForm) {
    petForm.addEventListener("submit", (event) => {
      if (
        !petNameInput.value.trim() ||
        !petTypeSelect.value ||
        !petBreedInput.value.trim() ||
        !petBirthInput.value ||
        !petVaccineInput.value.trim() ||
        !petStatusSelect.value
      ) {
        event.preventDefault();
        showPetNotice("Completa los datos principales de tu mascota.", "error");
      }
    });
  }
});