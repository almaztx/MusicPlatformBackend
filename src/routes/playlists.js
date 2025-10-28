import express from "express";
import { openDb } from "../db/database.js";

const router = express.Router();

// Барлық плейлисттер
router.get("/", async (req, res) => {
  const db = await openDb();
  const playlists = await db.all("SELECT * FROM playlists");
  res.json(playlists);
});

// Бір плейлист
router.get("/:id", async (req, res) => {
  const db = await openDb();
  const playlist = await db.get("SELECT * FROM playlists WHERE id = ?", [req.params.id]);
  if (!playlist) return res.status(404).json({ error: "Плейлист табылмады" });

  // Плейлисттегі әндерді алу
  const songs = await db.all(
    `SELECT s.* FROM songs s
     JOIN playlist_songs ps ON s.id = ps.song_id
     WHERE ps.playlist_id = ?`,
    [req.params.id]
  );

  res.json({ ...playlist, songs });
});

// Плейлист жасау
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name қажет" });

  const db = await openDb();
  const result = await db.run(
    "INSERT INTO playlists (name, description) VALUES (?, ?)",
    [name, description]
  );
  res.status(201).json({ id: result.lastID, name, description });
});

// Плейлистке ән қосу
router.post("/:id/songs", async (req, res) => {
  const { song_id } = req.body;
  const db = await openDb();

  // Плейлист пен ән бар ма — тексеру
  const playlist = await db.get("SELECT * FROM playlists WHERE id = ?", [req.params.id]);
  const song = await db.get("SELECT * FROM songs WHERE id = ?", [song_id]);
  if (!playlist) return res.status(404).json({ error: "Плейлист табылмады" });
  if (!song) return res.status(404).json({ error: "Ән табылмады" });

  await db.run("INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)", [
    req.params.id,
    song_id,
  ]);
  res.json({ message: "Ән плейлистке қосылды" });
});

// Плейлист жою
router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM playlists WHERE id = ?", [req.params.id]);
  res.json({ message: "Плейлист жойылды" });
});

export default router;