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
  const form = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginSuccessCard = document.getElementById("loginSuccessCard");
    const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetInput = document.getElementById(button.dataset.target);
      const icon = button.querySelector(".material-symbols-outlined");

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

sessionStorage.setItem("mm_logged_in", "true");
sessionStorage.setItem("mm_user_email", loginEmail.value.trim());

loginSuccessCard.classList.add("active");

setTimeout(() => {
  window.location.href = "dashboard.html";
}, 1200);
  });
});