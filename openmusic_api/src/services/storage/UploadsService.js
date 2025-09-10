const fs = require('fs');
const path = require('path');

class UploadsService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const filepath = path.join(this._folder, filename);

    const fileStream = fs.createWriteStream(filepath);
    file.pipe(fileStream);

    return new Promise((resolve, reject) => {
      file.on('end', () => resolve(filename));
      file.on('error', (err) => reject(err));
    });
  }

  async addCoverUrl(albumId, fileLocation) {
    const { Pool } = require('pg');
    const pool = new Pool();

    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [fileLocation, albumId],
    };

    const result = await pool.query(query);
    if (!result.rowCount) {
      throw new Error('Gagal menambahkan cover ke album. Id tidak ditemukan');
    }
    return result.rows[0].id;
  }
}

module.exports = UploadsService;
