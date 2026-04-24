require('dotenv').config();
const app = require('./app');
const { testConnection, pool } = require('./config/database');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const PORT = process.env.PORT || 5000;

const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    logger.info(`AcadTrack API running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    
    // Background worker to flag expired fees as overdue passively 
    const sweepOverdueFees = async () => {
      try {
        const [result] = await pool.execute(
          "UPDATE fees SET status = 'overdue' WHERE due_date < CURDATE() AND status IN ('pending', 'partial')"
        );
        if (result.affectedRows > 0) logger.info(`System flagged ${result.affectedRows} expired fees as overdue.`);
      } catch (err) {
        logger.error('Background task failed:', err.message);
      }
    };
    sweepOverdueFees(); // Run immediately on boot
    setInterval(sweepOverdueFees, 60 * 60 * 1000); // Check natively every hour
  });
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});
