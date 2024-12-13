import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Ścieżka do modelu użytkownika

const router = express.Router();
const JWT_SECRET = 'secretkey'; // Powinno być przechowywane w zmiennych środowiskowych

// Logowanie użytkownika
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ error: 'Użytkownik nie znaleziony' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Nieprawidłowe hasło' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(200).send({ token });
    } catch (error) {
        res.status(500).send({ error: 'Błąd serwera' });
    }
});

export default router;
