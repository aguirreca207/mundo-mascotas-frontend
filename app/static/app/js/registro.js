document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const registerSubmitBtn = document.getElementById("registerSubmitBtn");
  const googleRegisterBtn = document.getElementById("googleRegisterBtn");
  const registerPassword = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordRules = document.getElementById("passwordRules");

if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener("click", () => {
    const googleUrl = googleRegisterBtn.dataset.googleUrl || "/accounts/google/login/";

    googleRegisterBtn.disabled = true;
    googleRegisterBtn.classList.add("is-loading");
    googleRegisterBtn.querySelector("span:last-child").textContent = "Conectando con Google...";

    window.location.href = googleUrl;
  });
}
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const icon = button.querySelector(".material-symbols-outlined");

      if (!input || !icon) return;

      const passwordIsHidden = input.type === "password";

      input.type = passwordIsHidden ? "text" : "password";
      icon.textContent = passwordIsHidden ? "visibility" : "visibility_off";

      button.setAttribute(
        "aria-label",
        passwordIsHidden ? "Ocultar contraseña" : "Mostrar contraseña",
      );
    });
  });

  function getPasswordRules(value) {
    return {
      length: value.length >= 8,
      lower: /[a-z]/.test(value),
      upper: /[A-Z]/.test(value),
      number: /\d/.test(value),
    };
  }

  function updatePasswordRules(value) {
    if (!passwordRules) return;

    const rules = getPasswordRules(value);

    Object.entries(rules).forEach(([rule, isValid]) => {
      const item = passwordRules.querySelector(`[data-rule="${rule}"]`);
      if (item) item.classList.toggle("is-valid", isValid);
    });
  }

  if (registerPassword) {
    registerPassword.addEventListener("input", () => {
      updatePasswordRules(registerPassword.value);
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const rules = getPasswordRules(registerPassword.value);
      const passwordIsValid =
        rules.length && rules.lower && rules.upper && rules.number;

      if (!passwordIsValid) {
        alert(
          "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.",
        );
        return;
      }

      if (registerPassword.value !== confirmPassword.value) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      if (registerSubmitBtn) {
        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = "Creando cuenta...";
        registerSubmitBtn.classList.add("is-loading");
      }

      form.submit();
    });
  }
});
