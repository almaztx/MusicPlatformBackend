import express from 'express';
import axios from 'axios';
//import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:name', async (req, res) => {
  try {
    const artistName = req.params.name;

    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(artistName)}&fmt=json&limit=1`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MusicPlatform/1.0 (almaztx@proton.me)'
      }
    });

    const artist = response.data.artists?.[0];
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const result = {
      name: artist.name,
      country: artist.area?.name || 'Unknown',
      birth_date: artist['life-span']?.begin || 'Unknown'
    };

    res.json(result);
  } catch (error) {
    console.error('MusicBrainz API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artist info' });
  }
});

export default router;