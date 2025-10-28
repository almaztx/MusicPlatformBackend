import express from "express";
import { openDb } from "../db/database.js";

const router = express.Router();

// Барлық артистер
router.get("/", async (req, res) => {
  const db = await openDb();
  const artists = await db.all("SELECT * FROM artists");
  res.json(artists);
});

// Бір артист
router.get("/:id", async (req, res) => {
  const db = await openDb();
  const artist = await db.get("SELECT * FROM artists WHERE id = ?", [req.params.id]);
  if (artist) res.json(artist);
  else res.status(404).json({ error: "Артист табылмады" });
});

// Артист қосу
router.post("/", async (req, res) => {
  const { name, country, debut_year } = req.body;
  if (!name) return res.status(400).json({ error: "Name қажет" });

  const db = await openDb();
  const result = await db.run(
    "INSERT INTO artists (name, country, debut_year) VALUES (?, ?, ?)",
    [name, country, debut_year]
  );
  res.status(201).json({ id: result.lastID, name, country, debut_year });
});

// Артист жаңарту
router.put("/:id", async (req, res) => {
  const { name, country, debut_year } = req.body;
  const db = await openDb();
  await db.run(
    "UPDATE artists SET name = ?, country = ?, debut_year = ? WHERE id = ?",
    [name, country, debut_year, req.params.id]
  );
  res.json({ message: "Артист жаңартылды" });
});

// Артист жою
router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM artists WHERE id = ?", [req.params.id]);
  res.json({ message: "Артист жойылды" });
});

export default router;