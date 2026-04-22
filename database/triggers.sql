-- =========================================================
-- Library Management System - Triggers
-- Purpose:
--   1) Decrease stock when an issue is created.
--   2) Restore stock when a book is returned.
--   3) Auto-manage fine records for late returns.
-- =========================================================

USE library_db;

-- Recreate triggers safely when this file is rerun.
DROP TRIGGER IF EXISTS before_insert_issues_manage_stock;
DROP TRIGGER IF EXISTS after_update_issues_restore_stock;
DROP TRIGGER IF EXISTS after_update_issues_auto_fine;

DELIMITER $$

-- ---------------------------------------------------------
-- Trigger: before_insert_issues_manage_stock
-- Event: BEFORE INSERT on issues
-- Behavior:
--   - Locks target book row.
--   - Validates book exists and has stock.
--   - Decrements available_copies by 1.
-- ---------------------------------------------------------
CREATE TRIGGER before_insert_issues_manage_stock
BEFORE INSERT ON issues
FOR EACH ROW
BEGIN
	DECLARE v_available_copies INT;

	-- Lock the selected book row to avoid concurrent overselling.
	SELECT available_copies
	INTO v_available_copies
	FROM books
	WHERE book_id = NEW.book_id
	FOR UPDATE;

	-- Reject invalid book reference.
	IF v_available_copies IS NULL THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid book_id: book does not exist';
	-- Reject issue when no copies are available.
	ELSEIF v_available_copies <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Book not available for issue';
	ELSE
		-- Successful issue path: decrement stock.
		UPDATE books
		SET available_copies = available_copies - 1
		WHERE book_id = NEW.book_id;
	END IF;
END$$

-- ---------------------------------------------------------
-- Trigger: after_update_issues_restore_stock
-- Event: AFTER UPDATE on issues
-- Behavior:
--   - Restores stock only when return_date transitions
--     from NULL to a non-NULL date.
-- ---------------------------------------------------------
CREATE TRIGGER after_update_issues_restore_stock
AFTER UPDATE ON issues
FOR EACH ROW
BEGIN
	IF OLD.return_date IS NULL AND NEW.return_date IS NOT NULL THEN
		UPDATE books
		SET available_copies = available_copies + 1
		WHERE book_id = NEW.book_id;
	END IF;
END$$

-- ---------------------------------------------------------
-- Trigger: after_update_issues_auto_fine
-- Event: AFTER UPDATE on issues
-- Behavior:
--   - If returned late, insert or update a fine.
--   - If returned on time (or return_date cleared), remove fine.
-- ---------------------------------------------------------
CREATE TRIGGER after_update_issues_auto_fine
AFTER UPDATE ON issues
FOR EACH ROW
BEGIN
	DECLARE v_late_days INT;

	IF NEW.return_date IS NOT NULL AND NEW.return_date > NEW.due_date THEN
		-- Fine rule: 10 currency units per late day.
		SET v_late_days = DATEDIFF(NEW.return_date, NEW.due_date);

		INSERT INTO fines (issue_id, amount, paid)
		VALUES (NEW.issue_id, v_late_days * 10, FALSE)
		ON DUPLICATE KEY UPDATE
			amount = VALUES(amount);
	ELSE
		-- Keep fines table consistent when issue is no longer late.
		DELETE FROM fines
		WHERE issue_id = NEW.issue_id;
	END IF;
END$$

DELIMITER ;

-- =========================================================
-- Optional manual smoke tests (data-changing)
-- Run these only in local/dev verification workflows.
-- =========================================================

-- 1) Create an issue and verify stock decreases.
INSERT INTO issues (book_id, member_id, issue_date, due_date)
VALUES (1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY));

SELECT book_id, title, available_copies
FROM books
WHERE book_id = 1;

-- 2) Force stock to zero and verify issue rejection by trigger.
UPDATE books
SET available_copies = 0
WHERE book_id = 1;

INSERT INTO issues (book_id, member_id, issue_date, due_date)
VALUES (1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY));

-- 3) Mark returned and verify stock restoration.
UPDATE issues
SET return_date = CURDATE()
WHERE issue_id = 1;

SELECT book_id, title, available_copies
FROM books
WHERE book_id = 1;

-- 4) Set late return and verify fine creation/update.
UPDATE issues
SET return_date = DATE_ADD(due_date, INTERVAL 3 DAY)
WHERE issue_id = 2;

SELECT *
FROM fines
WHERE issue_id = 2;

UPDATE issues
SET return_date = DATE_ADD(due_date, INTERVAL 4 DAY)
WHERE issue_id = 2;

SELECT issue_id, COUNT(*) AS fine_count
FROM fines
WHERE issue_id = 2
GROUP BY issue_id;
