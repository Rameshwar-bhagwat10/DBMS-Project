-- =========================================================
-- Library Management System - Query Reference
-- Purpose: Central SQL catalog of queries used by backend APIs.
-- Notes:
--   1) Use this file as a reference for endpoints and reports.
--   2) Placeholders (?) match mysql2 prepared statement style.
--   3) Dynamic ORDER BY fields in app code are whitelist-validated.
-- =========================================================

USE library_db;

-- =========================================================
-- 0) Health Check
-- backend/src/models/testModel.js
-- =========================================================
SELECT 1 AS result;

-- =========================================================
-- 1) Authentication / Librarian Profile
-- backend/src/services/authService.js
-- =========================================================

-- Login lookup by email.
SELECT librarian_id, username, email, password_hash, name
FROM librarians
WHERE email = ?;

-- Get current user by id (/auth/me).
SELECT librarian_id, username, email, name
FROM librarians
WHERE librarian_id = ?;

-- Get current password hash before profile/password update.
SELECT librarian_id, password_hash
FROM librarians
WHERE librarian_id = ?;

-- Update password hash.
UPDATE librarians
SET password_hash = ?
WHERE librarian_id = ?;

-- Update profile fields (app builds SET clause dynamically).
-- Example 1:
UPDATE librarians
SET name = ?
WHERE librarian_id = ?;

-- Example 2:
UPDATE librarians
SET email = ?
WHERE librarian_id = ?;

-- Example 3:
UPDATE librarians
SET name = ?, email = ?
WHERE librarian_id = ?;

-- =========================================================
-- 2) Books Module
-- backend/src/models/bookModel.js
-- =========================================================

-- Uniqueness check by ISBN (used in create and update).
SELECT book_id
FROM books
WHERE isbn = ?;

-- Uniqueness check by ISBN excluding current book id (update flow).
SELECT book_id
FROM books
WHERE isbn = ?
  AND book_id <> ?;

-- Create book.
INSERT INTO books (title, isbn, publisher, total_copies, available_copies)
VALUES (?, ?, ?, ?, ?);

-- Find author by case-insensitive name.
SELECT author_id
FROM authors
WHERE LOWER(name) = LOWER(?)
LIMIT 1;

-- Create author.
INSERT INTO authors (name)
VALUES (?);

-- Link book and author.
INSERT INTO book_authors (book_id, author_id)
VALUES (?, ?);

-- Remove existing author links for one book.
DELETE FROM book_authors
WHERE book_id = ?;

-- Lock one book row for transactional update.
SELECT book_id, title, isbn, publisher, total_copies, available_copies
FROM books
WHERE book_id = ?
FOR UPDATE;

-- Update book fields.
UPDATE books
SET title = ?, isbn = ?, publisher = ?, total_copies = ?, available_copies = ?
WHERE book_id = ?;

-- Count active issues for a book.
SELECT COUNT(*) AS total
FROM issues
WHERE book_id = ?
  AND return_date IS NULL;

-- Delete only returned issues for a book.
DELETE FROM issues
WHERE book_id = ?
  AND return_date IS NOT NULL;

-- Delete book.
DELETE FROM books
WHERE book_id = ?;

-- List books (base shape used by list/search endpoints).
SELECT
	b.book_id,
	b.title,
	b.isbn,
	b.publisher,
	b.total_copies,
	b.available_copies,
	GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ',') AS authors
FROM books b
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
-- Optional WHERE fragments from app code:
-- 1) b.available_copies > 0
-- 2) b.available_copies = 0
-- 3) EXISTS (author filter)
-- 4) LOWER(b.title) LIKE LOWER(?) OR EXISTS (author search)
GROUP BY b.book_id
ORDER BY b.book_id ASC;

-- Count for paginated books list/search.
SELECT COUNT(*) AS total
FROM books b;

-- Get one book by id with authors.
SELECT
	b.book_id,
	b.title,
	b.isbn,
	b.publisher,
	b.total_copies,
	b.available_copies,
	GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ',') AS authors
FROM books b
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
WHERE b.book_id = ?
GROUP BY b.book_id;

-- =========================================================
-- 3) Members Module
-- backend/src/models/memberModel.js
-- =========================================================

-- Create member.
INSERT INTO members (name, email, phone)
VALUES (?, ?, ?);

-- Email uniqueness check (create).
SELECT member_id
FROM members
WHERE email = ?;

-- Email uniqueness check (update, exclude current member).
SELECT member_id
FROM members
WHERE email = ?
  AND member_id <> ?;

-- List members.
SELECT member_id, name, email, phone, membership_date
FROM members
ORDER BY member_id;

-- Paginated/sorted list members (sort column/order are app-validated).
SELECT m.member_id, m.name, m.email, m.phone, m.membership_date
FROM members m
ORDER BY m.member_id ASC;

-- Count members.
SELECT COUNT(*) AS total
FROM members;

-- Get one member.
SELECT member_id, name, email, phone, membership_date
FROM members
WHERE member_id = ?;

-- Member borrowing history.
SELECT
	b.title,
	i.issue_date,
	i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
WHERE i.member_id = ?
ORDER BY i.issue_date DESC;

-- Member issue records (used before delete).
SELECT issue_id, book_id, issue_date, due_date, return_date
FROM issues
WHERE member_id = ?;

-- Update member.
UPDATE members
SET name = ?, email = ?, phone = ?
WHERE member_id = ?;

-- Delete member.
DELETE FROM members
WHERE member_id = ?;

-- =========================================================
-- 4) Issues Module
-- backend/src/models/issueModel.js
-- =========================================================

-- Validate book exists.
SELECT book_id
FROM books
WHERE book_id = ?;

-- Validate member exists.
SELECT member_id
FROM members
WHERE member_id = ?;

-- Create issue (due date based on days input).
INSERT INTO issues (book_id, member_id, issue_date, due_date)
VALUES (?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY));

-- Read raw issue row.
SELECT issue_id, book_id, member_id, issue_date, due_date, return_date
FROM issues
WHERE issue_id = ?;

-- Mark issue as returned.
UPDATE issues
SET return_date = CURRENT_DATE
WHERE issue_id = ?;

-- Get issue details by id.
SELECT
	i.issue_id,
	i.book_id,
	b.title,
	i.member_id,
	m.name AS member_name,
	i.issue_date,
	i.due_date,
	i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
WHERE i.issue_id = ?;

-- List issues (used by all-issues endpoint).
SELECT
	i.issue_id,
	i.book_id,
	b.title,
	i.member_id,
	m.name AS member_name,
	i.issue_date,
	i.due_date,
	i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
ORDER BY i.issue_id DESC;

-- Paginated/sorted issues list (sort column/order are app-validated).
SELECT
	i.issue_id,
	i.book_id,
	b.title,
	i.member_id,
	m.name AS member_name,
	i.issue_date,
	i.due_date,
	i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
ORDER BY i.issue_id DESC;

-- Count issues.
SELECT COUNT(*) AS total
FROM issues;

-- Active issues only.
SELECT
	i.issue_id,
	i.book_id,
	b.title,
	i.member_id,
	m.name AS member_name,
	i.issue_date,
	i.due_date,
	i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
WHERE i.return_date IS NULL
ORDER BY i.issue_id DESC;

-- Report: most issued books.
SELECT
	i.book_id,
	b.title,
	COUNT(*) AS issue_count
FROM issues i
JOIN books b ON i.book_id = b.book_id
GROUP BY i.book_id, b.title
ORDER BY issue_count DESC, i.book_id ASC;

-- Report: top borrowing members.
SELECT
	i.member_id,
	m.name,
	COUNT(*) AS total_issues
FROM issues i
JOIN members m ON i.member_id = m.member_id
GROUP BY i.member_id, m.name
ORDER BY total_issues DESC, i.member_id ASC;

-- Report: total paid fines collected.
SELECT COALESCE(SUM(amount), 0) AS total_fines_collected
FROM fines
WHERE paid = TRUE;

-- =========================================================
-- 5) Fines Module
-- backend/src/models/fineModel.js
-- =========================================================

-- Validate member exists before member-fines lookup.
SELECT member_id
FROM members
WHERE member_id = ?;

-- List all fines.
SELECT
	f.fine_id,
	f.amount,
	f.paid,
	b.title,
	m.name,
	i.issue_id
FROM fines f
JOIN issues i ON f.issue_id = i.issue_id
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
ORDER BY f.fine_id DESC;

-- List unpaid fines.
SELECT
	f.fine_id,
	f.amount,
	f.paid,
	b.title,
	m.name,
	i.issue_id
FROM fines f
JOIN issues i ON f.issue_id = i.issue_id
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
WHERE f.paid = FALSE
ORDER BY f.fine_id DESC;

-- Get fine by issue id.
SELECT
	f.fine_id,
	f.amount,
	f.paid,
	b.title,
	m.name,
	i.issue_id
FROM fines f
JOIN issues i ON f.issue_id = i.issue_id
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
WHERE i.issue_id = ?
LIMIT 1;

-- Get fine by fine id.
SELECT
	f.fine_id,
	f.amount,
	f.paid,
	b.title,
	m.name,
	i.issue_id
FROM fines f
JOIN issues i ON f.issue_id = i.issue_id
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
WHERE f.fine_id = ?
LIMIT 1;

-- Mark fine paid.
UPDATE fines
SET paid = TRUE
WHERE fine_id = ?;

-- Get fines by member id.
SELECT
	f.fine_id,
	f.amount,
	f.paid,
	b.title,
	m.name,
	i.issue_id
FROM fines f
JOIN issues i ON f.issue_id = i.issue_id
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
WHERE m.member_id = ?
ORDER BY f.fine_id DESC;

-- =========================================================
-- 6) Useful Verification Queries
-- Use after seed/procedures/triggers for quick sanity checks.
-- =========================================================

-- Table-wise row counts.
SELECT 'authors' AS table_name, COUNT(*) AS row_count FROM authors
UNION ALL SELECT 'books', COUNT(*) FROM books
UNION ALL SELECT 'book_authors', COUNT(*) FROM book_authors
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'issues', COUNT(*) FROM issues
UNION ALL SELECT 'fines', COUNT(*) FROM fines;

-- Joined issue view.
SELECT b.title, m.name, i.issue_date, i.due_date, i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
ORDER BY i.issue_id;

-- Joined fines view.
SELECT
	f.fine_id,
	f.amount,
	f.paid,
	i.issue_id,
	b.title,
	m.name
FROM fines f
JOIN issues i ON f.issue_id = i.issue_id
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
ORDER BY f.fine_id;

-- =========================================================
-- 7) Maintenance / Bootstrap Script Queries
-- Source:
--   backend/scripts/resetAndSeedMaharashtraData.js
--   backend/scripts/createLibrarianTable.js
--   backend/scripts/addEmailToLibrarians.js
-- =========================================================

-- Clear transactional tables and masters in dependency-safe order.
DELETE FROM fines;
DELETE FROM issues;
DELETE FROM book_authors;
DELETE FROM members;
DELETE FROM authors;
DELETE FROM books;

-- Reset AUTO_INCREMENT counters.
ALTER TABLE fines AUTO_INCREMENT = 1;
ALTER TABLE issues AUTO_INCREMENT = 1;
ALTER TABLE members AUTO_INCREMENT = 1;
ALTER TABLE authors AUTO_INCREMENT = 1;
ALTER TABLE books AUTO_INCREMENT = 1;

-- Bulk inserts used by reset script.
INSERT INTO authors (name)
VALUES (?);

INSERT INTO books (title, isbn, publisher, total_copies, available_copies)
VALUES (?, ?, ?, ?, ?);

INSERT INTO book_authors (book_id, author_id)
VALUES (?, ?);

INSERT INTO members (name, email, phone, membership_date)
VALUES (?, ?, ?, ?);

-- Bootstrap librarians table (historical script flow).
-- Current canonical definition lives in schema.sql (with email column).
CREATE TABLE IF NOT EXISTS librarians (
	librarian_id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	name VARCHAR(100) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT librarian_id
FROM librarians
WHERE username = ?;

INSERT INTO librarians (username, password_hash, name)
VALUES (?, ?, ?);

-- Email migration script for librarians.
SHOW COLUMNS FROM librarians LIKE 'email';

ALTER TABLE librarians
ADD COLUMN email VARCHAR(100) NOT NULL DEFAULT '' AFTER username;

ALTER TABLE librarians
ADD UNIQUE INDEX idx_librarian_email (email);

UPDATE librarians
SET email = 'admin@library.com'
WHERE username = 'admin'
  AND (email = '' OR email IS NULL);
