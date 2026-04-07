-- AlterTable
ALTER TABLE `draft` MODIFY `bodyHtml` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `maillog` MODIFY `subjectSnapshot` TEXT NOT NULL,
    MODIFY `bodySnapshot` LONGTEXT NOT NULL;
