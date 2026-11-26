# ClubSync — Gestión de clubes extracurriculares

Proyecto integrador de Arquitectura de Software (RdA 1, Criterio 2).
Autor: Cristhian Alejandro Jara Baldeón · PUCE Sede Manabí · 4.º semestre, paralelo "B" · Período 2026-02.

ClubSync permite que un administrador asigne horario y aula a cada club sin conflictos, y que los estudiantes voten en encuestas para elegir el mejor horario y se inscriban a los clubes. Es un monolito en capas con Node.js, TypeScript, Express y PostgreSQL.

## Qué incluye esta versión

| Caso de uso | Operación | Rol |
|---|---|---|
| Autenticación | `POST /api/auth/register`, `POST /api/auth/login` | Todos |
| CS-01 Asignar horario y aula | `POST /api/assignments`, `GET /api/assignments` | Administrador (crear) |
| CS-02 Crear encuesta de horario | `POST /api/surveys` | Administrador |
| CS-03 Votar en una encuesta | `POST /api/surveys/{id}/votes` | Estudiante |
| CS-04 Cerrar encuesta y decidir horario | `POST /api/surveys/{id}/close` | Administrador |
| CS-05 Inscribirse a un club | `POST /api/clubs/{id}/enrollments` | Estudiante |
| Soporte | `GET /health`, `GET /openapi.yaml` | Todos |

Reglas y escenarios de calidad que cubre:

- Un aula no puede tener dos clubes en el mismo bloque horario (R-01, QA-01).
- Un estudiante vota una sola vez por encuesta (R-02, QA-07).
- Solo el administrador gestiona aulas, horarios y encuestas (R-05, QA-02).
- Contrato de API en `docs/openapi.yaml`, también publicado en `GET /openapi.yaml`.
- 36 pruebas automatizadas con Vitest más una prueba del contrato.
- Bitácora de incrementos y trazabilidad con los drivers en `docs/bitacora.md`.

## Arquitectura

```text
Cliente HTTP (Postman, navegador)
    -> presentación   (rutas, controladores, autenticación por rol)
    -> aplicación     (casos de uso y validación)
    -> persistencia   (consultas SQL parametrizadas)
    -> PostgreSQL
```

El controlador traduce HTTP, la aplicación coordina cada caso de uso y valida la entrada, y el repositorio ejecuta las consultas. Las reglas de consistencia (aula única por horario, un voto por estudiante) también se protegen con restricciones `UNIQUE` en la base de datos. Las dependencias van siempre hacia abajo: presentación, aplicación, persistencia y dominio.

```text
src/
├── presentation/   rutas, controladores, auth.ts (roles) y handle.ts
├── application/    casos de uso: asignaciones, encuestas, votos, cierre, inscripciones, auth
├── persistence/    repositorios PostgreSQL
├── domain/         modelos, interfaces de repositorio y AppError
├── config.ts       lectura del secreto JWT
├── app.ts          composición de capas y middleware Express
└── server.ts       configuración del servidor y del pool de PostgreSQL
db/init/            esquema SQL e inserción de datos iniciales (aulas y clubes)
docs/               openapi.yaml, bitacora.md, evidencias/ y postman/
tests/              pruebas con Vitest
```

## Requisitos

- Node.js 24 o superior y npm.
- PostgreSQL, de una de estas dos formas: Docker Desktop con Docker Compose, o una instalación local de PostgreSQL.
- Git.

## Instalar y ejecutar

En PowerShell, desde la raíz del proyecto:

```powershell
Copy-Item .env.example .env
npm ci
```

### Opción A. Base de datos con Docker

```powershell
docker compose up -d db
npm run dev
```

PostgreSQL ejecuta `db/init/001_schema.sql` solo la primera vez que se crea el volumen. Para reiniciar la base desde cero:

```powershell
docker compose down -v
docker compose up -d db
```

### Opción B. PostgreSQL instalado en el equipo

1. Crea la base de datos `clubsync` (por ejemplo, desde pgAdmin).
2. Abre una consola de consultas sobre `clubsync` y ejecuta el contenido de `db/init/001_schema.sql`.
3. Ajusta los datos de conexión en `.env` (ver la sección de configuración).
4. Ejecuta `npm run dev`.

La API queda disponible en `http://localhost:3000`. `GET /health` comprueba que el proceso HTTP está activo.

## Configuración

`.env` está excluido de Git. `.env.example` contiene valores locales de demostración. Variables principales:

| Variable | Uso |
|---|---|
| `PORT` | Puerto de la API (3000 por defecto) |
| `DATABASE_URL` o `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a PostgreSQL; la base es `clubsync` |
| `JWT_SECRET` | Secreto para firmar los tokens; usa un valor local de desarrollo |

No agregues contraseñas reales, tokens ni datos personales reales al repositorio.

## Explorar el contrato

Abre `http://localhost:3000/openapi.yaml` (el navegador descarga el archivo) o importa `docs/openapi.yaml` en [Swagger Editor](https://editor.swagger.io) para ver todas las operaciones, esquemas y códigos de respuesta.

## Probar manualmente los flujos

Cada paso muestra el resultado esperado. Hay una colección de Postman con todas las pruebas en `docs/postman/`, y capturas en `docs/evidencias/`.

Registrar un administrador y un estudiante (el rol `admin` solo se permite para desarrollo y demostración):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/register `
  -ContentType "application/json" `
  -Body '{"name":"Admin","email":"admin@test.com","password":"123456","role":"admin"}'

Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/register `
  -ContentType "application/json" `
  -Body '{"name":"Estudiante","email":"estudiante1@test.com","password":"123456"}'
```

Iniciar sesión y guardar el token del administrador:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","password":"123456"}'
$admin = @{ Authorization = "Bearer $($login.token)" }
```

CS-01. Asignar aula y horario (responde `201`; repetirla responde `409`):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/assignments `
  -Headers $admin -ContentType "application/json" `
  -Body '{"clubId":2,"roomId":2,"dayOfWeek":3,"startHour":9}'
```

Consultar las asignaciones (`200`):

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/assignments
```

Resumen de respuestas: `201` creación correcta, `200` consulta o cierre correctos, `400` datos inválidos, `401` sin sesión o token vencido, `403` rol sin permiso, `404` recurso inexistente y `409` conflicto (aula ocupada, voto repetido, encuesta cerrada, sin cupo). El flujo completo de encuestas, voto, cierre e inscripción está en la colección de Postman.

## Ejecutar las pruebas

```powershell
npm test
npm run build
```

Las pruebas unitarias de servicios y la del repositorio usan dobles, sin base de datos activa. Las pruebas HTTP ejercitan Express y las capas del flujo con un `Pool` simulado. La verificación manual con PostgreSQL y Postman complementa esas pruebas.

| Archivo | Qué cubre |
|---|---|
| `tests/CreateAssignmentService.test.ts` | CS-01, validaciones y conflicto de aula |
| `tests/PostgresAssignmentRepository.test.ts` | SQL parametrizado y traducción de errores de base de datos |
| `tests/SurveyAndEnrollment.test.ts` | CS-02 a CS-05, voto repetido, empate y cupo |
| `tests/AuthService.test.ts` | Registro con hash, login y credenciales incorrectas |
| `tests/ClubSyncApi.test.ts` | Seguridad por rol (403 y 401) y flujos HTTP |
| `tests/OpenApi.test.ts` | Rutas, códigos y seguridad del contrato |

## Documentación

- `docs/openapi.yaml`: contrato de la API.
- `docs/bitacora.md`: incrementos, cambios y trazabilidad con los drivers.
- `docs/evidencias/`: capturas de las peticiones de cada caso de uso.
- `docs/postman/`: colección de Postman con las pruebas manuales.

## Limitaciones conocidas

- El cupo de CS-05 puede excederse con peticiones simultáneas; la solución prevista es una transacción con bloqueo.
- El registro permite crear administradores solo para demostración.
- No incluye interfaz gráfica; se prueba con Postman o PowerShell.

## Declaración de herramientas

Para el apoyo en las pruebas se utilizó ayuda de una IA como guía para realizar las pruebas, el código no fue generado con IA
