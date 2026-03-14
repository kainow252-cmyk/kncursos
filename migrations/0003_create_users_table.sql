-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
  name TEXT,
  email TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão (senha: kncursos2024)
INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES 
('admin', 'kncursos2024', 'admin', 'Administrador', 'admin@kncursos.com.br');

-- Inserir um funcionário de exemplo (senha: funcionario123)
INSERT OR IGNORE INTO users (username, password, role, name, email) VALUES 
('funcionario', 'funcionario123', 'employee', 'Funcionário Teste', 'funcionario@kncursos.com.br');
