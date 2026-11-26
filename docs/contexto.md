# Contexto del sistema

## Problema
La asignación de horarios y aulas de los clubes extracurriculares se hace de forma manual o dispersa. Esto genera choques de aula, aulas mal asignadas y horarios que no se ajustan a la disponibilidad de los estudiantes.

## Usuarios e interesados
- Administrador o coordinador de actividades: crea clubes y aulas, asigna horarios, crea y cierra encuestas.
- Estudiantes: votan por el mejor horario y se inscriben a los clubes.
- Líderes o tutores de club y personal que gestiona las aulas: interesados indirectos.
- Docente evaluador.

## Objetivo
Centralizar la gestión de clubes extracurriculares: que el administrador asigne horario y aula sin conflictos y que los estudiantes participen en encuestas para elegir el mejor horario y se inscriban a los clubes, todo desde una interfaz web sencilla.

## Alcance inicial
- Inicio de sesión con dos roles (administrador y estudiante).
- CS-06 gestionar clubes y aulas con nombre y capacidad.
- CS-01 asignar horario y aula con validación de conflictos.
- CS-02 crear encuesta de horario.
- CS-03 votar en una encuesta (un voto por estudiante).
- CS-04 cerrar la encuesta y decidir el horario ganador.
- CS-05 inscribirse a un club con control de cupo.
- Interfaz web en HTML y JavaScript servida por el mismo servidor.
- Contrato de API en OpenAPI y pruebas automatizadas.
- Fuera de alcance: pagos, aplicación móvil nativa, chat, asistencia y calificaciones, integración con sistemas académicos reales, notificaciones push e interfaz con estilos avanzados.

## Restricciones conocidas
- R-01 (regla): un aula no puede tener dos clubes en el mismo bloque horario.
- R-02 (regla): cada estudiante vota una sola vez por encuesta.
- R-03: el sistema es un monolito en capas con Node.js, TypeScript, Express y PostgreSQL, según la tecnología de referencia del curso.
- R-04: los horarios son bloques fijos de una hora.
- R-05 (condición de negocio): solo el administrador gestiona clubes, aulas, horarios y encuestas.

## Preguntas por investigar
- ¿Cómo se asignan hoy los horarios y las aulas? Las fuentes de las Partes 1 y 2 son simuladas
- ¿Cuántos estudiantes votan a la vez al abrir una encuesta? El supuesto de 20 votos concurrentes es la suposición considerando en la Pontificia Universidad Católica del Ecuador recién se establecieron los cursos en la sede Manta.
- ¿Cómo debe resolverse el empate al cerrar una encuesta? Lo decide el administrador.
- ¿Debe haber lista de espera cuando un club llena su cupo? CCuando el estudiante intenta inscribirse y enrolled >= capacity, EnrollService lanza un AppError(409, 'El club no tiene cupo disponible.'). Esa regla está en la capa de aplicación, y la interfaz lo muestra en rojo con el código 409. No se guarda nada: el estudiante queda fuera y debe intentarlo de nuevo si se libera un cupo.