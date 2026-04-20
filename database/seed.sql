USE library_db;

INSERT INTO authors (author_id, name) VALUES
(1, 'J.K. Rowling'),
(2, 'George Orwell'),
(3, 'Harper Lee'),
(4, 'Paulo Coelho'),
(5, 'Yuval Noah Harari');

INSERT INTO books (book_id, title, isbn, publisher, total_copies, available_copies) VALUES
(1, 'Harry Potter and the Philosopher''s Stone', '9780747532699', 'Bloomsbury', 12, 12),
(2, '1984', '9780451524935', 'Signet Classics', 8, 8),
(3, 'To Kill a Mockingbird', '9780061120084', 'Harper Perennial Modern Classics', 10, 10),
(4, 'The Alchemist', '9780062315007', 'HarperOne', 7, 7),
(5, 'Sapiens: A Brief History of Humankind', '9780062316097', 'Harper', 9, 9);

INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

INSERT INTO members (member_id, name, email, phone, membership_date) VALUES
(1, 'Aisha Verma', 'aisha.verma@example.com', '9876543210', '2026-01-10'),
(2, 'Rohit Sharma', 'rohit.sharma@example.com', '9890011223', '2026-01-15'),
(3, 'Neha Patel', 'neha.patel@example.com', '9811122233', '2026-02-05'),
(4, 'Arjun Mehta', 'arjun.mehta@example.com', '9822233344', '2026-02-20'),
(5, 'Priya Nair', 'priya.nair@example.com', '9833344455', '2026-03-01');

INSERT INTO issues (issue_id, book_id, member_id, issue_date, due_date, return_date) VALUES
(1, 1, 1, '2026-04-10', '2026-04-24', NULL),
(2, 2, 2, '2026-03-01', '2026-03-15', '2026-03-14'),
(3, 3, 3, '2026-02-01', '2026-02-15', '2026-02-18');

INSERT INTO fines (fine_id, issue_id, amount, paid) VALUES
(1, 3, 30.00, FALSE);
