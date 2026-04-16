document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginSuccessCard = document.getElementById("loginSuccessCard");

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    clearError(loginEmail);
    clearError(loginPassword);
    loginSuccessCard.classList.remove("active");

    if (!loginEmail.value.trim()) {
      setError(loginEmail, "Este campo es obligatorio.");
      isValid = false;
    } else if (!validateEmail(loginEmail.value)) {
      setError(loginEmail, "Ingresa un correo válido.");
      isValid = false;
    }

    if (!loginPassword.value.trim()) {
      setError(loginPassword, "Este campo es obligatorio.");
      isValid = false;
    } else if (loginPassword.value.trim().length < 6) {
      setError(loginPassword, "La contraseña debe tener al menos 6 caracteres.");
      isValid = false;
    }

    if (!isValid) return;

    loginSuccessCard.classList.add("active");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  });
});