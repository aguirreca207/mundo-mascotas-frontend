# API Mundo Mascotas

API REST desarrollada con Node.js, Express y SQLite para el proyecto Mundo Mascotas.

Esta API permite gestionar usuarios, autenticar el ingreso a la aplicación, administrar productos y administrar servicios mediante métodos REST.

## Tecnologías utilizadas

- Node.js
- Express
- SQLite
- CORS
- JSON como formato de intercambio de datos

## Instalación del proyecto

Desde la terminal, ingresar a la carpeta del proyecto:

```bash
cd /Users/lizmartinez/Documents/Proyectos/backend/api-mundo-mascotas
```

Instalar las dependencias:

```bash
npm install
```

## Ejecutar la API

```bash
npm start
```

La API quedará disponible en:

```txt
http://localhost:3000
```

## Base de datos

La API utiliza SQLite mediante el archivo:

```txt
db.sqlite
```

Las tablas se crean automáticamente al ejecutar el servidor si no existen:

- users
- products
- services

## Módulo de autenticación

```txt
GET    /api/auth/status
POST   /api/auth/login
PUT    /api/auth/password/:id
DELETE /api/auth/logout
```

## Módulo de usuarios

```txt
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

## Módulo de productos

```txt
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

## Módulo de servicios

```txt
GET    /api/services
GET    /api/services/:id
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id
```

## Ejemplos de prueba

Crear usuario:

```bash
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"name":"Camila Aguirre","email":"camila@test.com","password":"123456","role":"cliente"}'
```

Iniciar sesión:

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"camila@test.com","password":"123456"}'
```

Crear producto:

```bash
curl -X POST http://localhost:3000/api/products \
-H "Content-Type: application/json" \
-d '{"name":"Concentrado Premium","category":"Alimento","pet_type":"Perro","description":"Alimento balanceado para perro adulto.","price":85000,"stock":20}'
```

Crear servicio:

```bash
curl -X POST http://localhost:3000/api/services \
-H "Content-Type: application/json" \
-d '{"name":"Baño para mascota","category":"Cuidado","description":"Servicio de baño e higiene básica para perros y gatos.","price":35000,"duration":"1 hora"}'
```

## Estructura del proyecto

```txt
api-mundo-mascotas/
├── controllers/
│   ├── auth.controller.js
│   ├── products.controller.js
│   ├── services.controller.js
│   └── users.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── products.routes.js
│   ├── services.routes.js
│   └── users.routes.js
├── database.js
├── server.js
├── db.sqlite
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Evidencia cubierta

Esta API cumple con:

- CRUD de usuarios.
- Módulo de autenticación con métodos GET, POST, PUT y DELETE.
- Validación de autenticación e ingreso del usuario.
- CRUD de productos.
- CRUD de servicios.
- Uso de métodos GET, POST, PUT y DELETE.
- Conexión e interacción con base de datos SQLite.
- Formato de intercambio JSON.
- API REST desarrollada con Node.js y Express.
- Proyecto ejecutable mediante `npm install` y `npm start`.