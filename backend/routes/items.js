import express from "express";
import Item from "../models/Item.js";
import Collection from "../models/Collection.js";
import Category from "../models/Category.js";
import authenticateToken from "../middleware/authenticateToken.js";
import checkAdmin from "../middleware/checkAdmin.js";

const router = express.Router();

const handleError = (res, error, defaultMessage) => {
    console.error(error);

    const response = {
        code: "ITEM_ERROR",
        message: error.message || defaultMessage
    };

    if (error.name === "ValidationError") {
        response.details = Object.values(error.errors).map(e => e.message);
        return res.status(400).json(response);
    }

    res.status(500).json(response);
};

// Middleware do walidacji atrybutów
const validateAttributes = async (req, res, next) => {
    try {
        const collection = await Collection.findById(req.body.collection)
            .populate("category");

        if (!collection) {
            return res.status(404).json({
                code: "COLLECTION_NOT_FOUND",
                message: "Kolekcja nie istnieje"
            });
        }

        const category = await Category.findById(collection.category);
        const attributesSchema = new Map(
            category.attributes.map(attr => [attr.name, attr])
        );

        const errors = [];
        const attributes = req.body.attributes || {};

        // Walidacja wymaganych atrybutów
        for (const [name, schema] of attributesSchema) {
            if (schema.required && !attributes.has(name)) {
                errors.push(`Atrybut '${name}' jest wymagany`);
            }
        }

        // Walidacja typów
        for (const [name, value] of Object.entries(attributes)) {
            const schema = attributesSchema.get(name);
            if (!schema) {
                errors.push(`Nieznany atrybut '${name}'`);
                continue;
            }

            if (typeof value.value !== schema.type && schema.type !== "select") {
                errors.push(`Nieprawidłowy typ dla atrybutu '${name}'`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                code: "INVALID_ATTRIBUTES",
                message: "Błędy w atrybutach",
                errors
            });
        }

        req.collection = collection;
        next();
    } catch (error) {
        handleError(res, error, "Błąd walidacji atrybutów");
    }
};

// Tworzenie nowego przedmiotu
router.post("/", authenticateToken, validateAttributes, async (req, res) => {
        try {
            const item = await Item.create({
                ...req.body,
                createdBy: req.user._id
            });

            res.status(201).json({
                code: "ITEM_CREATED",
                item: item.toJSON()
            });
        } catch (error) {
            handleError(res, error, "Błąd tworzenia przedmiotu");
        }
    }
);

// Aktualizacja przedmiotu
router.patch("/:id", authenticateToken, validateAttributes, async (req, res) => {
        try {
            const item = await Item.findById(req.params.id);

            if (!item) {
                return res.status(404).json({
                    code: "ITEM_NOT_FOUND",
                    message: "Przedmiot nie istnieje"
                });
            }

            // Sprawdź uprawnienia
            const isOwner = item.createdBy.toString() === req.user._id.toString();
            const isAdmin = req.user.role === "admin";
            const canEdit = isOwner || isAdmin || req.collection.privacy === "public";

            if (!canEdit) {
                return res.status(403).json({
                    code: "EDIT_DENIED",
                    message: "Brak uprawnień do edycji"
                });
            }

            const updatedItem = await Item.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            res.json({
                code: "ITEM_UPDATED",
                item: updatedItem.toJSON()
            });
        } catch (error) {
            handleError(res, error, "Błąd aktualizacji przedmiotu");
        }
    }
);

// Usuwanie przedmiotu
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                code: "ITEM_NOT_FOUND",
                message: "Przedmiot nie istnieje"
            });
        }

        const isOwner = item.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                code: "DELETE_DENIED",
                message: "Brak uprawnień do usunięcia"
            });
        }

        await item.deleteOne();
        res.status(204).end();
    } catch (error) {
        handleError(res, error, "Błąd usuwania przedmiotu");
    }
});

// Wyszukiwanie przedmiotów
router.get("/search", async (req, res) => {
    try {
        const { query, collection, category } = req.query;
        const searchFilter = {
            $text: { $search: query }
        };

        if (collection) searchFilter.collection = collection;
        if (category) {
            const collections = await Collection.find({ category }).distinct("_id");
            searchFilter.collection = { $in: collections };
        }

        const items = await Item.find(searchFilter)
            .populate("collection", "name")
            .limit(50)
            .lean();

        res.json({
            code: "ITEMS_FOUND",
            count: items.length,
            items
        });
    } catch (error) {
        handleError(res, error, "Błąd wyszukiwania");
    }
});

export default router;