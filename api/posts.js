const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const FollowerModel = require('../models/FollowerModel');
const authMiddleware = require('../middleware/authMiddleware');

// Create a post
router.post('/', authMiddleware, async (req, res) => {
    const { text, location, picUrl } = req.body;
    if (text.length < 1) return res.status(401).send('Text must be at least 1 character');

    try {
        const newPost = {
            user: req.userId,
            text
        }
        if (location) newPost.location = location;
        if (picUrl) newPost.picUrl = picUrl;

        const post = await new PostModel(newPost).save();

        return res.json(post);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Get all posts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .populate('user')
            .populate('comments.user');
        return res.json(posts);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Get post by id
router.get('/:postId', authMiddleware, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.postId);
    
        if (!post) return res.status(404).send('Post not found');

        return res.json(post);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req;
        const { postId } = req.params;

        const post = await PostModel.findById(postId);

        if (!post) return res.status(404).send('Post not found');

        const user = await UserModel.findById(userId);

        if (post.user.toString() !== userId) {
            if (user.role === 'root') {
                await post.remove();
                res.status(200).send('Post deleted successfully');
            } else {
                res.status(401).send('Unauthorized');
            }
        }

        await post.remove();
        res.status(200).send('Post deleted successfully');

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});


module.exports = router;