# Sistema Ecommerce - Examen

Sistema basico de ecommerce desarrollado con arquitectura cliente-servidor. El sistema permite la gestion completa de un inventario de productos mediante operaciones CRUD y automatiza la obtencion de imagenes a traves del consumo de una API publica.

## Tecnologias Usadas

* Backend: Express.js, Node.js
* Base de Datos: PostgreSQL
* Frontend: Next.js, TailwindCSS
* Librerias: Joi (Validacion), Morgan (Logging), Axios (Consumo de API Externa)

## URLs del Proyecto en Linea

* Frontend (Render): https://examen-frontend-12.onrender.com
* Backend (Render): https://examen-backend-12.onrender.com

## Consumo de API Externa

El sistema integra el consumo automatico de una API externa (Lorem Picsum) al momento de registrar un nuevo producto en la base de datos. 

Flujo de la integracion:
1. Al recibir una peticion POST en el endpoint `/api/products`, el backend intercepta los datos validados.
2. Utilizando la libreria Axios, el servidor realiza una peticion GET a `https://picsum.photos/400`.
3. Se captura la URL final de redireccion devuelta por la API externa.
4. Esta URL se almacena automaticamente en el campo `image_url` del nuevo producto en PostgreSQL, sin requerir intervencion del usuario.

## Instrucciones de Instalacion Local

1. Clonar el repositorio.
2. Configurar la base de datos PostgreSQL:
   * Ejecutar el script SQL en DBeaver (`CREATE DATABASE ecommerce_db;`).
   * (Nota: La tabla `products` se generara automaticamente al iniciar el servidor gracias a la funcion de inicializacion en `server.js`).
3. Levantar el Backend:
   ```bash
   cd ecommerce-backend
   npm install
