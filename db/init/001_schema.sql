CREATE TABLE users(id SERIAL PRIMARY KEY, name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','estudiante')));
CREATE TABLE rooms(id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, capacity INT NOT NULL);
CREATE TABLE clubs(id SERIAL PRIMARY KEY, name TEXT NOT NULL, capacity INT NOT NULL);
CREATE TABLE assignments(id SERIAL PRIMARY KEY,
  club_id INT UNIQUE NOT NULL REFERENCES clubs(id),
  room_id INT NOT NULL REFERENCES rooms(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_hour INT NOT NULL CHECK (start_hour BETWEEN 7 AND 21),
  UNIQUE (room_id, day_of_week, start_hour));
CREATE TABLE surveys(id SERIAL PRIMARY KEY, club_id INT NOT NULL REFERENCES clubs(id),
  closes_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'abierta');
CREATE TABLE survey_options(id SERIAL PRIMARY KEY,
  survey_id INT NOT NULL REFERENCES surveys(id), day_of_week INT NOT NULL, start_hour INT NOT NULL);
CREATE TABLE votes(id SERIAL PRIMARY KEY, survey_id INT NOT NULL REFERENCES surveys(id),
  option_id INT NOT NULL REFERENCES survey_options(id),
  student_id INT NOT NULL REFERENCES users(id),
  UNIQUE (survey_id, student_id));
CREATE TABLE enrollments(club_id INT REFERENCES clubs(id),
  student_id INT REFERENCES users(id), PRIMARY KEY (club_id, student_id));
INSERT INTO rooms(name,capacity) VALUES ('Aula 101',30),('Aula 102',25),('Laboratorio',20);
INSERT INTO clubs(name,capacity) VALUES ('Club de Robótica',20),('Club de Ajedrez',15);