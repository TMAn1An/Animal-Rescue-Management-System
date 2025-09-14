-- Animal Rescue Management System Database Schema
-- Created: September 2025

-- Create database
CREATE DATABASE IF NOT EXISTS animal_rescue_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE animal_rescue_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_code (user_code),
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- Rescuers table
CREATE TABLE rescuers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nid VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nid (nid),
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- Rescue requests table
CREATE TABLE rescue_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pet_type VARCHAR(50) NOT NULL,
    pet_condition ENUM('Normal', 'Moderate', 'Serious') NOT NULL,
    location VARCHAR(255) NOT NULL,
    situation_description TEXT NOT NULL,
    additional_note TEXT,
    donation_amount DECIMAL(10,2) NULL,
    status ENUM('Pending', 'Assigned', 'Approved', 'Completed') DEFAULT 'Pending',
    assigned_rescuer_id INT NULL,
    assigned_at DATETIME NULL,
    approved BOOLEAN DEFAULT FALSE,
    post_health_condition TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_rescuer_id) REFERENCES rescuers(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_assigned_rescuer (assigned_rescuer_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Insert sample data
INSERT INTO users (user_code, name, phone) VALUES
('PT_USER00001', 'John Doe', '01712345678'),
('PT_USER00002', 'Jane Smith', '01798765432'),
('PT_USER00003', 'Mike Johnson', '01656789012');

INSERT INTO rescuers (name, nid, phone) VALUES
('Sarah Wilson', '1234567890123', '01634567890'),
('Tom Brown', '9876543210987', '01723456789');

INSERT INTO rescue_requests (user_id, pet_type, pet_condition, location, situation_description, additional_note, donation_amount, status, assigned_rescuer_id, assigned_at, approved) VALUES
(1, 'Dog', 'Serious', 'Dhanmondi, Dhaka', 'Injured dog found near road, bleeding from leg and unable to walk properly', 'Needs immediate medical attention', 500.00, 'Assigned', 1, NOW(), TRUE),
(1, 'Cat', 'Normal', 'Gulshan, Dhaka', 'Stray cat seems healthy but very thin, appears to be looking for food regularly', 'Found near garbage area, seems friendly', NULL, 'Pending', NULL, NULL, FALSE),
(2, 'Bird', 'Moderate', 'Uttara, Dhaka', 'Bird with visible broken wing, cannot fly but still moving around', 'Found in park area', 200.00, 'Completed', 2, DATE_SUB(NOW(), INTERVAL 2 DAY), TRUE),
(3, 'Dog', 'Normal', 'Mirpur, Dhaka', 'Small puppy found alone, appears lost and scared', 'Very young, needs care and shelter', 100.00, 'Pending', NULL, NULL, FALSE);
