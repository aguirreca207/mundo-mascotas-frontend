document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:3000";

  class ApiClient {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la solicitud");
      }

      return data;
    }

    get(endpoint) {
      return this.request(endpoint);
    }

    post(endpoint, body) {
      return this.request(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });
    }

    put(endpoint, body) {
      return this.request(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
      });
    }

    delete(endpoint) {
      return this.request(endpoint, {
        method: "DELETE"
      });
    }
  }

  class UiMessenger {
    constructor(messageElement) {
      this.messageElement = messageElement;
      this.toastElement = document.getElementById("apiToast");
      this.timeoutId = null;
    }

    show(message, type = "success") {
      if (this.messageElement) {
        this.messageElement.textContent = message;
        this.messageElement.classList.remove("success", "error");
        this.messageElement.classList.add(type);
      }

      if (!this.toastElement) return;

      window.clearTimeout(this.timeoutId);

      this.toastElement.textContent = message;
      this.toastElement.classList.remove("success", "error", "is-visible");
      this.toastElement.classList.add(type, "is-visible");

      this.timeoutId = window.setTimeout(() => {
        this.toastElement.classList.remove("is-visible");
      }, 4200);
    }
  }

  class CrudModule {
    constructor({ api, messenger, endpoint, tableBody, form, fields }) {
      this.api = api;
      this.messenger = messenger;
      this.endpoint = endpoint;
      this.tableBody = tableBody;
      this.form = form;
      this.fields = fields;
      this.items = [];
      this.submitButton = this.form?.querySelector('button[type="submit"]') || null;
      this.defaultSubmitText = this.submitButton?.textContent || "Guardar";
    }

    bindEvents() {
      if (!this.form) return;

      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.save();
      });
    }

    getFormData() {
      return this.fields.reduce((data, field) => {
        const element = document.getElementById(field.id);
        const value = element ? element.value.trim() : "";

        if (field.type === "number") {
          data[field.key] = value === "" ? "" : Number(value);
        } else {
          data[field.key] = value;
        }

        return data;
      }, {});
    }

    getCurrentId() {
      const idField = this.fields.find((field) => field.isId);
      const element = idField ? document.getElementById(idField.id) : null;
      return element ? element.value : "";
    }

    setFormData(item) {
      this.fields.forEach((field) => {
        const element = document.getElementById(field.id);
        if (!element) return;

        element.value = item[field.key] ?? "";
      });

      this.setEditingState(true);
    }

    resetForm() {
      if (this.form) {
        this.form.reset();
      }

      const idField = this.fields.find((field) => field.isId);
      const idElement = idField ? document.getElementById(idField.id) : null;

      if (idElement) {
        idElement.value = "";
      }

      this.setEditingState(false);
    }

    setEditingState(isEditing) {
      if (!this.submitButton) return;

      this.submitButton.textContent = isEditing
        ? this.defaultSubmitText.replace("Guardar", "Actualizar")
        : this.defaultSubmitText;
    }

    validate(data) {
      const missingField = this.fields.find((field) => {
        if (field.isId || field.optional) return false;
        return data[field.key] === "" || data[field.key] === undefined;
      });

      if (missingField) {
        throw new Error(`Completa el campo ${missingField.label}.`);
      }
    }

    async load() {
      this.items = await this.api.get(this.endpoint);
      this.render();
    }

    async save() {
      try {
        const id = this.getCurrentId();
        const data = this.getFormData();

        this.validate(data);

        if (id) {
          await this.api.put(`${this.endpoint}/${id}`, data);
          this.messenger.show("Registro actualizado correctamente desde la API.");
        } else {
          await this.api.post(this.endpoint, data);
          this.messenger.show("Registro creado correctamente desde la API.");
        }

        this.resetForm();
        await this.load();
      } catch (error) {
        this.messenger.show(error.message, "error");
      }
    }

    async remove(id) {
      const shouldDelete = window.confirm("¿Deseas eliminar este registro?");
      if (!shouldDelete) return;

      try {
        await this.api.delete(`${this.endpoint}/${id}`);
        this.messenger.show("Registro eliminado correctamente desde la API.");
        await this.load();
      } catch (error) {
        this.messenger.show(error.message, "error");
      }
    }

    edit(id) {
      const item = this.items.find((currentItem) => String(currentItem.id) === String(id));
      if (!item) return;

      this.setFormData(item);
      this.messenger.show("Registro cargado para edición. Revisa los campos y confirma la actualización.");
    }

    renderActions(id) {
      return `
        <div class="api-table-actions">
          <button class="api-secondary-btn" type="button" data-edit="${id}">Editar</button>
          <button class="api-danger-btn" type="button" data-delete="${id}">Eliminar</button>
        </div>
      `;
    }

    bindTableActions() {
      if (!this.tableBody) return;

      this.tableBody.querySelectorAll("[data-edit]").forEach((button) => {
        button.addEventListener("click", () => this.edit(button.dataset.edit));
      });

      this.tableBody.querySelectorAll("[data-delete]").forEach((button) => {
        button.addEventListener("click", () => this.remove(button.dataset.delete));
      });
    }
  }

  class UsersModule extends CrudModule {
    render() {
      if (!this.tableBody) return;

      if (this.items.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="4">No hay usuarios registrados en la API.</td>
          </tr>
        `;
        return;
      }

      this.tableBody.innerHTML = this.items.map((user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role || "cliente"}</td>
          <td>${this.renderActions(user.id)}</td>
        </tr>
      `).join("");

      this.bindTableActions();
    }
  }

  class ProductsModule extends CrudModule {
    render() {
      if (!this.tableBody) return;

      if (this.items.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="5">No hay productos registrados en la API.</td>
          </tr>
        `;
        return;
      }

      this.tableBody.innerHTML = this.items.map((product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>$${Number(product.price).toLocaleString("es-CO")}</td>
          <td>${product.stock}</td>
          <td>${this.renderActions(product.id)}</td>
        </tr>
      `).join("");

      this.bindTableActions();
    }
  }

  class ServicesModule extends CrudModule {
    render() {
      if (!this.tableBody) return;

      if (this.items.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="5">No hay servicios registrados en la API.</td>
          </tr>
        `;
        return;
      }

      this.tableBody.innerHTML = this.items.map((service) => `
        <tr>
          <td>${service.name}</td>
          <td>${service.category}</td>
          <td>$${Number(service.price).toLocaleString("es-CO")}</td>
          <td>${service.duration}</td>
          <td>${this.renderActions(service.id)}</td>
        </tr>
      `).join("");

      this.bindTableActions();
    }
  }

  class GestionApiApp {
    constructor() {
      this.api = new ApiClient(API_BASE_URL);
      this.messenger = new UiMessenger(document.getElementById("apiMessage"));
      this.statusText = document.getElementById("apiStatusText");
      this.statusCard = document.querySelector(".api-status-card");
      this.modules = this.createModules();
    }

    createModules() {
      return {
        users: new UsersModule({
          api: this.api,
          messenger: this.messenger,
          endpoint: "/api/users",
          tableBody: document.getElementById("usersTableBody"),
          form: document.getElementById("userForm"),
          fields: [
            { id: "userId", key: "id", isId: true, optional: true },
            { id: "userName", key: "name", label: "nombre" },
            { id: "userEmail", key: "email", label: "correo" },
            { id: "userPassword", key: "password", label: "contraseña" },
            { id: "userRole", key: "role", label: "rol", optional: true }
          ]
        }),
        products: new ProductsModule({
          api: this.api,
          messenger: this.messenger,
          endpoint: "/api/products",
          tableBody: document.getElementById("productsTableBody"),
          form: document.getElementById("productForm"),
          fields: [
            { id: "productId", key: "id", isId: true, optional: true },
            { id: "productName", key: "name", label: "nombre" },
            { id: "productCategory", key: "category", label: "categoría" },
            { id: "productPetType", key: "pet_type", label: "mascota" },
            { id: "productDescription", key: "description", label: "descripción" },
            { id: "productPrice", key: "price", label: "precio", type: "number" },
            { id: "productStock", key: "stock", label: "stock", type: "number" }
          ]
        }),
        services: new ServicesModule({
          api: this.api,
          messenger: this.messenger,
          endpoint: "/api/services",
          tableBody: document.getElementById("servicesTableBody"),
          form: document.getElementById("serviceForm"),
          fields: [
            { id: "serviceId", key: "id", isId: true, optional: true },
            { id: "serviceName", key: "name", label: "nombre" },
            { id: "serviceCategory", key: "category", label: "categoría" },
            { id: "serviceDescription", key: "description", label: "descripción" },
            { id: "servicePrice", key: "price", label: "precio", type: "number" },
            { id: "serviceDuration", key: "duration", label: "duración" }
          ]
        })
      };
    }

    bindEvents() {
      document.getElementById("checkApiBtn")?.addEventListener("click", () => this.checkApiStatus());
      document.getElementById("apiLoginForm")?.addEventListener("submit", (event) => this.login(event));

      document.querySelectorAll(".api-tab").forEach((tab) => {
        tab.addEventListener("click", () => this.switchModule(tab.dataset.module));
      });

      document.querySelectorAll("[data-refresh]").forEach((button) => {
        button.addEventListener("click", () => this.refreshModule(button.dataset.refresh));
      });

      document.querySelectorAll("[data-reset]").forEach((button) => {
        button.addEventListener("click", () => {
          this.modules[button.dataset.reset]?.resetForm();
          this.messenger.show("Formulario limpio. Puedes crear un nuevo registro.");
        });
      });

      Object.values(this.modules).forEach((module) => module.bindEvents());
    }

    async checkApiStatus() {
      try {
        const data = await this.api.get("/");

        if (this.statusText) {
          this.statusText.textContent = data.message;
        }

        this.statusCard?.classList.remove("is-error");
        this.statusCard?.classList.add("is-success");
        this.messenger.show("Conexión con API verificada correctamente.");
        this.showStatusFeedback();
      } catch (error) {
        if (this.statusText) {
          this.statusText.textContent = "No se pudo conectar con la API";
        }

        this.statusCard?.classList.remove("is-success");
        this.statusCard?.classList.add("is-error");
        this.messenger.show("Verifica que Node esté corriendo con npm start.", "error");
        this.showStatusFeedback();
      }
    }

    showStatusFeedback() {
      this.statusCard?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    async login(event) {
      event.preventDefault();

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value.trim();

      if (!email || !password) {
        this.messenger.show("Ingresa correo y contraseña para probar autenticación.", "error");
        return;
      }

      try {
        const data = await this.api.post("/api/auth/login", { email, password });
        this.messenger.show(`${data.message}: ${data.user.name}`);
      } catch (error) {
        this.messenger.show(error.message, "error");
      }
    }

    switchModule(moduleName) {
      document.querySelectorAll(".api-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.module === moduleName);
      });

      document.querySelectorAll("[data-module-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.modulePanel === moduleName);
      });

      this.refreshModule(moduleName);
    }

    async refreshModule(moduleName) {
      try {
        await this.modules[moduleName]?.load();
        this.messenger.show("Datos actualizados desde la API.");
      } catch (error) {
        this.messenger.show(error.message, "error");
      }
    }

    async init() {
      this.bindEvents();
      await this.checkApiStatus();
      await Promise.allSettled([
        this.modules.users.load(),
        this.modules.products.load(),
        this.modules.services.load()
      ]);
    }
  }

  const app = new GestionApiApp();
  app.init();
});
