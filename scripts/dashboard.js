document.addEventListener("DOMContentLoaded", () => {
  const markReadBtn = document.getElementById("markReadBtn");
  const notificationsList = document.getElementById("notificationsList");
  const prefEmail = document.getElementById("prefEmail");
  const prefApp = document.getElementById("prefApp");
  const activityList = document.getElementById("activityList");

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
});