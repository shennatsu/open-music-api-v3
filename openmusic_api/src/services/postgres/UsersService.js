const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() { this._pool = new Pool(); }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1,$2,$3,$4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    const result = await this._pool.query(query);
    
    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const res = await this._pool.query({ text: 'SELECT username FROM users WHERE username=$1', values: [username] });
    if (res.rowCount) throw new InvariantError('Username sudah digunakan');
  }

  async getUserByUsername(username) {
    const res = await this._pool.query({ text: 'SELECT id, password FROM users WHERE username=$1', values: [username] });
    if (!res.rowCount) throw new AuthenticationError('Kredensial salah');
    return res.rows[0];
  }

  async getUsernameById(userId) {
    const res = await this._pool.query({ text: 'SELECT username FROM users WHERE id=$1', values: [userId] });
    if (!res.rowCount) throw new NotFoundError('User tidak ditemukan');
    return res.rows[0].username;
  }
}
module.exports = UsersService;
