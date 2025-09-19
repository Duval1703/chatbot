-- MediChat AI Database Setup Script
-- PostgreSQL Database Schema for Medical Chatbot

-- Create database (run this separately)
-- CREATE DATABASE medichat_ai;

-- Connect to the database and run the following:

-- Users table for patient authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'english',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Messages table for chat history
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender VARCHAR(10) CHECK (sender IN ('user', 'bot')),
    language VARCHAR(10) DEFAULT 'english',
    message_type VARCHAR(20) DEFAULT 'text', -- text, voice, image
    metadata JSONB, -- for storing additional message data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translation cache table for performance
CREATE TABLE translation_cache (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    translation_service VARCHAR(50), -- google, microsoft, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical knowledge base (optional for RAG)
CREATE TABLE medical_knowledge (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'english',
    tags TEXT[], -- array of tags for searching
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Audit log for security and debugging
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_translation_cache_lookup ON translation_cache(source_text, source_language, target_language);
CREATE INDEX idx_medical_knowledge_category ON medical_knowledge(category);
CREATE INDEX idx_medical_knowledge_language ON medical_knowledge(language);
CREATE INDEX idx_medical_knowledge_tags ON medical_knowledge USING GIN(tags);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_knowledge_updated_at BEFORE UPDATE ON medical_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample medical knowledge (in multiple languages)
INSERT INTO medical_knowledge (title, content, category, language, tags) VALUES
('Common Cold Symptoms', 'Common cold symptoms include runny nose, sore throat, cough, and congestion. Rest and hydration are important for recovery.', 'respiratory', 'english', ARRAY['cold', 'symptoms', 'respiratory']),
('Hypertension Basics', 'High blood pressure often has no symptoms but can lead to serious health problems. Regular monitoring and lifestyle changes are essential.', 'cardiovascular', 'english', ARRAY['hypertension', 'blood pressure', 'cardiovascular']),
('Diabetes Management', 'Type 2 diabetes can be managed through diet, exercise, medication, and regular blood sugar monitoring.', 'endocrine', 'english', ARRAY['diabetes', 'blood sugar', 'management']);

-- Insert sample data for testing (optional)
-- INSERT INTO users (email, password_hash, full_name, date_of_birth, phone, preferred_language) VALUES
-- ('patient@example.com', '$2b$12$hashedpassword', 'John Doe', '1990-01-01', '+237123456789', 'english');

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Database connection string for your application:
-- postgresql://username:password@localhost:5432/medichat_ai