const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 20, student_id, fee_id } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (student_id) { where += ' AND p.student_id = ?'; params.push(student_id); }
  if (fee_id) { where += ' AND p.fee_id = ?'; params.push(fee_id); }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM payments p ${where}`, params
  );
  const total = countRows[0].total;
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await pool.query(
    `SELECT p.id, p.amount_paid, p.payment_method, p.transaction_ref,
            p.payment_date, p.notes, p.created_at,
            s.full_name AS student_name, s.roll_number,
            f.fee_type, f.description AS fee_description, f.amount AS fee_amount,
            a.full_name AS received_by_name
     FROM payments p
     JOIN students s ON p.student_id = s.id
     JOIN fees f ON p.fee_id = f.id
     LEFT JOIN admins a ON p.received_by = a.id
     ${where}
     ORDER BY p.payment_date DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return { data: rows, total, page, limit };
};

const create = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { fee_id, student_id, amount_paid, payment_method, transaction_ref, received_by, notes } = data;

    const [result] = await conn.execute(
      `INSERT INTO payments (fee_id, student_id, amount_paid, payment_method, transaction_ref, received_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fee_id, student_id, amount_paid, payment_method, transaction_ref || null,
       received_by || null, notes || null]
    );

    // Recalculate fee status
    const [feeRows] = await conn.execute('SELECT amount FROM fees WHERE id = ?', [fee_id]);
    const [payRows] = await conn.execute(
      'SELECT SUM(amount_paid) AS total_paid FROM payments WHERE fee_id = ?', [fee_id]
    );
    const feeTotalAmount = parseFloat(feeRows[0].amount);
    const totalPaid = parseFloat(payRows[0].total_paid || 0);

    let newStatus = 'pending';
    if (totalPaid >= feeTotalAmount) newStatus = 'paid';
    else if (totalPaid > 0) newStatus = 'partial';

    await conn.execute('UPDATE fees SET status = ? WHERE id = ?', [newStatus, fee_id]);
    await conn.commit();

    const [newPayment] = await conn.execute(
      'SELECT * FROM payments WHERE id = ?', [result.insertId]
    );
    return newPayment[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { findAll, create };
