import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { openDb } from '../db/database.js';

const router = express.Router();
const SECRET_KEY = 'supersecretkey';
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Пайдаланушыларды тіркеу және кіру
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Жаңа қолданушыны тіркеу
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: almaz
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Тіркеу сәтті өтті
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = await openDb();
    const existing = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Қолданушы жүйеге кіреді
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: user1
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Сәтті кіру және токен қайтару
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Қате логин немесе пароль
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;