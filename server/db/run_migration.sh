#!/bin/bash
# Migration script to create conversations table for amora_db

echo "🚀 Starting migration: Create conversations table for amora_db"

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Database connection details
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="amora_db"

# Check if database exists
echo "📋 Checking if database exists..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Database $DB_NAME does not exist. Please create it first."
    exit 1
fi

echo "✅ Database $DB_NAME exists"

# Run the migration
echo "🔄 Running migration..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < migrations/001_create_conversations_safe.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "📊 Tables created:"
    echo "   - conversations"
    echo "   - messages"
else
    echo "❌ Migration failed!"
    exit 1
fi

# Verify tables were created
echo "🔍 Verifying tables..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;" | grep -E "(conversations|messages)"

if [ $? -eq 0 ]; then
    echo "✅ Tables verified successfully!"
else
    echo "❌ Table verification failed!"
    exit 1
fi

echo "🎉 Migration completed successfully!"
