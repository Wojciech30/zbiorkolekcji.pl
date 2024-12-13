import Category from "../models/Category.js";// Import modelu kategorii
import express from "express";
const router = express.Router();

// Tworzenie nowej kategorii
router.post('/', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).send(category);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Pobieranie wszystkich kategorii
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;
