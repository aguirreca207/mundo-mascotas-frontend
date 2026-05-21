const db = require("../database");

function getProducts(req, res) {
  db.all("SELECT * FROM products", [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        message: "Error consultando productos",
        error: error.message
      });
    }

    return res.json(rows);
  });
}

function getProductById(req, res) {
  const { id } = req.params;

  db.get("SELECT * FROM products WHERE id = ?", [id], (error, product) => {
    if (error) {
      return res.status(500).json({
        message: "Error consultando producto",
        error: error.message
      });
    }

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.json(product);
  });
}

function createProduct(req, res) {
  const { name, category, pet_type, description, price, stock } = req.body;

  if (!name || !category || !pet_type || !description || price === undefined || stock === undefined) {
    return res.status(400).json({
      message: "Nombre, categoría, tipo de mascota, descripción, precio y stock son obligatorios"
    });
  }

  db.run(
    `INSERT INTO products (name, category, pet_type, description, price, stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, pet_type, description, price, stock],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error creando producto",
          error: error.message
        });
      }

      return res.status(201).json({
        message: "Producto creado correctamente",
        id: this.lastID
      });
    }
  );
}

function updateProduct(req, res) {
  const { id } = req.params;
  const { name, category, pet_type, description, price, stock } = req.body;

  if (!name || !category || !pet_type || !description || price === undefined || stock === undefined) {
    return res.status(400).json({
      message: "Nombre, categoría, tipo de mascota, descripción, precio y stock son obligatorios"
    });
  }

  db.run(
    `UPDATE products
     SET name = ?, category = ?, pet_type = ?, description = ?, price = ?, stock = ?
     WHERE id = ?`,
    [name, category, pet_type, description, price, stock, id],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Error actualizando producto",
          error: error.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Producto no encontrado"
        });
      }

      return res.json({
        message: "Producto actualizado correctamente"
      });
    }
  );
}

function deleteProduct(req, res) {
  const { id } = req.params;

  db.run("DELETE FROM products WHERE id = ?", [id], function (error) {
    if (error) {
      return res.status(500).json({
        message: "Error eliminando producto",
        error: error.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.json({
      message: "Producto eliminado correctamente"
    });
  });
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};