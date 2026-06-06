-- ============================================================
-- Document Vault — PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── Documents Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename          VARCHAR(255)  NOT NULL,
    original_filename VARCHAR(255)  NOT NULL,
    category          VARCHAR(50)   NOT NULL DEFAULT 'Other',
    file_path         VARCHAR(500)  NOT NULL,
    file_size         BIGINT        NOT NULL DEFAULT 0,
    mime_type         VARCHAR(100),
    uploaded_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id     ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category    ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- Full-text search index on original_filename
CREATE INDEX IF NOT EXISTS idx_documents_filename_search
    ON documents USING gin(to_tsvector('english', original_filename));

-- ─── Updated At Trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_documents_updated_at ON documents;
CREATE TRIGGER set_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Category Constraint ─────────────────────────────────────
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'documents_category_check'
    ) THEN
        ALTER TABLE documents ADD CONSTRAINT documents_category_check
        CHECK (category IN (
            'Aadhaar', 'PAN', 'Passport', 'Education',
            'Resume', 'Certificates', 'Personal', 'Other'
        ));
    END IF;
END $$;
