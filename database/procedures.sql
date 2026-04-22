-- =========================================================
-- Library Management System - Stored Procedures
-- Purpose:
--   Backfill fines for already-returned late issues.
--   Useful for one-time repair or periodic reconciliation.
-- =========================================================

USE library_db;

-- Recreate procedure safely when this file is rerun.
DROP PROCEDURE IF EXISTS generate_all_fines;

DELIMITER $$

-- ---------------------------------------------------------
-- Procedure: generate_all_fines
-- Behavior:
--   - Scans issues that were returned after due_date.
--   - Computes fine as late_days * 10.
--   - Inserts fine only if no fine exists for that issue.
--   - Safe to run repeatedly (idempotent for existing records).
-- ---------------------------------------------------------
CREATE PROCEDURE generate_all_fines()
BEGIN
	-- Cursor loop control.
	DECLARE v_done INT DEFAULT 0;

	-- Current issue row being processed.
	DECLARE v_issue_id INT;
	DECLARE v_due_date DATE;
	DECLARE v_return_date DATE;

	-- Computed fine data.
	DECLARE v_late_days INT;
	DECLARE v_fine_amount DECIMAL(10,2);
	DECLARE v_fine_exists INT DEFAULT 0;

	-- Cursor over late-returned issues only.
	DECLARE overdue_cursor CURSOR FOR
		SELECT issue_id, due_date, return_date
		FROM issues
		WHERE return_date IS NOT NULL
		  AND return_date > due_date;

	-- Set done flag when cursor is exhausted.
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

	OPEN overdue_cursor;

	read_loop: LOOP
		FETCH overdue_cursor INTO v_issue_id, v_due_date, v_return_date;

		IF v_done = 1 THEN
			LEAVE read_loop;
		END IF;

		-- Fine policy: 10 currency units per day late.
		SELECT DATEDIFF(v_return_date, v_due_date)
		INTO v_late_days;

		SELECT v_late_days * 10
		INTO v_fine_amount;

		-- Insert only when issue has no fine yet.
		SELECT COUNT(*)
		INTO v_fine_exists
		FROM fines
		WHERE issue_id = v_issue_id;

		IF v_fine_exists = 0 THEN
			INSERT INTO fines (issue_id, amount, paid)
			VALUES (v_issue_id, v_fine_amount, FALSE);
		END IF;
	END LOOP;

	CLOSE overdue_cursor;
END$$

DELIMITER ;

-- =========================================================
-- Optional manual smoke tests (read/write)
-- =========================================================

-- Run once to backfill missing fine rows.
CALL generate_all_fines();

-- Inspect generated fines.
SELECT * FROM fines;

-- Run again to confirm no duplicate fine rows are created.
CALL generate_all_fines();

SELECT issue_id, COUNT(*) AS fine_count
FROM fines
GROUP BY issue_id
ORDER BY issue_id;
