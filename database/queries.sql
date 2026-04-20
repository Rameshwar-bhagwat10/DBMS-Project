USE library_db;

SHOW TABLES;

DESCRIBE books;
DESCRIBE members;
DESCRIBE issues;

SELECT
TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'library_db';

SHOW CREATE TABLE books;
SHOW CREATE TABLE authors;
SHOW CREATE TABLE members;
SHOW CREATE TABLE issues;
SHOW CREATE TABLE book_authors;
SHOW CREATE TABLE fines;

SELECT TABLE_NAME, ENGINE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'library_db'
	AND TABLE_NAME IN ('books','authors','members','issues','book_authors','fines')
ORDER BY FIELD(TABLE_NAME,'books','authors','members','issues','book_authors','fines');

SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'library_db'
	AND TABLE_NAME IN ('books','authors','members','issues','book_authors','fines')
ORDER BY FIELD(TABLE_NAME,'books','authors','members','issues','book_authors','fines'), CONSTRAINT_TYPE, CONSTRAINT_NAME;

SELECT rc.TABLE_NAME, rc.CONSTRAINT_NAME, rc.REFERENCED_TABLE_NAME, rc.DELETE_RULE,
			 kcu.COLUMN_NAME, kcu.REFERENCED_COLUMN_NAME
FROM information_schema.REFERENTIAL_CONSTRAINTS rc
JOIN information_schema.KEY_COLUMN_USAGE kcu
	ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
 AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
 AND rc.TABLE_NAME = kcu.TABLE_NAME
WHERE rc.CONSTRAINT_SCHEMA = 'library_db'
	AND rc.TABLE_NAME IN ('issues','book_authors','fines')
ORDER BY FIELD(rc.TABLE_NAME,'issues','book_authors','fines'), rc.CONSTRAINT_NAME, kcu.ORDINAL_POSITION;

SELECT cc.TABLE_NAME, cc.CONSTRAINT_NAME, ch.CHECK_CLAUSE
FROM information_schema.TABLE_CONSTRAINTS tc
JOIN information_schema.CHECK_CONSTRAINTS ch
	ON tc.CONSTRAINT_SCHEMA = ch.CONSTRAINT_SCHEMA
 AND tc.CONSTRAINT_NAME = ch.CONSTRAINT_NAME
JOIN information_schema.CHECK_CONSTRAINTS ch2
	ON ch.CONSTRAINT_SCHEMA = ch2.CONSTRAINT_SCHEMA
 AND ch.CONSTRAINT_NAME = ch2.CONSTRAINT_NAME
JOIN information_schema.TABLE_CONSTRAINTS cc
	ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA
 AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
WHERE tc.CONSTRAINT_SCHEMA = 'library_db'
	AND tc.CONSTRAINT_TYPE = 'CHECK'
	AND cc.TABLE_NAME IN ('books','authors','members','issues','book_authors','fines')
ORDER BY FIELD(cc.TABLE_NAME,'books','authors','members','issues','book_authors','fines'), cc.CONSTRAINT_NAME;

SELECT * FROM books;
SELECT * FROM members;
SELECT * FROM issues;

SELECT b.title, m.name, i.issue_date, i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id;

SELECT * FROM fines;

SELECT 'authors' AS table_name, COUNT(*) AS row_count FROM authors
UNION ALL SELECT 'books', COUNT(*) FROM books
UNION ALL SELECT 'book_authors', COUNT(*) FROM book_authors
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'issues', COUNT(*) FROM issues
UNION ALL SELECT 'fines', COUNT(*) FROM fines;

SELECT
	SUM(CASE WHEN return_date IS NULL THEN 1 ELSE 0 END) AS active_issue_count,
	SUM(CASE WHEN return_date IS NOT NULL AND return_date <= due_date THEN 1 ELSE 0 END) AS returned_on_time_count,
	SUM(CASE WHEN return_date IS NOT NULL AND return_date > due_date THEN 1 ELSE 0 END) AS late_return_count
FROM issues;

SELECT COUNT(*) AS fine_records_linked_to_late_issue
FROM fines f
JOIN issues i ON i.issue_id = f.issue_id
WHERE i.return_date > i.due_date;

SELECT COUNT(*) AS invalid_book_author_links
FROM book_authors ba
LEFT JOIN books b ON b.book_id = ba.book_id
LEFT JOIN authors a ON a.author_id = ba.author_id
WHERE b.book_id IS NULL OR a.author_id IS NULL;

SELECT COUNT(*) AS invalid_issue_links
FROM issues i
LEFT JOIN books b ON b.book_id = i.book_id
LEFT JOIN members m ON m.member_id = i.member_id
WHERE b.book_id IS NULL OR m.member_id IS NULL;

SELECT COUNT(*) AS invalid_fine_links
FROM fines f
LEFT JOIN issues i ON i.issue_id = f.issue_id
WHERE i.issue_id IS NULL;

SELECT
	(SELECT COUNT(*) FROM books) AS total_books,
	(SELECT COUNT(DISTINCT isbn) FROM books) AS unique_isbn_count,
	(SELECT COUNT(*) FROM members) AS total_members,
	(SELECT COUNT(DISTINCT email) FROM members) AS unique_email_count,
	(SELECT COUNT(*) FROM books WHERE available_copies = total_copies) AS books_with_matching_copies;

SELECT b.title, m.name, i.issue_date, i.due_date, i.return_date
FROM issues i
JOIN books b ON i.book_id = b.book_id
JOIN members m ON i.member_id = m.member_id
ORDER BY i.issue_id;

SELECT * FROM fines ORDER BY fine_id;
