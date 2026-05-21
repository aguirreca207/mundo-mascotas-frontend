const db = require("../database");

function getAuthStatus(req, res) {
  return res.json({
    message: "Módulo de autenticación disponible",
    endpoints: {
      status: "GET /api/auth/status",
      login: "POST /api/auth/login",
      updatePassword: "PUT /api/auth/password/:id",
      logout: "DELETE /api/auth/logout"
    }
  });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Correo y contraseña son obligatorios"
    });
  }

  db.get(
    "SELECT id, name, email, role FROM users WHERE email = ? AND password = ?",
    [email, password],
    (error, user) => {
      if (error) {
        return res.status(500).json({
          message: "Error al iniciar sesión",
          error: error.message
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Credenciales incorrectas"
        });
      }

      return res.json({
        message: "Inicio de sesión exitoso",
        user
      });
    }
  );
}

function updatePassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: "La nueva contraseña es obligatoria"
    });
  }

  db.run(
    "UPDATE users SET password = ? WHERE id = ?",
    [password, id],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error actualizando contraseña",
          error: error.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Usuario no encontrado"
        });
      }

      return res.json({
        message: "Contraseña actualizada correctamente"
      });
    }
  );
}

function logout(req, res) {
  return res.json({
    message: "Sesión cerrada correctamente"
  });
}

module.exports = {
  getAuthStatus,
  login,
  updatePassword,
  logout
};