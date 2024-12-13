import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import authenticateToken from '../middleware/authenticateToken.js'; // Poprawny import

const router = express.Router();

// Klucz JWT (powinien być przechowywany w zmiennych środowiskowych)
const JWT_SECRET = 'secretkey'; // Zmień na zmienną środowiskową w produkcji

// Rejestracja użytkownika
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Sprawdź, czy użytkownik już istnieje
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send({ error: 'Nazwa użytkownika jest zajęta' });
        }

        // Hashowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tworzenie nowego użytkownika
        const user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).send({ message: 'Użytkownik został zarejestrowany' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Logowanie użytkownika
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Znajdź użytkownika
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ error: 'Nieprawidłowe dane logowania' });
        }

        // Generowanie tokena JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.send({ token });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Endpoint profilu użytkownika
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Pomijamy hasło
        if (!user) {
            return res.status(404).send({ error: 'Użytkownik nie istnieje' });
        }
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;
