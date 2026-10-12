CREATE DATABASE IF NOT EXISTS community_event_board
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE community_event_board;

CREATE TABLE IF NOT EXISTS events (
  id CHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  category ENUM('Music', 'Workshop', 'Food', 'Sports', 'Kids') NOT NULL,
  city VARCHAR(80) NOT NULL,
  event_date DATETIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  description VARCHAR(2000) NOT NULL,
  image_url VARCHAR(2048) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_active_date (active, event_date),
  KEY idx_events_category_city_date (category, city, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id CHAR(36) NOT NULL,
  category ENUM('Music', 'Workshop', 'Food', 'Sports', 'Kids') NOT NULL,
  PRIMARY KEY (user_id, category),
  CONSTRAINT fk_user_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_reminders (
  user_id CHAR(36) NOT NULL,
  event_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  KEY idx_user_reminders_event (event_id),
  CONSTRAINT fk_user_reminders_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_reminders_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_event_designs (
  user_id CHAR(36) NOT NULL,
  event_id CHAR(36) NOT NULL,
  theme ENUM('sunshine', 'berry', 'ocean') NOT NULL DEFAULT 'sunshine',
  stickers JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  CONSTRAINT fk_user_event_designs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_event_designs_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS store_write_lock (
  id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_store_write_lock_singleton CHECK (id = 1)
) ENGINE=InnoDB;

INSERT IGNORE INTO store_write_lock (id) VALUES (1);
