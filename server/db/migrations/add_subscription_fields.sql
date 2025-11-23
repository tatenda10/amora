ALTER TABLE users
ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN subscription_status VARCHAR(50),
ADD COLUMN subscription_end_date DATETIME;
