USE pipedrive;
DROP TABLE IF EXISTS org_tree;
DROP DATABASE IF EXISTS pipedrive;

CREATE DATABASE pipedrive;
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