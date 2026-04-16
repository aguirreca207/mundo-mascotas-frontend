document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerPhone = document.getElementById("registerPhone");
  const registerCity = document.getElementById("registerCity");
  const registerAddress = document.getElementById("registerAddress");
  const registerPassword = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const acceptTerms = document.getElementById("acceptTerms");
  const termsError = document.getElementById("termsError");
  const registerSuccessCard = document.getElementById("registerSuccessCard");

  const requiredFields = [
    registerName,
    registerEmail,
    registerPhone,
    registerCity,
    registerAddress,
    registerPassword,
    confirmPassword
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

  const googleRegisterBtn = document.getElementById("googleRegisterBtn");

googleRegisterBtn.addEventListener("click", () => {
  alert("La vinculación con Google quedará disponible cuando se conecte el sistema de autenticación.");
});

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;
    registerSuccessCard.classList.remove("active");
    termsError.textContent = "";

    requiredFields.forEach((field) => {
      clearError(field);

      if (!field.value.trim()) {
        setError(field, "Este campo es obligatorio.");
        isValid = false;
      }
    });

    if (registerEmail.value.trim() && !validateEmail(registerEmail.value)) {
      setError(registerEmail, "Ingresa un correo válido.");
      isValid = false;
    }

    if (registerPassword.value.trim() && registerPassword.value.trim().length < 6) {
      setError(registerPassword, "La contraseña debe tener al menos 6 caracteres.");
      isValid = false;
    }

    if (
      registerPassword.value.trim() &&
      confirmPassword.value.trim() &&
      registerPassword.value !== confirmPassword.value
    ) {
      setError(confirmPassword, "Las contraseñas no coinciden.");
      isValid = false;
    }

    if (!acceptTerms.checked) {
      termsError.textContent = "Debes aceptar las condiciones para continuar.";
      isValid = false;
    }

    if (!isValid) return;

    registerSuccessCard.classList.add("active");
    form.reset();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1400);
  });
});