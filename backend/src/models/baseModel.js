const { pool } = require('../config/db');

class BaseModel {
  constructor(tableName, primaryKey) {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  async findAll(filters = null) {
    if (!filters || Object.keys(filters).length === 0) {
      const [rows] = await pool.query('SELECT * FROM ??', [this.tableName]);
      return rows;
    }

    const conditions = [];
    const params = [this.tableName];

    Object.entries(filters).forEach(([column, value]) => {
      if (value === undefined || value === null || value === '') return;
      conditions.push('?? = ?');
      params.push(column, value);
    });

    const sql = `SELECT * FROM ??${conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''}`;
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM ?? WHERE ?? = ? LIMIT 1', [
      this.tableName,
      this.primaryKey,
      id,
    ]);
    return rows[0] || null;
  }

  async create(data) {
    const [result] = await pool.query('INSERT INTO ?? SET ?', [this.tableName, data]);
    return this.findById(result.insertId);
  }

  async update(id, data) {
    await pool.query('UPDATE ?? SET ? WHERE ?? = ?', [
      this.tableName,
      data,
      this.primaryKey,
      id,
    ]);
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await pool.query('DELETE FROM ?? WHERE ?? = ?', [
      this.tableName,
      this.primaryKey,
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = BaseModel;
