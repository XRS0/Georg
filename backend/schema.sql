
-- Database Schema for FitGram

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    username VARCHAR(255),
    photo_url TEXT,
    streak_count INT DEFAULT 0,
    last_workout_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    difficulty difficulty_level NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial data
INSERT INTO exercises (name, muscle_group, difficulty, video_url, thumbnail_url, description) VALUES
('Pushups', 'Chest', 'Beginner', 'https://cdn.example.com/videos/pushups.mp4', 'https://cdn.example.com/thumbs/pushups.jpg', 'Traditional pushups for upper body strength.'),
('Diamond Pushups', 'Triceps', 'Advanced', 'https://cdn.example.com/videos/diamond.mp4', 'https://cdn.example.com/thumbs/diamond.jpg', 'Target triceps with a narrow hand position.'),
('Squats', 'Legs', 'Beginner', 'https://cdn.example.com/videos/squats.mp4', 'https://cdn.example.com/thumbs/squats.jpg', 'Bodyweight squats for leg strength.');
