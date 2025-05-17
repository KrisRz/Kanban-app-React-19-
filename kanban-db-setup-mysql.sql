-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(255),
  avatar VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL
);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  `order` INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  assignee_id INT,
  column_id INT NOT NULL,
  `order` INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (assignee_id) REFERENCES users(id),
  FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
  CHECK (status IN ('todo', 'in-progress', 'done'))
);

-- Insert some initial data
INSERT INTO columns (name, `order`, updated_at) VALUES 
('To Do', 1, NOW()),
('In Progress', 2, NOW()),
('Done', 3, NOW());

-- Insert a demo user
INSERT INTO users (name, email, role, avatar, updated_at) VALUES
('Demo User', 'demo@example.com', 'Developer', 'https://ui-avatars.com/api/?name=Demo+User&background=random', NOW()); 