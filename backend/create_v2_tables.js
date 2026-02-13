const { masterPool } = require('./config/database');

const createV2Tables = async () => {
    try {
        console.log('--- Creating V2 Tables ---');

        // 1. Create hourly_attendance if not exists
        await masterPool.query(`
      CREATE TABLE IF NOT EXISTS hourly_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        date DATE NOT NULL,
        period INT NOT NULL,
        status ENUM('Present', 'Absent', 'Leave', 'OD') DEFAULT 'Absent',
        posted_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_attendance_date (date),
        INDEX idx_attendance_student (student_id),
        INDEX idx_attendance_subject (subject_id)
      )
    `);
        console.log('✅ hourly_attendance table verified/created');

        // 2. Create faculty table (V2 specific) if not exists
        // Linking to rbac_users if possible, but standalone for now to match controller logic
        await masterPool.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL, 
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        department VARCHAR(100),
        designation VARCHAR(100),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ faculty table verified/created');

        // 3. Create period_slots
        await masterPool.query(`
        CREATE TABLE IF NOT EXISTS period_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50),
            start_time TIME,
            end_time TIME,
            is_active TINYINT(1) DEFAULT 1
        )
    `);
        console.log('✅ period_slots table verified/created');

        console.log('Success! V2 Tables ready.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createV2Tables();
