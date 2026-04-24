require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixAdmin() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'acad_track',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  console.log('Connected to MySQL...');

  const hash = await bcrypt.hash('Admin@1234', 12);
  await conn.execute(
    "UPDATE admins SET password_hash = ? WHERE email = 'admin@acadtrack.edu'",
    [hash]
  );

  console.log('✅ Admin password fixed!');
  console.log('   Email:    admin@acadtrack.edu');
  console.log('   Password: Admin@1234');
  console.log('   Role:     Admin');
  await conn.end();
}

fixAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
