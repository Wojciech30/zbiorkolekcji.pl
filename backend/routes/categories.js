import express from "express";
import Category from "../models/Category.js";
import Collection from "../models/Collection.js";
import authenticateToken from "../middleware/authenticateToken.js";
import checkAdmin from "../middleware/checkAdmin.js";

const router = express.Router();

const handleError = (res, error, defaultMessage) => {
    console.error(error);

    const response = {
        code: "CATEGORY_ERROR",
        message: error.message || defaultMessage
    };

    if (error.name === "ValidationError") {
        response.details = Object.values(error.errors).map(e => e.message);
        return res.status(400).json(response);
    }

    res.status(500).json(response);
};

// Tworzenie nowej kategorii
router.post("/", authenticateToken, checkAdmin, async (req, res) => {
    try {
        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            attributes: req.body.attributes
        });

        const savedCategory = await category.save();
        res.status(201).json({
            code: "CATEGORY_CREATED",
            category: savedCategory.toJSON()
        });
    } catch (error) {
        handleError(res, error, "Błąd tworzenia kategorii");
    }
});

// Pobieranie wszystkich kategorii
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find()
            .sort("-createdAt")
            .lean();

        res.json({
            code: "CATEGORIES_FETCHED",
            count: categories.length,
            categories
        });
    } catch (error) {
        handleError(res, error, "Błąd pobierania kategorii");
    }
});

// Aktualizacja kategorii
router.patch("/:id", authenticateToken, checkAdmin, async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            description: req.body.description,
            attributes: req.body.attributes
        };

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        if (!category) {
            return res.status(404).json({
                code: "CATEGORY_NOT_FOUND",
                message: "Kategoria nie istnieje"
            });
        }

        res.json({
            code: "CATEGORY_UPDATED",
            category
        });
    } catch (error) {
        handleError(res, error, "Błąd aktualizacji kategorii");
    }
});

// Usuwanie kategorii
router.delete("/:id", authenticateToken, checkAdmin, async (req, res) => {
    try {
        const categoryInUse = await Collection.exists({ category: req.params.id });

        if (categoryInUse) {
            return res.status(400).json({
                code: "CATEGORY_IN_USE",
                message: "Nie można usunąć kategorii używanej w kolekcjach"
            });
        }

        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                code: "CATEGORY_NOT_FOUND",
                message: "Kategoria nie istnieje"
            });
        }

        res.status(204).end();
    } catch (error) {
        handleError(res, error, "Błąd usuwania kategorii");
    }
});

export default router;