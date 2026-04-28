document.addEventListener("DOMContentLoaded", () => {
    const footerNewsletterForm = document.getElementById("footerNewsletterForm");
  const footerNewsletterEmail = document.getElementById("footerNewsletterEmail");
  const footerNewsletterMessage = document.getElementById("footerNewsletterMessage");

  function validateFooterEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  if (footerNewsletterForm && footerNewsletterEmail && footerNewsletterMessage) {
    footerNewsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      footerNewsletterMessage.textContent = "";
      footerNewsletterMessage.classList.remove("error", "success");

      if (!footerNewsletterEmail.value.trim()) {
        footerNewsletterMessage.textContent = "Ingresa un correo electrónico.";
        footerNewsletterMessage.classList.add("error");
        return;
      }

      if (!validateFooterEmail(footerNewsletterEmail.value)) {
        footerNewsletterMessage.textContent = "Ingresa un correo válido.";
        footerNewsletterMessage.classList.add("error");
        return;
      }

      footerNewsletterMessage.textContent = "¡Suscripción registrada correctamente!";
      footerNewsletterMessage.classList.add("success");
      footerNewsletterForm.reset();
    });
  }
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
    group.classList.remove("has-success");
    if (errorText) errorText.textContent = "";
  }

  function setSuccess(input, message) {
    const group = input.closest(".form-group");
    const errorText = group.querySelector(".error-text");
    group.classList.remove("has-error");
    group.classList.add("has-success");
    if (errorText) errorText.textContent = message;
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
    function validatePassword(value) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value.trim());
  }

  const googleRegisterBtn = document.getElementById("googleRegisterBtn");

    const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetInput = document.getElementById(button.dataset.target);
      const icon = button.querySelector(".material-symbols-rounded");

      if (targetInput.type === "password") {
        targetInput.type = "text";
        icon.textContent = "visibility_off";
        button.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        targetInput.type = "password";
        icon.textContent = "visibility";
        button.setAttribute("aria-label", "Mostrar contraseña");
      }
    });
  });
    confirmPassword.addEventListener("input", () => {
    clearError(confirmPassword);

    if (!confirmPassword.value.trim()) return;
    if (!registerPassword.value.trim()) return;

    if (registerPassword.value === confirmPassword.value) {
      setSuccess(confirmPassword, "✓ Las contraseñas coinciden.");
    } else {
      setError(confirmPassword, "Las contraseñas no coinciden.");
    }
  });

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

        if (registerPassword.value.trim() && !validatePassword(registerPassword.value)) {
            setError(
        registerPassword,
        "Mínimo 8 caracteres, una letra y un número."
      );

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