CREATE DATABASE IF NOT EXISTS pipedrive;
USE pipedrive;
CREATE TABLE IF NOT EXISTS org_tree (
	id INT AUTO_INCREMENT NOT NULL,
    node_one VARCHAR(255),
    node_two VARCHAR(255),
    branch_type ENUM('parent', 'sister', 'daughter'),
    PRIMARY KEY(id),
    INDEX(node_two ASC),
    CONSTRAINT unique_branch UNIQUE(node_one, node_two, branch_type)
) ENGINE='InnoDB';
SELECT * FROM org_tree ORDER BY id ASC;