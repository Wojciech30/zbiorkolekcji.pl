// Połączenie z MongoDB
import connectDB from "./config/database.js";
import collectionsRouter from "./routes/collections.js";
import userRouter from "./routes/user.js";
import itemsRouter from "./routes/items.js";
import categoriesRouter from "./routes/categories.js";
import authRouter from './routes/auth.js'; // Import trasy logowania
import cors from "cors";
import express from "express";




const app = express();

// Middleware
app.use(cors());
app.use(express.json());
connectDB();

// Używanie tras
app.use("/categories", categoriesRouter);
app.use('/auth', authRouter);
app.use('/collections', collectionsRouter);
app.use('/users', userRouter);
app.use('/items', itemsRouter);

// Trasa testowa
app.get('/', (req, res) => {
    res.send('Serwer działa poprawnie');
});

// Uruchomienie serwera
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serwer nasłuchuje na porcie ${port}`);
});
