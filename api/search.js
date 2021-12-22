const express = require('express');
const UserModel = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:searchText', authMiddleware, async ( req, res ) => {
    try {
        const { searchText } = req.params;
        if (searchText.length === 0 ) return;
        
        const results = await UserModel.find(
            {
                name: { 
                    $regex: searchText, 
                    $options: 'i' 
                } 
            }
        );
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;