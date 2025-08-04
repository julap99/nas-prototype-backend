-- =====================================================
-- BP_ACCESS TABLE CREATION AND SEED DATA
-- =====================================================

-- Create BP_access table
CREATE TABLE `BP_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- INSERT TEST DATA
-- =====================================================

-- Note: The passwords below are hashed using bcrypt with 12 rounds
-- Plain text passwords are: admin123

-- Insert admin user
INSERT INTO `BP_access` (`username`, `password`, `isActive`, `created_at`, `updated_at`) 
VALUES (
  'admin', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 
  1, 
  NOW(), 
  NOW()
);

-- Insert thirdparty user
INSERT INTO `BP_access` (`username`, `password`, `isActive`, `created_at`, `updated_at`) 
VALUES (
  'thirdparty', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 
  1, 
  NOW(), 
  NOW()
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table was created successfully
DESCRIBE `BP_access`;

-- View all records (passwords will be hashed)
SELECT `id`, `username`, `isActive`, `created_at`, `updated_at` FROM `BP_access`;

-- Count total records
SELECT COUNT(*) as total_records FROM `BP_access`;

-- Check for specific username
SELECT `id`, `username`, `isActive` FROM `BP_access` WHERE `username` = 'admin';

-- =====================================================
-- ADDITIONAL USEFUL QUERIES
-- =====================================================

-- Add a new user (replace 'newuser' and 'newpassword' with actual values)
-- Note: You'll need to hash the password using bcrypt first
/*
INSERT INTO `BP_access` (`username`, `password`, `isActive`, `created_at`, `updated_at`) 
VALUES (
  'newuser', 
  'hashed_password_here', 
  1, 
  NOW(), 
  NOW()
);
*/

-- Deactivate a user
-- UPDATE `BP_access` SET `isActive` = 0 WHERE `username` = 'username_to_deactivate';

-- Activate a user
-- UPDATE `BP_access` SET `isActive` = 1 WHERE `username` = 'username_to_activate';

-- Change password (replace with actual hashed password)
-- UPDATE `BP_access` SET `password` = 'new_hashed_password' WHERE `username` = 'username_to_update';

-- Delete a user (be careful!)
-- DELETE FROM `BP_access` WHERE `username` = 'username_to_delete';

-- =====================================================
-- PASSWORD HASHING INFORMATION
-- =====================================================

/*
To generate a bcrypt hash for a new password, you can use:

1. Node.js:
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash('your_password', 12);
   console.log(hashedPassword);

2. Online bcrypt generator (for testing only):
   https://bcrypt.online/

3. PHP:
   $hashedPassword = password_hash('your_password', PASSWORD_BCRYPT, ['cost' => 12]);

4. Python:
   import bcrypt
   hashedPassword = bcrypt.hashpw('your_password'.encode('utf-8'), bcrypt.gensalt(12))

The hash in the INSERT statements above corresponds to 'admin123' with 12 rounds.
*/ 