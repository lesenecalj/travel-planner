ALTER TABLE `trips` ADD COLUMN `destination` text NOT NULL DEFAULT '';
ALTER TABLE `trips` ADD COLUMN `duration_weeks` integer NOT NULL DEFAULT 1;
ALTER TABLE `trips` ADD COLUMN `pace` text NOT NULL DEFAULT 'normal';
ALTER TABLE `trips` ADD COLUMN `interests` text NOT NULL DEFAULT '[]';
ALTER TABLE `trips` ADD COLUMN `label` text;
