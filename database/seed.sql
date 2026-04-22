-- =========================================================
-- Library Management System - Seed Data
-- Source: backend/scripts/resetAndSeedMaharashtraData.js
-- Seeds: authors, books, book_authors, members
-- =========================================================

USE library_db;

-- =========================================================
-- Authors
-- =========================================================
INSERT INTO authors (author_id, name) VALUES
(1, 'R. K. Narayan'),
(2, 'Munshi Premchand'),
(3, 'Ruskin Bond'),
(4, 'Amish Tripathi'),
(5, 'Chetan Bhagat'),
(6, 'Sudha Murty'),
(7, 'Shivaji Sawant'),
(8, 'Khushwant Singh'),
(9, 'Kalki Krishnamurthy'),
(10, 'S. L. Bhyrappa');

-- =========================================================
-- Books
-- Note: available_copies starts equal to total_copies.
-- =========================================================
INSERT INTO books (book_id, title, isbn, publisher, total_copies, available_copies) VALUES
(1, 'Malgudi Days', '9788185986024', 'Indian Thought Publications', 12, 12),
(2, 'Godaan', '9788126713641', 'Rajpal and Sons', 10, 10),
(3, 'The Blue Umbrella', '9788129145043', 'Rupa Publications', 9, 9),
(4, 'The Immortals of Meluha', '9789382618348', 'Westland', 14, 14),
(5, 'Five Point Someone', '9788129135723', 'Rupa Publications', 11, 11),
(6, 'Wise and Otherwise', '9780143417231', 'Penguin India', 13, 13),
(7, 'Mrityunjaya', '9788177666514', 'Continental Prakashan', 8, 8),
(8, 'Train to Pakistan', '9780143065883', 'Penguin India', 7, 7),
(9, 'Ponniyin Selvan Part 1', '9789350293379', 'Vanathi Pathippagam', 10, 10),
(10, 'Parva', '9780198066231', 'Oxford University Press', 6, 6);

-- =========================================================
-- Book-Author Mapping
-- One-to-one mapping in this dataset (book_id = author_id).
-- =========================================================
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- =========================================================
-- Members
-- =========================================================
INSERT INTO members (member_id, name, email, phone, membership_date) VALUES
(1, 'Aarav Patil', 'aarav.patil@maharashtrarun.edu.in', '9876500001', '2026-04-01'),
(2, 'Sanika Deshmukh', 'sanika.deshmukh@maharashtrarun.edu.in', '9876500002', '2026-04-02'),
(3, 'Omkar Jadhav', 'omkar.jadhav@maharashtrarun.edu.in', '9876500003', '2026-04-03'),
(4, 'Isha Kulkarni', 'isha.kulkarni@maharashtrarun.edu.in', '9876500004', '2026-04-04'),
(5, 'Pranav Shinde', 'pranav.shinde@maharashtrarun.edu.in', '9876500005', '2026-04-05'),
(6, 'Rutuja Pawar', 'rutuja.pawar@maharashtrarun.edu.in', '9876500006', '2026-04-06'),
(7, 'Vedant Joshi', 'vedant.joshi@maharashtrarun.edu.in', '9876500007', '2026-04-07'),
(8, 'Sneha More', 'sneha.more@maharashtrarun.edu.in', '9876500008', '2026-04-08'),
(9, 'Atharva Bhosale', 'atharva.bhosale@maharashtrarun.edu.in', '9876500009', '2026-04-09'),
(10, 'Gauri Chavan', 'gauri.chavan@maharashtrarun.edu.in', '9876500010', '2026-04-10');

-- =========================================================
-- Transaction tables intentionally left empty:
-- - issues
-- - fines
-- This matches resetAndSeedMaharashtraData.js behavior.
-- =========================================================