document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function setError(input, message) {
    if (!input) return;

    const group = input.closest(".form-group");
    const errorText = group?.querySelector(".error-text");

    group?.classList.add("has-error");

    if (errorText) {
      errorText.textContent = message;
    }
  }

  function clearError(input) {
    if (!input) return;

    const group = input.closest(".form-group");
    const errorText = group?.querySelector(".error-text");

    group?.classList.remove("has-error");

    if (errorText) {
      errorText.textContent = "";
    }
  }

  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      const icon = button.querySelector(".material-symbols-outlined");

      if (!input || !icon) return;

      const passwordIsHidden = input.type === "password";

      input.type = passwordIsHidden ? "text" : "password";
      icon.textContent = passwordIsHidden ? "visibility_off" : "visibility";

      button.setAttribute(
        "aria-label",
        passwordIsHidden ? "Ocultar contraseña" : "Mostrar contraseña"
      );
    });
  });

  if (!form) return;

  form.addEventListener("submit", (event) => {
    let isValid = true;

    clearError(loginEmail);
    clearError(loginPassword);

    if (!loginEmail.value.trim()) {
      setError(loginEmail, "Ingresa tu correo electrónico.");
      isValid = false;
    } else if (!validateEmail(loginEmail.value)) {
      setError(loginEmail, "Ingresa un correo válido, por ejemplo ana@email.com.");
      isValid = false;
    }

    if (!loginPassword.value.trim()) {
      setError(loginPassword, "Ingresa tu contraseña.");
      isValid = false;
    } else if (loginPassword.value.trim().length < 6) {
      setError(loginPassword, "Tu contraseña debe tener al menos 6 caracteres.");
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
      return;
    }

    const submitButton = form.querySelector(".login-submit-btn");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Ingresando...";
      submitButton.classList.add("is-loading");
    }
  });
});