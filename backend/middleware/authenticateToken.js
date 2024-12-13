import jwt from 'jsonwebtoken';

const JWT_SECRET = 'secretkey'; // Powinien być w zmiennych środowiskowych

export default function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ error: 'Brak tokena uwierzytelniającego' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ error: 'Nieprawidłowy token' });
        }
        req.user = user; // Dodaj dane użytkownika z tokena
        next();
    });
}
