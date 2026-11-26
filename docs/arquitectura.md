# Arquitectura de ClubSync

Monolito en capas con Node.js, TypeScript, Express y PostgreSQL.

## 1. Capas y dependencias

```mermaid
flowchart TD
    Cliente["Cliente HTTP<br/>Postman o PowerShell"]
    subgraph PRES["Presentación"]
        Rutas["Rutas y controladores<br/>auth.ts: roles · handle.ts: errores"]
    end
    subgraph APP["Aplicación"]
        Servicios["Casos de uso y validación<br/>AuthService · CreateAssignmentService<br/>SurveyServices · EnrollService"]
    end
    subgraph PERS["Persistencia"]
        Repos["Repositorios PostgreSQL<br/>consultas SQL parametrizadas"]
    end
    Dominio["Dominio<br/>modelos · interfaces de repositorio · AppError"]
    BD[("PostgreSQL<br/>clubsync")]

    Cliente -->|HTTP + JSON| Rutas
    Rutas --> Servicios
    Servicios --> Repos
    Repos --> BD
    Rutas -.usa.-> Dominio
    Servicios -.usa.-> Dominio
    Repos -.implementa.-> Dominio
```

| Capa | Responsabilidad | No debe hacer |
|---|---|---|
| Presentación | Recibir la solicitud HTTP, verificar el rol y responder con el código de estado | Reglas de negocio ni SQL |
| Aplicación | Coordinar cada caso de uso y validar las entradas | Conocer `req` o `res`, ni escribir SQL |
| Persistencia | Ejecutar consultas SQL y traducir errores de la base de datos | Validar reglas de negocio |
| Dominio | Modelos, interfaces de repositorio y `AppError` | Depender de otras capas |

Las dependencias van siempre hacia abajo. La aplicación depende de la interfaz del repositorio (dominio) y no de PostgreSQL, por eso los servicios se prueban con repositorios simulados.

## 2. Flujo de CS-01 Asignar horario y aula

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant Ruta as Ruta con requireRole
    participant Ctrl as AssignmentController
    participant Srv as CreateAssignmentService
    participant Repo as PostgresAssignmentRepository
    participant BD as PostgreSQL

    Admin->>Ruta: POST /api/assignments con token Bearer
    Ruta->>Ruta: verifica token y rol admin (401 o 403)
    Ruta->>Ctrl: create
    Ctrl->>Srv: execute con el cuerpo
    Srv->>Srv: valida los datos (400)
    Srv->>Repo: insert de la asignación
    Repo->>BD: INSERT INTO assignments
    alt Aula libre
        BD-->>Repo: fila creada
        Repo-->>Srv: Assignment
        Srv-->>Ctrl: Assignment
        Ctrl-->>Admin: 201 Created
    else Aula ocupada (violación UNIQUE 23505)
        BD-->>Repo: error 23505
        Repo-->>Admin: AppError 409 por el manejador central
    end
```

Los demás casos (CS-02 a CS-05) siguen el mismo recorrido: ruta con rol, controlador, servicio, repositorio y base de datos. Los errores de negocio se lanzan como `AppError` y un único manejador en `app.ts` los convierte en la respuesta HTTP.

## 3. Modelo de datos

```mermaid
erDiagram
    USERS ||--o{ VOTES : emite
    USERS ||--o{ ENROLLMENTS : realiza
    CLUBS ||--o| ASSIGNMENTS : tiene
    ROOMS ||--o{ ASSIGNMENTS : aloja
    CLUBS ||--o{ SURVEYS : convoca
    SURVEYS ||--o{ SURVEY_OPTIONS : ofrece
    SURVEYS ||--o{ VOTES : contiene
    SURVEY_OPTIONS ||--o{ VOTES : recibe
    CLUBS ||--o{ ENROLLMENTS : admite

    USERS {
        int id PK
        string email UK
        string role
    }
    ASSIGNMENTS {
        int club_id UK
        int room_id
        int day_of_week
        int start_hour
    }
    VOTES {
        int survey_id
        int student_id
        int option_id
    }
```

## 4. Reglas aplicadas en la base de datos

| Regla | Restricción | Escenario |
|---|---|---|
| R-01 Un aula no tiene dos clubes en el mismo horario | `UNIQUE (room_id, day_of_week, start_hour)` | QA-01 |
| Un club tiene una sola asignación | `UNIQUE (club_id)` | CS-01 |
| R-02 Un voto por estudiante y encuesta | `UNIQUE (survey_id, student_id)` | QA-07 |
| Una inscripción por estudiante y club | `PRIMARY KEY (club_id, student_id)` | CS-05 |
| R-05 Solo dos roles válidos | `CHECK (role IN ('admin', 'estudiante'))` | QA-02 |

La base de datos garantiza estas reglas incluso con peticiones simultáneas, y el repositorio traduce el error `23505` a `409` y el `23503` a `404`.

## 5. Decisiones de diseño

- **Monolito en capas:** un solo despliegue, simple de ejecutar y probar para el alcance del proyecto.
- **Interfaces de repositorio en el dominio:** permiten probar los servicios sin base de datos.
- **Autenticación con JWT y roles en la capa de presentación:** el control de acceso (QA-02) queda separado de las reglas de negocio.
- **Contrato OpenAPI como acuerdo con el cliente:** `docs/openapi.yaml`, publicado en `GET /openapi.yaml`.