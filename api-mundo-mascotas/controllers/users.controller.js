const db = require("../database");

function getUsers(req, res) {
  db.all("SELECT id, name, email, role, created_at FROM users", [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        message: "Error consultando usuarios",
        error: error.message
      });
    }

    return res.json(rows);
  });
}

function getUserById(req, res) {
  const { id } = req.params;

  db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id],
    (error, row) => {
      if (error) {
        return res.status(500).json({
          message: "Error consultando usuario",
          error: error.message
        });
      }

      if (!row) {
        return res.status(404).json({
          message: "Usuario no encontrado"
        });
      }

      return res.json(row);
    }
  );
}

function createUser(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nombre, correo y contraseña son obligatorios"
    });
  }

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role || "cliente"],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error creando usuario",
          error: error.message
        });
      }

      return res.status(201).json({
        message: "Usuario creado correctamente",
        id: this.lastID
      });
    }
  );
}

function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nombre, correo y contraseña son obligatorios"
    });
  }

  db.run(
    "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?",
    [name, email, password, role || "cliente", id],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error actualizando usuario",
          error: error.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Usuario no encontrado"
        });
      }

      return res.json({
        message: "Usuario actualizado correctamente"
      });
    }
  );
}

function deleteUser(req, res) {
  const { id } = req.params;

  db.run("DELETE FROM users WHERE id = ?", [id], function (error) {
    if (error) {
      return res.status(500).json({
        message: "Error eliminando usuario",
        error: error.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    return res.json({
      message: "Usuario eliminado correctamente"
    });
  });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};