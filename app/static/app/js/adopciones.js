document.addEventListener("DOMContentLoaded", () => {
  const adoptionForm = document.querySelector(".adoption-form");
  const submitButton = document.querySelector(".adoption-submit-btn");
  const photoInput = document.getElementById("adoptionPhoto");
  const phoneInput = document.getElementById("adoptionPhone");

  function showAdoptionNotice(message, type = "success") {
    let notice = document.querySelector(".adoption-notice");

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "adoption-notice";
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.className = `adoption-notice ${type} is-visible`;

    setTimeout(() => {
      notice.classList.remove("is-visible");
    }, 2600);
  }

  function getRequiredFields() {
    return [
      document.getElementById("adoptionName"),
      document.getElementById("adoptionType"),
      document.getElementById("adoptionAge"),
      document.getElementById("adoptionSize"),
      document.getElementById("adoptionCity"),
      document.getElementById("adoptionPhone"),
      document.getElementById("adoptionDescription"),
      document.getElementById("adoptionRequirements"),
      document.getElementById("adoptionPhoto")
    ];
  }

  function clearErrors() {
    getRequiredFields().forEach((field) => {
      if (field) field.classList.remove("has-adoption-error");
    });
  }

  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];

      if (file && !file.type.startsWith("image/")) {
        photoInput.value = "";
        showAdoptionNotice("Selecciona una imagen válida.", "error");
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      phoneInput.classList.remove("has-adoption-error");
    });
  }

  if (adoptionForm) {
    adoptionForm.addEventListener("submit", (event) => {
      clearErrors();

      let isValid = true;

      getRequiredFields().forEach((field) => {
        if (!field) return;

        const hasValue =
          field.type === "file" ? field.files.length > 0 : field.value.trim();

        if (!hasValue) {
          field.classList.add("has-adoption-error");
          isValid = false;
        }
      });

      if (phoneInput && !/^\d{7,10}$/.test(phoneInput.value.trim())) {
        phoneInput.classList.add("has-adoption-error");
        isValid = false;
        showAdoptionNotice("Ingresa un teléfono válido, solo con números.", "error");
      }

      if (!isValid) {
        event.preventDefault();
        showAdoptionNotice("Completa todos los campos antes de enviar.", "error");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Enviando solicitud...";
      }
    });
  }
});
