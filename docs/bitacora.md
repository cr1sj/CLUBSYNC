# Bitácora del proyecto — ClubSync

Autor: Cristhian Alejandro Jara Baldeón

Asignatura: Arquitectura de Software, 4.º semestre, paralelo "B", PUCE Sede Manabí, período 2026-02.

Docente: Ing. Francois Fernandez.

## Convención de identificadores

| Prefijo | Significado | Origen |
|---|---|---|
| FU-xx | Fuente de información | Semanas 2 y 3 |
| CS-xx | Caso de uso primario | Semana 2 (CS-06 se añade en la semana 5) |
| R-xx | Regla, restricción o supuesto | Semana 2 |
| QA-xx | Escenario de calidad | Semana 3 |
| AUTH-xx, VAL-xx, UI-xx | Apoyos de autenticación, validaciones y evidencias de la interfaz | Semana 5 |

## Semana 1 — Inicio
- Fecha: 05/11/2026
- Integrantes presentes: Cristhian Alejandro Jara Baldeón (trabajo individual).
- Actividad realizada: definición de la idea del proyecto integrador: ClubSync, un sistema de gestión de clubes extracurriculares donde el administrador asigna horarios y aulas, y los estudiantes participan en encuestas para elegir el mejor horario.
- Decisiones tomadas: dos roles (administrador y estudiante); el proyecto se desarrolla de forma individual, aunque las instrucciones hablan de equipo, y se informa al docente.
- Dudas pendientes: cómo se asignan hoy los horarios y las aulas en una institución real; qué fuentes se podrán consultar.
- Próximos pasos: documento de identificación de drivers (Parte 1).

## Semana 2 — Identificación de drivers (Criterio 1, Parte 1)
- Fecha: 05/11/2026 (elaboración); la calificación se conoció el 12/11/2026.
- Integrantes presentes: Cristhian Alejandro Jara Baldeón.
- Actividad realizada: documento `C1P1_CLUBSYNC_JARA_CRISTHIAN.pdf` con visión y alcance, fuentes de información, cinco casos de uso primarios (CS-01 a CS-05), restricciones, reglas y supuestos (R-01 a R-05), preocupaciones iniciales de calidad y trazabilidad.
- Decisiones tomadas: casos de uso centrados en la asignación de horarios y aulas, las encuestas de horario y las inscripciones; exclusiones: pagos, app móvil nativa, chat, asistencia y calificaciones, integración con sistemas reales y notificaciones push.
- Resultado: 40,67 de 50 (nivel B). Fortalezas: visión, contexto y alcance (91 %, nivel A). Mejoras señaladas: fuentes y trazabilidad (70 %, nivel C), porque las fuentes seguían como "por hacer" y los identificadores eran inconsistentes (`CS`, `F` y `CU` mezclados); organización (73 %, nivel C), por la falta de referencias y de declaración de herramientas e IA; y los casos de uso sin columna de fuente.
- Hallazgos y dudas pendientes: las fuentes son simuladas.
- Próximos pasos: corregir los identificadores, vincular cada caso y regla a una fuente, y construir los escenarios de calidad (Parte 2).

## Semana 3 — Escenarios de calidad y árbol de utilidad (Criterio 1, Parte 2)
- Fecha: 12/11/2026
- Integrantes presentes: Cristhian Alejandro Jara Baldeón.
- Actividad realizada: documento `C1P2_ClubSync_Jara.pdf` con continuidad con la Parte 1, método y supuestos, siete escenarios completos de seis atributos (QA-01 a QA-07), árbol de utilidad, priorización con valor de negocio y riesgo técnico, tres trade-offs y validación.
- Decisiones tomadas: las fuentes se renombran FU-01 a FU-05 para no confundirse con los casos CS; R-03 pasa de restricción técnica a Confirmado; las sesiones del taller QAW (fuentes FU-01, FU-02 y FU-05) se declaran **simuladas** y sus hallazgos como hipótesis; escala de 1 a 3 para negocio y riesgo, con excepción justificada para seguridad; prioridad alta para QA-01, QA-03, QA-02 y QA-07.
- Trade-offs identificados: consistencia frente a desempeño, seguridad frente a usabilidad, y modificabilidad frente a simplicidad.
- Próximos pasos: implementar el monolito en capas, el contrato de API y las pruebas (Criterio 2).

## Semana 5 — Implementación, contrato y pruebas (Criterio 2)
- Fecha: 24/11/2026 al 25/11/2026
- Integrantes presentes: Cristhian Alejandro Jara Baldeón.
- Flujos revisados: CS-01 asignar horario y aula, CS-02 crear encuesta, CS-03 votar, CS-04 cerrar encuesta, CS-05 inscribirse a un club, CS-06 gestionar clubes y aulas (añadido por la interfaz), autenticación con roles e interfaz web.
- Contrato: `docs/openapi.yaml` (OpenAPI 3.0.3, versión 1.1.0), servido en `/openapi.yaml`; validado en Swagger Editor.
- Pruebas: 50 pruebas en 7 archivos (unitarias de servicios, repositorio y HTTP con `Pool` simulado, más la prueba del contrato); ver `tests/`. Verificación manual con la interfaz y Postman; evidencias en `docs/evidencias/` y colección en `docs/postman/`.
- Decisiones o cambios realizados por el equipo: se adaptó la plantilla de reservas al dominio de asignaciones; PostgreSQL local en lugar de Docker; las reglas R-01, R-02 y R-04 se aplican con restricciones UNIQUE y CHECK en la base de datos; se centralizó el manejo de errores con `AppError`; el docente solicitó una interfaz de usuario y se sirve desde `public/` con el mismo Express.
- Hallazgos y dudas pendientes: el cupo de CS-05 puede excederse con peticiones simultáneas; no existe lista de espera ni cancelación de inscripciones.

### Registro de incrementos de la semana 5

| # | Fecha | Flujo o driver | Archivos o componentes | Pruebas ejecutadas | Resultado | Pendientes |
|---|---|---|---|---|---|---|
| 1 | 24/11/2026 | Base del proyecto (plantilla del curso) | Estructura clonada de `monolito-reservas-ts`; `package.json`, `compose.yaml`, `.env.example`, `tsconfig.json` | `npm ci`, `npm test` de la plantilla | Dependencias instaladas y pruebas de la plantilla en verde | Adaptar la plantilla a ClubSync |
| 2 | 24/11/2026 | Persistencia: R-01, R-02, R-04 | `db/init/001_schema.sql` con tablas `users`, `rooms`, `clubs`, `assignments`, `surveys`, `survey_options`, `votes`, `enrollments` y restricciones UNIQUE y CHECK | Ejecución del esquema en PostgreSQL local (pgAdmin) | Tablas creadas con las reglas como restricciones de base de datos | Ninguno |
| 3 | 25/11/2026 | CS-01 Asignar horario y aula; QA-01 | `domain/assignment.ts`, `domain/errors.ts`, `application/CreateAssignmentService.ts`, `application/ListAssignmentsService.ts`, `persistence/PostgresAssignmentRepository.ts`, `presentation/AssignmentController.ts`, `presentation/assignmentRoutes.ts`, `app.ts` | Postman: `POST /api/assignments` | 201 al crear; 409 ante conflicto de aula | Proteger la ruta con roles |
| 4 | 25/11/2026 | Autenticación con roles; QA-02; R-05 | `domain/user.ts`, `application/AuthService.ts`, `persistence/PostgresUserRepository.ts`, `presentation/AuthController.ts`, `presentation/authRoutes.ts`, `presentation/auth.ts`, `presentation/handle.ts`, `config.ts` | Postman: AUTH-01 a AUTH-05; QA-02 y QA-02.1 | Registro y login con token; 403 con rol incorrecto, 401 sin token | Restringir la creación de administradores |
| 5 | 25/11/2026 | CS-02 Crear encuesta; CS-03 Votar; CS-04 Cerrar; QA-07 | `domain/survey.ts`, `application/SurveyServices.ts`, `persistence/PostgresSurveyRepository.ts`, `presentation/SurveyController.ts`, `presentation/surveyRoutes.ts` | Postman: CS-02, CS-03, QA-07, CS-04, CS-03.1 | Encuesta creada (201), voto registrado (201), voto repetido (409), cierre con ganador (200), voto en encuesta cerrada (409) | Cubrir el empate con pruebas |
| 6 | 25/11/2026 | CS-05 Inscribirse a un club | `domain/enrollment.ts`, `application/EnrollService.ts`, `persistence/PostgresEnrollmentRepository.ts`, `presentation/EnrollmentController.ts`, `presentation/enrollmentRoutes.ts` | Postman: CS-05, CS-05.1 | Inscripción registrada (201); repetida (409) | Control de cupo con concurrencia; lista de espera |
| 7 | 25/11/2026 | Evidencias de los flujos | `docs/evidencias/*.png`, colección Postman en `docs/postman/` | 16 capturas de las peticiones principales | Los 5 casos de uso y QA-01, QA-02, QA-07 verificados de punta a punta | Ninguno |
| 8 | 25/11/2026 | Pruebas automatizadas (QA-01, QA-02, QA-07; CS-01 a CS-05) | `tests/CreateAssignmentService.test.ts`, `tests/PostgresAssignmentRepository.test.ts`, `tests/SurveyAndEnrollment.test.ts`, `tests/AuthService.test.ts`, `tests/ClubSyncApi.test.ts`; se reemplazan las pruebas de reservas de la plantilla | `npm test`, `npm run build` | 5 archivos y 36 pruebas aprobadas; `tsc` compila sin errores | Prueba del contrato OpenAPI |
| 9 | 25/11/2026 | Contrato de API | `docs/openapi.yaml` reescrito para ClubSync; `tests/OpenAPI.test.ts` | Validación en Swagger Editor sin errores; `GET /openapi.yaml` devuelve el documento nuevo | Contrato alineado con la implementación; 46 pruebas en 6 archivos | Actualizarlo ante cambios |
| 10 | 25/11/2026 | Documentación y limpieza | `README.md`, `docs/arquitectura.md`, `docs/contexto.md`, `.env.example`, `package.json`; se eliminan archivos de la plantilla | Revisión manual; `npm test` y `npm run build` | Documentación completa | Mantenerla actualizada |
| 11 | 25/11/2026 | CS-06 Gestionar clubes y aulas; interfaz web solicitada por el docente | `domain/catalog.ts`, `domain/surveyQuery.ts`, `application/CatalogService.ts`, `application/ListSurveysService.ts`, `persistence/PostgresCatalogRepository.ts`, `persistence/PostgresSurveyQueryRepository.ts`, `presentation/CatalogController.ts`, `presentation/catalogRoutes.ts`, `public/index.html`, `app.ts`, `docs/openapi.yaml` (v1.1.0), `tests/CatalogService.test.ts` | `npm test` (50 pruebas en 7 archivos), `npm run build`, Swagger Editor, recorrido manual de la interfaz | Interfaz funcionando con ambos roles; clubes y aulas creados con nombre; contrato actualizado | Capturas de la interfaz (UI-01 a UI-04) |

### Cambios y decisiones del ciclo de vida

| Fecha | Cambio | Motivo |
|---|---|---|
| 24/11/2026 | Se adopta la plantilla TypeScript del curso | Reutilizar la estructura de capas, el contrato y la estrategia de pruebas con los que se evalúa |
| 24/11/2026 | Se usa PostgreSQL instalado en el equipo | Docker Desktop no estaba disponible en el equipo de desarrollo; el README documenta ambas formas |
| 25/11/2026 | "Reservas" pasan a "asignaciones" de aula y horario | Adaptar el dominio de la plantilla al problema de ClubSync (CS-01) |
| 25/11/2026 | Las reglas R-01 y R-02 se aplican con restricciones UNIQUE en la base de datos | Garantizar consistencia aun con peticiones simultáneas (QA-01, QA-07) |
| 25/11/2026 | Los errores se centralizan con `AppError` y un manejador único en `app.ts` | Mantener la capa de presentación sin lógica de negocio |
| 25/11/2026 | Se elimina `moduleResolution` de `tsconfig.json` | Evitar la advertencia de deprecación de TypeScript 6 sin romper TypeScript 5 |
| 25/11/2026 | La conexión a la base usa solo las variables `DB_*` | Es lo que lee `server.ts`; se elimina `DATABASE_URL` para evitar configuraciones contradictorias |
| 25/11/2026 | Se añade CS-06 y una interfaz web en `public/` | El docente solicitó una interfaz de usuario y la creación de clubes con nombre |
| 25/11/2026 | `CatalogService` pasa a métodos asíncronos | Que los errores de validación sean siempre promesas rechazadas, igual que los demás servicios |

### Trazabilidad con los drivers

| Driver | Implementación | Evidencia |
|---|---|---|
| CS-01 Asignar horario y aula | `CreateAssignmentService`, `PostgresAssignmentRepository`, `POST /api/assignments` | Postman CS-01; `CreateAssignmentService.test.ts` |
| CS-02 Crear encuesta | `CreateSurveyService`, `POST /api/surveys` | Postman CS-02; `SurveyAndEnrollment.test.ts` |
| CS-03 Votar | `VoteService`, `POST /api/surveys/{id}/votes` | Postman CS-03 y CS-03.1; pruebas de `VoteService` |
| CS-04 Cerrar encuesta | `CloseSurveyService`, `POST /api/surveys/{id}/close` | Postman CS-04; pruebas de empate y cierre |
| CS-05 Inscribirse | `EnrollService`, `POST /api/clubs/{id}/enrollments` | Postman CS-05 y CS-05.1; pruebas de cupo y horario |
| CS-06 Gestionar clubes y aulas | `CatalogService`, `/api/clubs`, `/api/rooms`, interfaz web | `CatalogService.test.ts`; recorrido de la interfaz |
| QA-01 Consistencia de aulas | UNIQUE (`room_id`, `day_of_week`, `start_hour`), traducción del error 23505 a 409 | Postman QA-01; pruebas del repositorio y de la API |
| QA-02 Control de acceso | Middleware `requireRole` | Postman QA-02 y QA-02.1; `ClubSyncApi.test.ts` |
| QA-07 Un voto por estudiante | UNIQUE (`survey_id`, `student_id`) | Postman QA-07; pruebas de `VoteService` y de la API |

### Pendientes y limitaciones conocidas

- QA-03 (desempeño en el pico de votación), QA-04 (usabilidad), QA-05 (modificabilidad) y QA-06 (disponibilidad) no se miden en esta entrega; solo se implementan QA-01, QA-02 y QA-07.
- El control de cupo (CS-05) consulta y luego inserta; con peticiones simultáneas puede excederse el cupo. Solución prevista: transacción con bloqueo (`SELECT ... FOR UPDATE`).
- No hay lista de espera ni cancelación de inscripciones; un club lleno responde 409.
- El registro permite crear administradores solo para demostración.
- Las fuentes de las semanas 2 y 3 son simuladas.
- Las pruebas usan un `Pool` simulado; no hay pruebas de integración contra PostgreSQL real ni pruebas automáticas de la interfaz.
- La interfaz es mínima: sin estilos avanzados y con el token guardado en `localStorage`.

## Declaración de herramientas

Los códigos no fueron generados por Inteligencia Artificial, fueron tomados de ejercicios realizados en la asignatura de Desarrollo de Aplicaciones Web.