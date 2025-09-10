require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const QUEUE = process.env.QUEUE_EXPORT_PLAYLIST || 'openmusic:export:playlists';
const RABBITMQ_URL = process.env.RABBITMQ_SERVER || 'amqp://127.0.0.1:5672';

const pool = new Pool(); // reads PG* from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function buildPlaylistJson(playlistId) {
  const p = await pool.query({ text: 'SELECT id, name FROM playlists WHERE id=$1', values: [playlistId] });
  if (!p.rowCount) throw new Error('Playlist tidak ditemukan');

  const s = await pool.query({
    text: `
      SELECT s.id, s.title, s.performer
      FROM playlistsongs ps JOIN songs s ON s.id = ps.song_id
      WHERE ps.playlist_id = $1
      ORDER BY s.title
    `,
    values: [playlistId],
  });

  return { playlist: { id: p.rows[0].id, name: p.rows[0].name, songs: s.rows } };
}

async function sendEmail(to, json) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Export Playlist OpenMusic',
    text: 'Playlist hasil export ada di lampiran.',
    attachments: [
      {
        filename: 'playlist.json',
        content: JSON.stringify(json, null, 2),
      },
    ],
  });
}

(async () => {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });
    ch.prefetch(1);
    console.log(`📨 Consumer listening on ${QUEUE}`);
    ch.consume(QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const { playlistId, targetEmail } = JSON.parse(msg.content.toString());
        console.log('processing playlist', playlistId, '->', targetEmail);
        const data = await buildPlaylistJson(playlistId);
        await sendEmail(targetEmail, data);
        ch.ack(msg);
        console.log('done', playlistId);
      } catch (e) {
        console.error('Consumer error:', e);
        ch.nack(msg, false, false); 
      }
    }, { noAck: false });
    process.on('SIGINT', async () => { await ch.close(); await conn.close(); process.exit(0); });
  } catch (err) {
    console.error('Failed to start consumer', err);
    process.exit(1);
  }
})();
