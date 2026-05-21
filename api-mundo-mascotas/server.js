const express = require("express");
const cors = require("cors");

const usersRoutes = require("./routes/users.routes");
const productsRoutes = require("./routes/products.routes");
const servicesRoutes = require("./routes/services.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Mundo Mascotas funcionando correctamente"
  });
});

app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});