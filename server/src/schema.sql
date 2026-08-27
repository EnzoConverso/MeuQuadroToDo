-- =======================================================
-- Schema: Meu Quadro To Do
-- Banco de Dados: PostgreSQL
-- =======================================================

-- 1. Criação da tabela de Projetos
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criação da tabela de Colunas / Status
CREATE TABLE IF NOT EXISTS columns (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criação da tabela de Cards / Tarefas
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    column_id INT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Seed inicial (Opcional - caso queira dados de exemplo)
INSERT INTO projects (name, description) 
VALUES ('Meu Primeiro Projeto', 'Projeto inicial criado automaticamente.')
ON CONFLICT DO NOTHING;

-- Inserção das 4 colunas padrão para o primeiro projeto
INSERT INTO columns (project_id, name, position)
SELECT id, 'Para fazer', 0 FROM projects WHERE name = 'Meu Primeiro Projeto'
ON CONFLICT DO NOTHING;

INSERT INTO columns (project_id, name, position)
SELECT id, 'Fazendo', 1 FROM projects WHERE name = 'Meu Primeiro Projeto'
ON CONFLICT DO NOTHING;

INSERT INTO columns (project_id, name, position)
SELECT id, 'Completo', 2 FROM projects WHERE name = 'Meu Primeiro Projeto'
ON CONFLICT DO NOTHING;

INSERT INTO columns (project_id, name, position)
SELECT id, 'Não deu certo', 3 FROM projects WHERE name = 'Meu Primeiro Projeto'
ON CONFLICT DO NOTHING;
