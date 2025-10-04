"# 🎬 Star Wars Movies Management System

Sistema backend desarrollado con **NestJS** para la gestión de películas utilizando datos de la [API pública de Star Wars (SWAPI)](https://www.swapi.tech/). El proyecto implementa una arquitectura de microservicios con autenticación JWT, autorización basada en roles, y sincronización automática de datos.

## 📋 Descripción del Proyecto

Este proyecto fue desarrollado como respuesta a un ejercicio práctico que evalúa las mejores prácticas en el desarrollo backend. La solución implementa dos microservicios independientes:

### 🔐 **Auth Service** (Puerto 3001)
Microservicio dedicado a la autenticación y gestión de usuarios:
- ✅ Registro de usuarios (Sign Up) con validaciones robustas
- ✅ Inicio de sesión (Login) con generación de JWT
- ✅ Sistema de roles (Administrador / Usuario Regular)
- ✅ Validación de email y contraseñas seguras
- ✅ Base de datos PostgreSQL independiente

### 🎥 **Movies Service** (Puerto 3002)
Microservicio para la gestión completa de películas:
- ✅ CRUD completo de películas con autorización por roles
- ✅ Sincronización automática con SWAPI mediante cron job
- ✅ Control de acceso granular:
  - **Usuarios Regulares**: Ver lista y detalles de películas
  - **Administradores**: Crear, actualizar, eliminar y sincronizar películas
- ✅ Integración con Auth Service para validación de tokens JWT
- ✅ Base de datos PostgreSQL independiente

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura hexagonal (puertos y adaptadores)** y **separación de microservicios**:

```
nestEjercicio/
├── auth-service/           # Microservicio de autenticación
│   ├── src/
│   │   ├── domain/        # Entidades, VOs, puertos
│   │   ├── application/   # Casos de uso
│   │   ├── infrastructure/# Adaptadores (DB, config)
│   │   └── presentation/  # Controladores, DTOs
│   ├── db/init/           # Scripts SQL inicialización
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── movies-service/        # Microservicio de películas
│   ├── src/
│   │   ├── domain/       # Entidades, interfaces
│   │   ├── application/  # Casos de uso, DTOs
│   │   └── infrastructure/# Repositorios, guards, cron
│   ├── db/movies/init/   # Scripts SQL inicialización
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── docker-compose.yml    # Orquestación completa
```

## 🚀 Cómo Levantar el Proyecto con Docker

### Requisitos Previos
- **Docker Desktop** instalado (incluye Docker Compose)
- **Puerto disponibles**: 3001, 3002, 5432, 5433

### Opción 1: Levantar Todo con Docker Compose (RECOMENDADO) 🐳

Desde la raíz del proyecto, ejecuta:

```powershell
# Construir y levantar todos los servicios
docker-compose up --build

# O en segundo plano (detached mode)
docker-compose up --build -d
```

Este comando levantará automáticamente:
- ✅ **auth-postgres**: Base de datos PostgreSQL para Auth Service (puerto 5432)
- ✅ **auth-service**: Microservicio de autenticación NestJS (puerto 3001)
- ✅ **movies-postgres**: Base de datos PostgreSQL para Movies Service (puerto 5433)
- ✅ **movies-service**: Microservicio de películas NestJS (puerto 3002)

**Los servicios esperarán automáticamente a que las bases de datos estén listas (healthcheck)** antes de iniciar.

### Verificar que Todo Está Funcionando

```powershell
# Ver el estado de los servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f auth-service
docker-compose logs -f movies-service
```

### Detener los Servicios

```powershell
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (borra las bases de datos)
docker-compose down -v
```

## 🌐 Acceso a los Servicios

### 🔐 Auth Service
- **API Base URL**: http://localhost:3001
- **Documentación Swagger**: http://localhost:3001/api-docs
- **Endpoints disponibles**:
  - `POST /auth/signup` - Registro de usuarios
  - `POST /auth/login` - Inicio de sesión

### 🎬 Movies Service
- **API Base URL**: http://localhost:3002
- **Documentación Swagger**: http://localhost:3002/api/docs
- **Endpoints disponibles**:
  - `GET /movies` - Listar películas (usuarios regulares y admin)
  - `GET /movies/:id` - Ver detalles (solo usuarios regulares)
  - `POST /movies` - Crear película (solo admin)
  - `PUT /movies/:id` - Actualizar película (solo admin)
  - `DELETE /movies/:id` - Eliminar película (solo admin)
  - `POST /movies/sync` - Sincronizar con SWAPI (solo admin)

### 🗄️ Bases de Datos

#### Auth PostgreSQL
- **Host**: localhost
- **Puerto**: 5432
- **Database**: authdb
- **Usuario**: authuser
- **Contraseña**: authpass

#### Movies PostgreSQL
- **Host**: localhost
- **Puerto**: 5433
- **Database**: moviesdb
- **Usuario**: moviesuser
- **Contraseña**: moviespass

## 🧪 Probar la API

### 1. Registrar un Usuario Administrador

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@starwars.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

### 2. Iniciar Sesión

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@starwars.com",
    "password": "Admin123!"
  }'
```

**Respuesta**: Obtendrás un `accessToken` (JWT) que debes usar en las siguientes peticiones.

### 3. Sincronizar Películas de SWAPI

```bash
curl -X POST http://localhost:3002/movies/sync \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 4. Listar Películas

```bash
curl -X GET http://localhost:3002/movies \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## 📚 Documentación Completa

- **Swagger Auth Service**: http://localhost:3001/api-docs
- **Swagger Movies Service**: http://localhost:3002/api/docs
- **Colección Postman**: `NEST STAR WARS ENDPOINT.postman_collection.json`

Ambos servicios incluyen documentación OpenAPI completa con ejemplos de peticiones y respuestas.

## 🔒 Sistema de Autenticación y Autorización

### Roles Implementados
- **`admin`**: Acceso completo (crear, actualizar, eliminar, sincronizar)
- **`user`** (regular): Solo lectura (listar y ver detalles)

### Flujo de Autenticación
1. Usuario se registra en `/auth/signup`
2. Usuario inicia sesión en `/auth/login` y recibe un JWT
3. Usuario incluye el JWT en el header `Authorization: Bearer <token>`
4. Movies Service valida el token con la misma clave secreta JWT
5. Guards verifican el rol del usuario para endpoints protegidos

## 🛠️ Comandos Útiles de Docker

```powershell
# Reconstruir un servicio específico
docker-compose build auth-service
docker-compose build movies-service

# Reiniciar un servicio
docker-compose restart auth-service
docker-compose restart movies-service

# Ejecutar comandos dentro de un contenedor
docker-compose exec auth-service sh
docker-compose exec movies-service sh

# Limpiar todo y empezar de cero
docker-compose down -v
docker image prune -f
docker-compose up --build
```

## 🐛 Solución de Problemas

### Error: Puerto ya en uso
Si obtienes un error de puerto en uso:
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# Modificar los puertos en docker-compose.yml si es necesario
```

### Las bases de datos no se inicializan
Los scripts SQL en `db/init/` se ejecutan solo en el primer arranque. Para reiniciar:
```powershell
docker-compose down -v  # Elimina los volúmenes
docker-compose up --build
```

### Error de conexión entre servicios
Verifica que todos los servicios estén en la misma red:
```powershell
docker network ls
docker network inspect nestejercicio_microservices-network
```

## 🏃 Ejecución sin Docker (Desarrollo Local)

Si prefieres ejecutar los servicios localmente sin Docker:

### 1. Instalar Dependencias

```powershell
# Auth Service
cd auth-service
npm install

# Movies Service
cd ../movies-service
npm install
```

### 2. Levantar Bases de Datos

```powershell
# En auth-service/
docker-compose up -d

# En movies-service/
docker-compose up -d
```

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env` en cada servicio y ajusta las configuraciones.

### 4. Ejecutar los Servicios

```powershell
# Auth Service
cd auth-service
npm run start:dev

# Movies Service (en otra terminal)
cd movies-service
npm run start:dev
```

## ✅ Características Implementadas

- ✅ Autenticación JWT completa
- ✅ Sistema de roles (admin/user)
- ✅ Arquitectura hexagonal
- ✅ Separación en microservicios
- ✅ Sincronización automática con SWAPI (cron job diario)
- ✅ Documentación Swagger completa
- ✅ Validaciones robustas con class-validator
- ✅ Base de datos PostgreSQL con TypeORM
- ✅ Docker y Docker Compose configurado
- ✅ Guards personalizados para autorización
- ✅ Value Objects para lógica de dominio
- ✅ Healthchecks para las bases de datos
- ✅ Scripts de inicialización de DB

## 📦 Tecnologías Utilizadas

- **Framework**: NestJS 11
- **Base de Datos**: PostgreSQL 16
- **ORM**: TypeORM
- **Autenticación**: JWT (Passport)
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Contenedorización**: Docker & Docker Compose
- **Arquitectura**: Hexagonal (Puertos y Adaptadores)

## 📄 Documentación Adicional

- [Auth Service Architecture](./auth-service/ARCHITECTURE.md)
- [Auth Service README](./auth-service/README.md)
- [Movies Service Architecture](./movies-service/ARCHITECTURE.md)
- [Movies Service README](./movies-service/README.md)
- [TypeORM Guide](./auth-service/TYPEORM_GUIDE.md)

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Los secretos JWT y contraseñas en los archivos de configuración son solo para desarrollo. 

**En producción**:
- Cambia todos los secretos JWT
- Usa variables de entorno seguras
- Implementa gestión de secretos (AWS Secrets Manager, Azure Key Vault, etc.)
- Configura HTTPS
- Implementa rate limiting
- Añade validación de CORS específica

## 👥 Autor

Kevin Caicedo - [KevinCaicedo1](https://github.com/KevinCaicedo1)

## 📝 Licencia

Este proyecto fue desarrollado como ejercicio práctico educativo." 
