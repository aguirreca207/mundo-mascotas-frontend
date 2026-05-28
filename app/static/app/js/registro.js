document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const registerSubmitBtn = document.getElementById("registerSubmitBtn");
  const googleRegisterBtn = document.getElementById("googleRegisterBtn");
  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerPhone = document.getElementById("registerPhone");
  const registerCity = document.getElementById("registerCity");
  const registerAddress = document.getElementById("registerAddress");
  const registerPassword = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const acceptTerms = document.getElementById("acceptTerms");
  const passwordRules = document.getElementById("passwordRules");
  const termsError = document.getElementById("termsError");

  let emailAlreadyExists = false;

  function showRegisterNotice(message, type = "error") {
    if (window.showToast) {
      window.showToast(message);
      return;
    }

    const alertBox = document.querySelector(".register-alert");
    if (alertBox) alertBox.textContent = message;
  }

  function setError(input, message) {
    const group = input?.closest(".form-group");
    const errorText = group?.querySelector(".error-text");

    group?.classList.add("has-error");
    if (errorText) errorText.textContent = message;
  }

  function clearError(input) {
    const group = input?.closest(".form-group");
    const errorText = group?.querySelector(".error-text");

    group?.classList.remove("has-error");
    if (errorText) errorText.textContent = "";
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function getPasswordRules(value) {
    return {
      length: value.length >= 8,
      lower: /[a-z]/.test(value),
      upper: /[A-Z]/.test(value),
      number: /\d/.test(value)
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

  async function validateEmailAvailability() {
    const email = registerEmail?.value.trim().toLowerCase() || "";

    clearError(registerEmail);
    emailAlreadyExists = false;

    if (!email) return;

    if (!validateEmail(email)) {
      setError(registerEmail, "Ingresa un correo electrónico válido.");
      return;
    }

    try {
      const response = await fetch(`/validar-correo/?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.exists) {
        emailAlreadyExists = true;
        setError(registerEmail, data.message || "Ya existe una cuenta registrada con este correo.");
      }
    } catch (error) {
      return;
    }
  }

  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", () => {
      const googleUrl = googleRegisterBtn.dataset.googleUrl || "/accounts/google/login/";

      googleRegisterBtn.disabled = true;
      googleRegisterBtn.classList.add("is-loading");
      googleRegisterBtn.querySelector("span:last-child").textContent = "Conectando con Google...";

      window.location.href = googleUrl;
    });
  }

  if (registerPhone) {
    registerPhone.addEventListener("input", () => {
      registerPhone.value = registerPhone.value.replace(/\D/g, "").slice(0, 10);
      clearError(registerPhone);
    });
  }

  if (registerEmail) {
    registerEmail.addEventListener("blur", validateEmailAvailability);
    registerEmail.addEventListener("input", () => clearError(registerEmail));
  }

  if (registerPassword) {
    registerPassword.addEventListener("input", () => {
      updatePasswordRules(registerPassword.value);
      clearError(registerPassword);
    });
  }

  if (confirmPassword) {
    confirmPassword.addEventListener("input", () => clearError(confirmPassword));
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      [registerName, registerEmail, registerPhone, registerCity, registerAddress, registerPassword, confirmPassword].forEach(clearError);
      if (termsError) termsError.textContent = "";

      await validateEmailAvailability();

      let isValid = true;
      const rules = getPasswordRules(registerPassword.value);
      const passwordIsValid = rules.length && rules.lower && rules.upper && rules.number;

      if (!registerName.value.trim()) {
        setError(registerName, "Ingresa tu nombre completo.");
        isValid = false;
      }

      if (!validateEmail(registerEmail.value)) {
        setError(registerEmail, "Ingresa un correo electrónico válido.");
        isValid = false;
      }

      if (emailAlreadyExists) {
        isValid = false;
      }

      if (!/^\d{7,10}$/.test(registerPhone.value.trim())) {
        setError(registerPhone, "Ingresa solo números, entre 7 y 10 dígitos.");
        isValid = false;
      }

      if (!registerCity.value.trim()) {
        setError(registerCity, "Ingresa tu ciudad.");
        isValid = false;
      }

      if (!registerAddress.value.trim()) {
        setError(registerAddress, "Ingresa tu dirección.");
        isValid = false;
      }

      if (!passwordIsValid) {
        setError(registerPassword, "Usa mínimo 8 caracteres, una mayúscula, una minúscula y un número.");
        isValid = false;
      }

      if (registerPassword.value !== confirmPassword.value) {
        setError(confirmPassword, "Las contraseñas no coinciden. Verifica nuevamente para continuar.");
        isValid = false;
      }

      if (!acceptTerms.checked) {
        if (termsError) termsError.textContent = "Debes aceptar el tratamiento de datos para crear tu cuenta.";
        isValid = false;
      }

      if (!isValid) {
        showRegisterNotice("Revisa los campos marcados para continuar.", "error");
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
