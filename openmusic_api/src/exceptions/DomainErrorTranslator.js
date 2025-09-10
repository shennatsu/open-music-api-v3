// src/exceptions/DomainErrorTranslator.js
const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');
const AuthenticationError = require('./AuthenticationError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {

    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('Gagal menambahkan user. Properti yang dibutuhkan tidak ada.'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Gagal menambahkan user. Tipe data tidak sesuai.'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('Gagal menambahkan user. Username terlalu panjang.'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('Gagal menambahkan user. Username mengandung karakter terlarang.'),

  // Playlist
  'PLAYLIST.NOT_FOUND': new NotFoundError('Playlist tidak ditemukan.'),
  'PLAYLIST.NOT_AUTHORIZED': new AuthorizationError('Anda tidak berhak mengakses resource ini.'),

  // Authentication
  'AUTHENTICATION.INVALID_TOKEN': new AuthenticationError('Token tidak valid.'),
  'AUTHENTICATION.MISSING_TOKEN': new AuthenticationError('Token tidak ada.'),
};

module.exports = DomainErrorTranslator;
