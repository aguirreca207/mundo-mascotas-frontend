# Mundo Mascotas

Mundo Mascotas es una aplicacion web desarrollada en Django para gestionar servicios relacionados con el cuidado de mascotas. El sistema esta enfocado principalmente en el rol del cliente y permite registrar usuarios, administrar mascotas, consultar productos, crear pedidos, solicitar citas veterinarias, reservar servicios y publicar solicitudes de adopcion.

## Tecnologias Utilizadas

- Python
- Django
- SQLite
- HTML5
- CSS3
- JavaScript
- Django Allauth
- Pillow

## Funcionalidades Principales

- Registro e inicio de sesion de usuarios.
- Edicion de perfil del usuario.
- Registro, edicion y eliminacion de mascotas.
- Catalogo de productos conectado a base de datos.
- Carrito de compras con validacion de stock.
- Creacion de pedidos persistidos en la base de datos.
- Actualizacion automatica del stock despues de una compra.
- Solicitud de citas veterinarias persistidas en base de datos.
- Reserva de servicios como bano, guarderia, consulta a domicilio y paseo.
- Modulo de adopciones con imagenes y estado de revision.
- Mensajes visuales de confirmacion para operaciones importantes.
- Panel administrativo de Django para gestionar informacion.

## Estructura Del Proyecto

```txt
backend/
├── app/
│   ├── migrations/
│   ├── static/
│   │   └── app/
│   │       ├── css/
│   │       ├── img/
│   │       └── js/
│   ├── templates/
│   │   ├── app/
│   │   └── socialaccount/
│   ├── admin.py
│   ├── models.py
│   ├── urls.py
│   └── views.py
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── docs/
├── media/
├── db.sqlite3
├── manage.py
├── README.md
└── requirements.txt
```

## Base De Datos

El proyecto utiliza SQLite mediante el archivo:

```txt
db.sqlite3
```

Las migraciones se encuentran en:

```txt
app/migrations/
```

Modelos principales:

- `UserProfile`
- `Pet`
- `Product`
- `Order`
- `OrderItem`
- `Appointment`
- `ServiceReservation`
- `AdoptionPet`

## Instalacion

Desde la terminal, entrar a la carpeta del proyecto:

```bash
cd /Users/lizmartinez/Documents/Proyectos/backend
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Aplicar migraciones:

```bash
python3 manage.py migrate
```

## Ejecucion

Ejecutar el servidor de desarrollo:

```bash
python3 manage.py runserver
```

Abrir en el navegador:

```txt
http://127.0.0.1:8000/
```

Si el puerto 8000 esta ocupado, se puede usar otro puerto:

```bash
python3 manage.py runserver 127.0.0.1:8010
```

## Puertos Utilizados

- Django: `8000`
- Puerto alternativo de prueba: `8010`

## Rutas Principales

- `/` Inicio
- `/registro/` Registro de usuarios
- `/login/` Inicio de sesion
- `/perfil/` Perfil de usuario
- `/mascotas/` Gestion de mascotas
- `/citas/` Solicitud y consulta de citas
- `/tienda/` Catalogo, carrito y pedidos
- `/servicios/` Reservas de servicios
- `/adopciones/` Solicitudes de adopcion
- `/admin/` Administracion de Django

## Evidencia De Mejoras Implementadas

- Se agrego `requirements.txt`.
- Se amplio la documentacion del proyecto.
- Se implementaron mensajes de confirmacion con toasts y mensajes de Django.
- El carrito valida stock disponible.
- Al confirmar un pedido, el stock se descuenta automaticamente.
- Los pedidos se guardan en la base de datos.
- Las citas se guardan en la base de datos.
- Las reservas de servicios se guardan en la base de datos.
- Las citas y reservas vuelven a mostrarse al actualizar la pagina.
- Se agregaron validaciones para evitar cantidades invalidas, stock negativo y reservas/citas duplicadas.

## Capturas Del Sistema

Las capturas pueden agregarse en la carpeta `docs/` si se requiere evidencia visual para la entrega.

## Notas De Entrega

El proyecto limpio de Django contiene solo los archivos necesarios para ejecutar Mundo Mascotas. Los archivos antiguos del frontend inicial y la API Node separada fueron retirados de la estructura principal para evitar confusion en la revision.
