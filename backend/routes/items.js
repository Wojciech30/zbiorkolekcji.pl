import express from 'express';
import Item from '../models/Item.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate({ path: 'collectionId', populate: { path: 'ownerId categoryId' } });
        if (!item) {
            return res.status(404).send({ error: 'Przedmiot nie znaleziony' });
        }
        res.status(200).send(item);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;