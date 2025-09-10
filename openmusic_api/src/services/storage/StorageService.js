const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const ClientError = require('../../exceptions/ClientError');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  async writeFile(file, meta) {
    const ext = path.extname(meta.filename || '').toLowerCase();
    const filename = `cover-${nanoid(16)}${ext}`;
    const filepath = path.join(this._folder, filename);

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filepath);
      let fileSize = 0;
      const maxSize = 512000; // 512 KB
      let streamDestroyed = false;

      // Monitor ukuran file saat streaming
      file.on('data', (chunk) => {
        if (streamDestroyed) return;

        fileSize += chunk.length;
        if (fileSize > maxSize) {
          streamDestroyed = true;
          writeStream.destroy();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          reject(new ClientError('File too large', 413)); //  413 Payload Too Large
        }
      });

      file.pipe(writeStream);

      writeStream.on('finish', () => {
        if (!streamDestroyed) {
          const host = process.env.HOST || 'localhost';
          const port = process.env.PORT || 5000;
          const fileUrl = `http://${host}:${port}/uploads/${filename}`;
          resolve(fileUrl); //  langsung return URL
        }
      });

      writeStream.on('error', (error) => {
        if (!streamDestroyed) {
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          reject(error);
        }
      });

      file.on('error', (error) => {
        if (!streamDestroyed) {
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          reject(error);
        }
      });
    });
  }
}

module.exports = StorageService;
