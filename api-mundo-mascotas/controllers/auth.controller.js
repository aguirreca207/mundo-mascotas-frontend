const db = require("../database");

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

module.exports = {
  login
};