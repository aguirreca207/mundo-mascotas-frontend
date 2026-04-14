document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportAdoptionForm");

  const reporterName = document.getElementById("reporterName");
  const reporterEmail = document.getElementById("reporterEmail");
  const reporterPhone = document.getElementById("reporterPhone");
  const reporterCity = document.getElementById("reporterCity");

  const petName = document.getElementById("petName");
  const petSpecies = document.getElementById("petSpecies");
  const petBreed = document.getElementById("petBreed");
  const petAge = document.getElementById("petAge");
  const petSex = document.getElementById("petSex");
  const petVaccines = document.getElementById("petVaccines");
  const petDescription = document.getElementById("petDescription");

  const summaryReporter = document.getElementById("summaryReporter");
  const summaryEmail = document.getElementById("summaryEmail");
  const summaryPet = document.getElementById("summaryPet");
  const summarySpecies = document.getElementById("summarySpecies");
  const summaryStatus = document.getElementById("summaryStatus");

  const reportSuccessCard = document.getElementById("reportSuccessCard");

  const requiredFields = [
    reporterName,
    reporterEmail,
    reporterPhone,
    reporterCity,
    petName,
    petSpecies,
    petBreed,
    petAge,
    petSex,
    petVaccines,
    petDescription
  ];

  function setError(input, message) {
    const group = input.closest(".form-group");
    const errorText = group.querySelector(".error-text");
    group.classList.add("has-error");
    if (errorText) errorText.textContent = message;
  }

  function clearError(input) {
    const group = input.closest(".form-group");
    const errorText = group.querySelector(".error-text");
    group.classList.remove("has-error");
    if (errorText) errorText.textContent = "";
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function updateSummary() {
    summaryReporter.textContent = reporterName.value.trim() || "Sin información";
    summaryEmail.textContent = reporterEmail.value.trim() || "Sin información";
    summaryPet.textContent = petName.value.trim() || "Sin información";
    summarySpecies.textContent = petSpecies.value || "Sin información";
  }

  requiredFields.forEach((field) => {
    field.addEventListener("input", updateSummary);
    field.addEventListener("change", updateSummary);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    requiredFields.forEach((field) => {
      clearError(field);

      if (!field.value.trim()) {
        setError(field, "Este campo es obligatorio.");
        isValid = false;
      }
    });

    if (reporterEmail.value.trim() && !validateEmail(reporterEmail.value)) {
      setError(reporterEmail, "Ingresa un correo válido.");
      isValid = false;
    }

    if (!isValid) {
      summaryStatus.textContent = "Formulario incompleto";
      return;
    }

    summaryReporter.textContent = reporterName.value.trim();
    summaryEmail.textContent = reporterEmail.value.trim();
    summaryPet.textContent = petName.value.trim();
    summarySpecies.textContent = petSpecies.value;
    summaryStatus.textContent = "Reporte enviado";

    reportSuccessCard.classList.add("active");

    if (window.innerWidth <= 1024) {
      const reportInfoPanel = document.getElementById("reportInfoPanel");
      reportInfoPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    form.reset();

    setTimeout(() => {
      summaryReporter.textContent = "Sin información";
      summaryEmail.textContent = "Sin información";
      summaryPet.textContent = "Sin información";
      summarySpecies.textContent = "Sin información";
      summaryStatus.textContent = "Pendiente de revisión";
    }, 1500);
  });
});