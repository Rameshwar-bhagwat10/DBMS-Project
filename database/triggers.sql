USE library_db;

DROP TRIGGER IF EXISTS before_insert_issues_manage_stock;
DROP TRIGGER IF EXISTS after_update_issues_restore_stock;
DROP TRIGGER IF EXISTS after_update_issues_auto_fine;

DELIMITER $$

CREATE TRIGGER before_insert_issues_manage_stock
BEFORE INSERT ON issues
FOR EACH ROW
BEGIN
	DECLARE v_available_copies INT;

	SELECT available_copies
	INTO v_available_copies
	FROM books
	WHERE book_id = NEW.book_id
	FOR UPDATE;

	IF v_available_copies IS NULL THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Invalid book_id: book does not exist';
	ELSEIF v_available_copies <= 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Book not available for issue';
	ELSE
		UPDATE books
		SET available_copies = available_copies - 1
		WHERE book_id = NEW.book_id;
	END IF;
END$$

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

CREATE TRIGGER after_update_issues_auto_fine
AFTER UPDATE ON issues
FOR EACH ROW
BEGIN
	DECLARE v_late_days INT;

	IF NEW.return_date IS NOT NULL AND NEW.return_date > NEW.due_date THEN
		SET v_late_days = DATEDIFF(NEW.return_date, NEW.due_date);

		INSERT INTO fines (issue_id, amount, paid)
		VALUES (NEW.issue_id, v_late_days * 10, FALSE)
		ON DUPLICATE KEY UPDATE
			amount = VALUES(amount);
	ELSE
		DELETE FROM fines
		WHERE issue_id = NEW.issue_id;
	END IF;
END$$

DELIMITER ;

INSERT INTO issues (book_id, member_id, issue_date, due_date)
VALUES (1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY));

SELECT book_id, title, available_copies
FROM books
WHERE book_id = 1;

UPDATE books
SET available_copies = 0
WHERE book_id = 1;

INSERT INTO issues (book_id, member_id, issue_date, due_date)
VALUES (1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY));

UPDATE issues
SET return_date = CURDATE()
WHERE issue_id = 1;

SELECT book_id, title, available_copies
FROM books
WHERE book_id = 1;

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
