# 🛍️ API REST - Backend de una tienda online

Este proyecto es el **backend de una tienda online**, implementado como **API REST** en Node.js con Express y base de datos MongoDB.  
Incluye gestión de usuarios, productos y categorías, autenticación con JWT, subida de imágenes, y sigue principios de **Clean Architecture** junto al **Patrón Adaptador**.

## Características

- Creación de usuarios, productos y categorías.
- Paginación en las peticiones GET.
- Registro e inicio de sesión con autenticación mediante JWT.
- Validación de usuarios mediante email. (Por defecto desactivado, hay que configurar el email desde el que se envían los correos y generar una 'secret key')
- Subida de archivos que se guardan de manera local.
- Registro en base de datos.
- Semilla para llenar la BBDD automáticamente.

## Endpoints de autenticación

1. **Registro** → `POST /api/auth/register`

   ```json
   {
     "name": "Pedro Peñas",
     "email": "pedropefer34@gmail.com",
     "password": "123456"
   }
   ```

   **Respuesta:**

   ```json
   {
     "user": {
       "id": "68b042940097ed21ec39d2c3",
       "name": "Pedro Peñas",
       "email": "pedropefer34@gmail.com",
       "emailValidated": false,
       "role": ["USER_ROLE"]
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjA0Mjk0MDA5N2VkMjFlYzM5ZDJjMyIsImlhdCI6MTc1NjM4MTg0NCwiZXhwIjoxNzU2Mzg5MDQ0fQ.dMVnksEM2sbHXhJHUynsECwy7-bv6alSbV_tEJrXjAs"
   }
   ```

2. **Login** → `POST /api/auth/login`

   ```json
   { "email": "pedropefer34@gmail.com", "password": "123456" }
   ```

   **Respuesta:**

   ```json
   {
     "user": {
       "id": "68b042940097ed21ec39d2c3",
       "name": "Pedro Peñas",
       "email": "pedropefer34@gmail.com",
       "emailValidated": false,
       "role": ["USER_ROLE"]
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjA0Mjk0MDA5N2VkMjFlYzM5ZDJjMyIsImlhdCI6MTc1NjM4MTg0NCwiZXhwIjoxNzU2Mzg5MDQ0fQ.dMVnksEM2sbHXhJHUynsECwy7-bv6alSbV_tEJrXjAs"
   }
   ```

3. **Uso del token** → Enviar en headers:

   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjA0Mjk0MDA5N2VkMjFlYzM5ZDJjMyIsImlhdCI6MTc1NjM4MTg0NCwiZXhwIjoxNzU2Mzg5MDQ0fQ.dMVnksEM2sbHXhJHUynsECwy7-bv6alSbV_tEJrXjAs
   ```

   Este será necesario para crear productos y categorías, las rutas GET de estos no necesitan autenticación.

## Endpoints de productos y categorías

1. **Creación de categorías** → `POST /api/categories`

   ```json
   { "name": "Categoría test", "available": "true" }
   ```

   **Respuesta sin token:**

   ```json
   { "error": "No token provided" }
   ```

   **Respuesta con token válido:**

   ```json
   {
     "id": "68b045560097ed21ec39d2ca",
     "name": "Categoría test",
     "available": true
   }
   ```

2. **Obtención de categorías** → `GET /api/categories?page=1&limit=2`

   **Respuesta (con paginación según parámetros de la URL):**

   ```json
   {
     "page": 1,
     "limit": 2,
     "total": 23,
     "next": "api/categories?page=2$limit=2",
     "prev": null,
     "categories": [
       {
         "id": "68b041bdc0a8edc42e3dbf0d",
         "name": "Driven",
         "available": false
       },
       {
         "id": "68b041bdc0a8edc42e3dbf0e",
         "name": "Till",
         "available": false
       }
     ]
   }
   ```

   3. **Creación de productos** → `POST /api/products`

   ```json
   {
     "name": "Producto test",
     "category": "68b041bdc0a8edc42e3dbf0d"
   }
   ```

   La categoría debe de ser un ID válido de MongoDB para que vayan enlazados.

   **Respuesta sin token:**

   ```json
   { "error": "No token provided" }
   ```

   **Respuesta con token válido:**

   ```json
   {
     "name": "Producto test",
     "available": false,
     "price": 0,
     "user": "68b042940097ed21ec39d2c3",
     "category": "68b041bdc0a8edc42e3dbf0d",
     "id": "68b0481d0097ed21ec39d2f5"
   }
   ```

   Con la autenticación, se le añade el ID del usuario autenticado en MongoDB para saber quien creó el producto.

   4. **Obtención de productos** → `GET /api/products?limit=1&page =1`

   **Respuesta (con paginación según parámetros de la URL):**

   ```json
   {
     "page": 1,
     "limit": 1,
     "total": 23,
     "next": "api/categories?page=2$limit=1",
     "prev": null,
     "products": [
       {
         "name": "Than",
         "available": true,
         "price": 75.0369,
         "user": {
           "name": "Test 2",
           "email": "test2@google.com",
           "emailValidated": false,
           "role": ["USER_ROLE"],
           "id": "68b041bdc0a8edc42e3dbf07"
         },
         "category": {
           "name": "kitchen",
           "id": "68b041bdc0a8edc42e3dbf1f"
         },
         "id": "68b041bdc0a8edc42e3dbf26"
       }
     ]
   }
   ```

   ## Endpoints de carga de imágenes

   1. **Carga de imágenes simple (una sola imagen)** → `POST /api/upload/single/:type`

   ```json
   En el URL debemos sustituir ":type" por la clase a de la imagen. Las opciones son: "users", "products" y "categories".

   Subimos la imagen que queramos con el formato aceptado ("png", "jpeg", "jpg" y "gif")
   ```

   **Respuesta:**

   ```json
   {
     "fileName": "0029b869-a5ac-4d5a-8154-c8e6a0d2c182.png"
   }
   ```

   El ID de la imagen. Se guarda en la carpeta uploads del proyecto, en el subdirectorio señalado en ":type"

   2. **Carga de imágenes múltiple (varias imágenes)** → `POST /api/upload/multiple/:type`

   ```json
   Similar al anterior pero nos permite subir varios archivos.
   ```

   3. **Obtención de imágenes** → `GET /api/images/:type/:img`

   ```json
   En el URL debemos sustituir ":type" por la clase a de la imagen. Las opciones son: "users", "products" y "categories". También debemos sustituir ":img" por el ID que se generó cuando cargamos la imagen.
   ```

   **Respuesta:**

   ```json
   La propia imagen.
   ```

## Tecnologías

- **Node.js + Express** (API REST)
- **JWT** (autenticación)
- **MongoDB** (base de datos)
- **Mongoose** (gestión base de datos)
- **Bcrypt** (encriptación de contraseñas)
- **Dotenv** (variables de entorno)
- **Uuid** (generación de IDs)
- **Nodemailer** (envío de correos electrónicos)
- **Express-fileupload** (subida de archivos)
- **Clean Architecture + Patrón Adaptador**

## Instalación

```bash
# Clonar repositorio
Clonar '.env.template' a '.env' y configurar las variables de entorno

# Instalar dependencias
Ejecutar el comando 'npm install'

# Base de datos
Configurar el 'docker-compose.yml' y ejecutar 'docker compose up -d' para levantar los servicios deseados.

# Llenar base de datos
Llenar la base de datos con los datos de prueba ejecutando 'npm run seed'

# Levantar el proyecto
Ejecutar 'npm run dev' para levantar el proyecto en modo desarrollo
```
