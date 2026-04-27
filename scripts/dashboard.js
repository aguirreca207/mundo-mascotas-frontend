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
  const isLoggedIn = sessionStorage.getItem("mm_logged_in");

  if (isLoggedIn !== "true") {
    window.location.href = "login.html";
    return;
  }

  const markReadBtn = document.getElementById("markReadBtn");
  const notificationsList = document.getElementById("notificationsList");
  const prefEmail = document.getElementById("prefEmail");
  const prefApp = document.getElementById("prefApp");
  const logoutBtn = document.getElementById("logoutBtn");
  const activityList = document.getElementById("activityList");
  const dashboardUserEmail = document.getElementById("dashboardUserEmail");
  const storedUserEmail = sessionStorage.getItem("mm_user_email");

  if (dashboardUserEmail && storedUserEmail) {
    dashboardUserEmail.textContent = storedUserEmail;
  }

  markReadBtn.addEventListener("click", () => {
    const unreadNotifications = notificationsList.querySelectorAll(".notification-item.unread");

    if (unreadNotifications.length === 0) {
      alert("No tienes notificaciones pendientes por marcar.");
      return;
    }

    unreadNotifications.forEach((item) => {
      item.classList.remove("unread");
    });

    const newActivity = document.createElement("article");
    newActivity.className = "activity-item";
    newActivity.innerHTML = `
      <div>
        <strong>Notificaciones actualizadas</strong>
        <p>Tus notificaciones fueron marcadas como leídas correctamente.</p>
      </div>
      <span class="item-tag success">Actualizado</span>
    `;

    activityList.prepend(newActivity);

    alert("Tus notificaciones fueron marcadas como leídas.");
  });

  function showPreferenceChangeMessage(channel, enabled) {
    const newActivity = document.createElement("article");
    newActivity.className = "activity-item";
    newActivity.innerHTML = `
      <div>
        <strong>Preferencia actualizada</strong>
        <p>${channel} ${enabled ? "activado" : "desactivado"} para tus notificaciones.</p>
      </div>
      <span class="item-tag warning">Preferencia</span>
    `;
    activityList.prepend(newActivity);
  }

  prefEmail.addEventListener("change", () => {
    showPreferenceChangeMessage("Correo", prefEmail.checked);
  });

  prefApp.addEventListener("change", () => {
    showPreferenceChangeMessage("App", prefApp.checked);
  });

  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault();

    sessionStorage.removeItem("mm_logged_in");
    sessionStorage.removeItem("mm_user_email");

    window.location.href = "login.html";
  });
});