# Bitácora del proyecto — ClubSync

## Semana 1 — Inicio
- Fecha: 05/11/2026
- Integrantes presentes: Cristhian Alejandro Jara Baldeón (trabajo individual)
- Actividad realizada: definición del problema, alcance y casos de uso de ClubSync (gestión de clubes extracurriculares con asignación de aulas y horarios, y encuestas de horario).
- Decisiones tomadas: dos roles (administrador y estudiante); cinco casos de uso primarios (CS-01 a CS-05); las reglas de aulas y votos se aplican como restricciones de base de datos.
- Dudas pendientes: validar con un coordinador real cómo se asignan hoy los horarios y las aulas (las fuentes de la Parte 1 y 2 son simuladas).
- Próximos pasos: escenarios de calidad y árbol de utilidad (Parte 2); luego implementación.

## Semana 5 — Implementación, contrato y pruebas
- Fecha: 24/11/2026 al 25/11/2026
- Integrantes presentes: Cristhian Alejandro Jara Baldeón (trabajo individual)
- Flujos revisados: CS-01 asignar horario y aula, CS-02 crear encuesta, CS-03 votar, CS-04 cerrar encuesta, CS-05 inscribirse a un club, y autenticación con roles.
- Contrato: `docs/openapi.yaml` (OpenAPI 3.0.3), servido en `/openapi.yaml`; 8 operaciones de negocio más `/health` y `/openapi.yaml`.
- Pruebas: 36 pruebas en 5 archivos (unitarias de servicios, repositorio y HTTP con `Pool` simulado), más la prueba del contrato; ver `tests/`. Verificación manual con Postman, evidencias en `docs/evidencias/` y colección en `docs/postman/`.
- Decisiones o cambios realizados por el equipo: se adaptó la plantilla de reservas al dominio de asignaciones; PostgreSQL local en lugar de Docker; las reglas R-01, R-02 y R-04 se aplican con restricciones UNIQUE y CHECK en la base de datos; R-03 pasa a supuesto por validar; se centralizó el manejo de errores con `AppError`.
- Hallazgos y dudas pendientes: el cupo de CS-05 puede excederse con peticiones simultáneas; los escenarios QA-03 a QA-06 no se miden en esta entrega; falta validar las fuentes con personas reales.
- Próximos pasos: README, diagrama de arquitectura y limpieza de archivos de la plantilla; ensayo de la exposición.