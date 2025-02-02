import express from "express";
import Collection from "../models/Collection.js";
import Item from "../models/Item.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {validateAllowedUsers, verifyCollectionAccess, verifyCollectionOwnership} from "../middleware/collectionMiddleware.js";

const router = express.Router();

const handleError = (res, error, defaultMessage) => {
    console.error(error);

    const response = {
        code: "COLLECTION_ERROR",
        message: error.message || defaultMessage
    };

    if (error.name === "ValidationError") {
        response.details = Object.values(error.errors).map(e => e.message);
        return res.status(400).json(response);
    }
    res.status(500).json(response);
};

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            code: 'INVALID_ID_FORMAT',
            message: 'Nieprawidłowy format identyfikatora'
        });
    }
    next();
};

router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const filter = { privacy: "public" };

        if (category) filter.category = category;
        if (search) filter.$text = { $search: search };

        const collections = await Collection.find(filter)
            .populate("owner", "username")
            .populate("category", "name")
            .sort("-createdAt")
            .limit(limit)
            .skip((page - 1) * limit);

        const count = await Collection.countDocuments(filter);

        res.json({
            code: "COLLECTIONS_FETCHED",
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            collections
        });
    } catch (error) {
        handleError(res, error, "Błąd pobierania kolekcji");
    }
});

router.get("/:id/attributes", async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id)
            .populate("category", "attributes");

        if (!collection) {
            return res.status(404).json({
                code: "COLLECTION_NOT_FOUND",
                message: "Kolekcja nie istnieje"
            });
        }

        res.json({
            code: "ATTRIBUTES_FETCHED",
            attributes: collection.category.attributes
        });
    } catch (error) {
        console.error("Błąd pobierania atrybutów kategorii:", error);
        res.status(500).json({
            code: "ATTRIBUTE_FETCH_ERROR",
            message: "Błąd pobierania atrybutów kategorii"
        });
    }
});

router.get("/:id", validateObjectId, async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id)
            .populate({
                path: "category",
                select: "name attributes"
            })
            .populate("allowedUsers", "username");

        if (!collection) {
            return res.status(404).json({
                code: "COLLECTION_NOT_FOUND",
                message: "Kolekcja nie istnieje"
            });
        }

        res.json({
            code: "COLLECTION_FETCHED",
            collection
        });
    } catch (error) {
        handleError(res, error, "Błąd pobierania kolekcji");
    }
});

router.post("/", authenticateToken, validateAllowedUsers, async (req, res) => {
    try {
        const { name, category, privacy, allowedUsers } = req.body;

        const collectionData = {
            name,
            category,
            owner: req.user._id,
            privacy: privacy || "public",
            allowedUsers
        };

        const collection = await Collection.create(collectionData);

        res.status(201).json({
            code: "COLLECTION_CREATED",
            collection: collection.toJSON()
        });
    } catch (error) {
        handleError(res, error, "Błąd tworzenia kolekcji");
    }
});

router.patch("/:id", authenticateToken, verifyCollectionAccess, verifyCollectionOwnership, validateAllowedUsers, async (req, res) => {
        try {
            const allowedUpdates = ["name", "description", "privacy", "coverImage", "allowedUsers"];
            const updates = Object.keys(req.body)
                .filter(key => allowedUpdates.includes(key))
                .reduce((obj, key) => {
                    obj[key] = req.body[key];
                    return obj;
                }, {});

            const updatedCollection = await Collection.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true, runValidators: true }
            ).populate("category", "name");

            res.json({
                code: "COLLECTION_UPDATED",
                collection: updatedCollection
            });
        } catch (error) {
            handleError(res, error, "Błąd aktualizacji kolekcji");
        }
    }
);

router.delete("/:id",
    authenticateToken,
    verifyCollectionAccess,
    verifyCollectionOwnership,
    async (req, res) => {
        try {
            await req.collection.deleteOne();
            res.status(204).end();
        } catch (error) {
            handleError(res, error, "Błąd usuwania kolekcji");
        }
    }
);

router.get("/special/popular", async (req, res) => {
    try {
        const popularCollections = await Collection.find()
            .sort({ views: -1 })
            .limit(10)
            .populate("owner", "username");

        res.json({
            code: "POPULAR_COLLECTIONS",
            collections: popularCollections
        });
    } catch (error) {
        handleError(res, error, "Błąd pobierania popularnych kolekcji");
    }
});

router.get("/:id/stats", async (req, res) => {
    try {
        const itemsCount = await Item.countDocuments({ parentCollection: req.params.id });
        const collection = await Collection.findById(req.params.id)
            .populate("owner", "username")
            .populate("category", "name");

        res.json({
            code: "COLLECTION_STATS",
            itemsCount,
            views: collection.views,
            created: collection.createdAt
        });
    } catch (error) {
        handleError(res, error, "Błąd pobierania statystyk");
    }
});

router.post("/:id/view", async (req, res) => {
    try {
        await Collection.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } }
        );
        res.status(204).end();
    } catch (error) {
        handleError(res, error, "Błąd aktualizacji licznika");
    }
});

// Pobierz listę użytkowników z dostępem
router.get('/:id/allowed-users',
    authenticateToken,
    verifyCollectionAccess,
    async (req, res) => {
        try {
            const collection = await Collection.findById(req.params.id)
                .populate('allowedUsers', 'username email')
                .select('allowedUsers');

            res.json({
                code: 'ALLOWED_USERS_FETCHED',
                users: collection.allowedUsers
            });
        } catch (error) {
            handleError(res, error, 'Błąd pobierania listy dostępu');
        }
    }
);

// Dodaj użytkowników do listy dostępu
router.post('/:id/allowed-users',
    authenticateToken,
    verifyCollectionOwnership,
    async (req, res) => {
        try {
            const { userIds } = req.body;

            // Walidacja wejścia
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    code: 'INVALID_USER_IDS',
                    message: 'Należy podać tablicę ID użytkowników'
                });
            }

            // Sprawdź istnienie użytkowników
            const existingUsers = await mongoose.model('User').countDocuments({
                _id: { $in: userIds }
            });

            if (existingUsers !== userIds.length) {
                return res.status(404).json({
                    code: 'SOME_USERS_NOT_FOUND',
                    message: 'Niektóre ID użytkowników są nieprawidłowe'
                });
            }

            // Aktualizacja kolekcji
            const updatedCollection = await Collection.findByIdAndUpdate(
                req.params.id,
                {
                    $addToSet: { allowedUsers: { $each: userIds } },
                    $set: { privacy: 'private' }
                },
                { new: true }
            ).populate('allowedUsers', 'username email');

            res.json({
                code: 'USERS_ADDED_TO_COLLECTION',
                addedCount: userIds.length,
                allowedUsers: updatedCollection.allowedUsers
            });
        } catch (error) {
            handleError(res, error, 'Błąd dodawania użytkowników');
        }
    }
);

// Usuń użytkownika z listy dostępu
router.delete('/:id/allowed-users/:userId',
    authenticateToken,
    verifyCollectionOwnership,
    async (req, res) => {
        try {
            const updatedCollection = await Collection.findByIdAndUpdate(
                req.params.id,
                { $pull: { allowedUsers: req.params.userId } },
                { new: true }
            ).populate('allowedUsers', 'username email');

            res.json({
                code: 'USER_REMOVED_FROM_COLLECTION',
                removedUserId: req.params.userId,
                allowedUsers: updatedCollection.allowedUsers
            });
        } catch (error) {
            handleError(res, error, 'Błąd usuwania użytkownika');
        }
    }
);

export default router;