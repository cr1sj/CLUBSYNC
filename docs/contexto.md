# Contexto del sistema

## Problema
La asignación de horarios y aulas de los clubes extracurriculares se hace de forma manual o dispersa (supuesto por validar). Esto genera choques de aula, aulas mal asignadas y horarios que no se ajustan a la disponibilidad de los estudiantes.

## Usuarios e interesados
- Administrador o coordinador de actividades: asigna horarios y aulas, crea y cierra encuestas.
- Estudiantes: votan por el mejor horario y se inscriben a los clubes.
- Líderes o tutores de club y personal que gestiona las aulas: interesados indirectos.
- Docente evaluador.

## Objetivo
Centralizar la gestión de clubes extracurriculares: que el administrador asigne horario y aula sin conflictos y que los estudiantes participen en encuestas para elegir el mejor horario y se inscriban a los clubes.

## Alcance inicial
- Inicio de sesión con dos roles (administrador y estudiante).
- CS-01 asignar horario y aula con validación de conflictos.
- CS-02 crear encuesta de horario.
- CS-03 votar en una encuesta (un voto por estudiante).
- CS-04 cerrar la encuesta y decidir el horario ganador.
- CS-05 inscribirse a un club con control de cupo.
- Contrato de API en OpenAPI y pruebas automatizadas.
- Fuera de alcance: pagos, aplicación móvil nativa, chat, asistencia y calificaciones, integración con sistemas académicos reales, notificaciones push e interfaz gráfica.

## Restricciones conocidas
- R-01 (regla): un aula no puede tener dos clubes en el mismo bloque horario.
- R-02 (regla): cada estudiante vota una sola vez por encuesta.
- R-03 (supuesto por validar): el sistema es un monolito en capas con Node.js, TypeScript, Express y PostgreSQL, según la tecnología de referencia del curso.
- R-04 (supuesto por validar): los horarios son bloques fijos de una hora.
- R-05 (condición de negocio): solo el administrador gestiona aulas, horarios y encuestas.

## Preguntas por investigar
- ¿Cómo se asignan hoy los horarios y las aulas? Las fuentes de las Partes 1 y 2 son simuladas y deben validarse con un coordinador real.
- ¿Cuántos estudiantes votan a la vez al abrir una encuesta? El supuesto de 100 votos concurrentes está sin confirmar.
- ¿Cómo debe resolverse el empate al cerrar una encuesta? Hoy lo decide el administrador.
- ¿Debe haber lista de espera cuando un club llena su cupo? Queda fuera de esta versión.