const db = require("../database");

function getServices(req, res) {
  db.all("SELECT * FROM services", [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        message: "Error consultando servicios",
        error: error.message
      });
    }

    return res.json(rows);
  });
}

function getServiceById(req, res) {
  const { id } = req.params;

  db.get("SELECT * FROM services WHERE id = ?", [id], (error, service) => {
    if (error) {
      return res.status(500).json({
        message: "Error consultando servicio",
        error: error.message
      });
    }

    if (!service) {
      return res.status(404).json({
        message: "Servicio no encontrado"
      });
    }

    return res.json(service);
  });
}

function createService(req, res) {
  const { name, category, description, price, duration } = req.body;

  if (!name || !category || !description || price === undefined || !duration) {
    return res.status(400).json({
      message: "Nombre, categoría, descripción, precio y duración son obligatorios"
    });
  }

  db.run(
    `INSERT INTO services (name, category, description, price, duration)
     VALUES (?, ?, ?, ?, ?)`,
    [name, category, description, price, duration],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error creando servicio",
          error: error.message
        });
      }

      return res.status(201).json({
        message: "Servicio creado correctamente",
        id: this.lastID
      });
    }
  );
}

function updateService(req, res) {
  const { id } = req.params;
  const { name, category, description, price, duration } = req.body;

  if (!name || !category || !description || price === undefined || !duration) {
    return res.status(400).json({
      message: "Nombre, categoría, descripción, precio y duración son obligatorios"
    });
  }

  db.run(
    `UPDATE services
     SET name = ?, category = ?, description = ?, price = ?, duration = ?
     WHERE id = ?`,
    [name, category, description, price, duration, id],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error actualizando servicio",
          error: error.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Servicio no encontrado"
        });
      }

      return res.json({
        message: "Servicio actualizado correctamente"
      });
    }
  );
}

function deleteService(req, res) {
  const { id } = req.params;

  db.run("DELETE FROM services WHERE id = ?", [id], function (error) {
    if (error) {
      return res.status(500).json({
        message: "Error eliminando servicio",
        error: error.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Servicio no encontrado"
      });
    }

    return res.json({
      message: "Servicio eliminado correctamente"
    });
  });
}

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};