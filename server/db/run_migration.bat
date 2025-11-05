@echo off
REM Migration script to create conversations table for amora_db (Windows)

echo 🚀 Starting migration: Create conversations table for amora_db

REM Database connection details
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=amora_db

REM Check if MySQL is running
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ❌ MySQL is not running. Please start MySQL first.
    pause
    exit /b 1
)

echo ✅ MySQL is running

REM Check if database exists
echo 📋 Checking if database exists...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "USE %DB_NAME%;" 2>NUL
if %ERRORLEVEL% neq 0 (
    echo ❌ Database %DB_NAME% does not exist. Please create it first.
    pause
    exit /b 1
)

echo ✅ Database %DB_NAME% exists

REM Run the migration
echo 🔄 Running migration...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < migrations\001_create_conversations_safe.sql

if %ERRORLEVEL% equ 0 (
    echo ✅ Migration completed successfully!
    echo 📊 Tables created:
    echo    - conversations
    echo    - messages
) else (
    echo ❌ Migration failed!
    pause
    exit /b 1
)

REM Verify tables were created
echo 🔍 Verifying tables...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "USE %DB_NAME%; SHOW TABLES;" | findstr /C:"conversations" | findstr /C:"messages"

if %ERRORLEVEL% equ 0 (
    echo ✅ Tables verified successfully!
) else (
    echo ❌ Table verification failed!
    pause
    exit /b 1
)

echo 🎉 Migration completed successfully!
pause
