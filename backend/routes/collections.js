import express from 'express';
import Collection from '../models/Collection.js';

const router = express.Router();

router.put('/:id', async (req, res) => {
    try {
        const updatedCollection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('ownerId categoryId');
        if (!updatedCollection) {
            return res.status(404).send({ error: 'Kolekcja nie znaleziona' });
        }
        res.status(200).send(updatedCollection);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;
