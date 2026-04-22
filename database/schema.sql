-- =========================================================
-- Library Management System - Database Schema
-- Purpose:
--   1) Create/prepare database and DB user
--   2) Recreate all core tables in correct dependency order
-- =========================================================

CREATE DATABASE IF NOT EXISTS library_db;

USE library_db;

-- Optional visibility check
SHOW DATABASES;

-- Ensure DB charset/collation supports modern text
ALTER DATABASE library_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- App-level MySQL user
CREATE USER IF NOT EXISTS 'lib_user'@'localhost'
IDENTIFIED BY 'password123';

ALTER USER 'lib_user'@'localhost'
IDENTIFIED BY 'password123';

GRANT ALL PRIVILEGES ON library_db.* TO 'lib_user'@'localhost';
FLUSH PRIVILEGES;

-- Optional verification checks
SELECT User, Host FROM mysql.user WHERE User = 'lib_user';

SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'library_db';

USE library_db;

-- =========================================================
-- Drop existing tables safely (child tables first)
-- =========================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS fines;
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS librarians;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS books;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- Master data tables
-- =========================================================

-- Books catalog
CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publisher VARCHAR(100),
    total_copies INT NOT NULL,
    available_copies INT NOT NULL,
    CHECK (total_copies >= 0),
    CHECK (available_copies >= 0 AND available_copies <= total_copies)
) ENGINE = InnoDB;

-- Authors catalog
CREATE TABLE authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
) ENGINE = InnoDB;

-- Librarian accounts (used for login/auth)
CREATE TABLE librarians (
    librarian_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- Library members (people who borrow books)
CREATE TABLE members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    membership_date DATE DEFAULT (CURRENT_DATE)
) ENGINE = InnoDB;

-- =========================================================
-- Transactional tables
-- =========================================================

-- Issue/return records
CREATE TABLE issues (
    issue_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
) ENGINE = InnoDB;

-- Many-to-many mapping between books and authors
CREATE TABLE book_authors (
    book_id INT,
    author_id INT,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Fine generated per issue (one fine per issue)
CREATE TABLE fines (
    fine_id INT PRIMARY KEY AUTO_INCREMENT,
    issue_id INT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE
) ENGINE = InnoDB;