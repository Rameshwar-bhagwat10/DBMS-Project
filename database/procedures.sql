USE library_db;

DROP PROCEDURE IF EXISTS generate_all_fines;

DELIMITER $$

CREATE PROCEDURE generate_all_fines()
BEGIN
	DECLARE v_done INT DEFAULT 0;
	DECLARE v_issue_id INT;
	DECLARE v_due_date DATE;
	DECLARE v_return_date DATE;
	DECLARE v_late_days INT;
	DECLARE v_fine_amount DECIMAL(10,2);
	DECLARE v_fine_exists INT DEFAULT 0;

	DECLARE overdue_cursor CURSOR FOR
		SELECT issue_id, due_date, return_date
		FROM issues
		WHERE return_date IS NOT NULL
		  AND return_date > due_date;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

	OPEN overdue_cursor;

	read_loop: LOOP
		FETCH overdue_cursor INTO v_issue_id, v_due_date, v_return_date;

		IF v_done = 1 THEN
			LEAVE read_loop;
		END IF;

		SELECT DATEDIFF(v_return_date, v_due_date)
		INTO v_late_days;

		SELECT v_late_days * 10
		INTO v_fine_amount;

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

CALL generate_all_fines();

SELECT * FROM fines;

CALL generate_all_fines();

SELECT issue_id, COUNT(*) AS fine_count
FROM fines
GROUP BY issue_id
ORDER BY issue_id;
