const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const FollowerModel = require('../models/FollowerModel');
const authMiddleware = require('../middleware/authMiddleware');
const uuid = require('uuid').v4;

// Create a post
router.post("/", authMiddleware, async (req, res) => {
    const { text, location, picUrl } = req.body;
  
    if (text.length < 1)
      return res.status(401).send("Text must be atleast 1 character");
  
    try {
      const newPost = {
        user: req.userId,
        text
      };
      if (location) newPost.location = location;
      if (picUrl) newPost.picUrl = picUrl;
  
      const post = await new PostModel(newPost).save();
  
      const postCreated = await PostModel.findById(post._id).populate("user");
  
      return res.json(postCreated);
    } catch (error) {
      console.error(error);
      return res.status(500).send(`Server error`);
    }
});

// Get all posts
router.get('/', authMiddleware, async (req, res) => {
    const { pageNumber } = req.query;

    try {
        const number = Number(pageNumber);
        const size = 8;
        const { userId } = req;

        const loggedUser = await FollowerModel.findOne({ user: userId }).select('-followers');

        let posts = [];

        if (number === 1) {
            if (loggedUser.following.length > 0) {
                posts = await PostModel.find({ 
                    user: { 
                        $in: [ userId, ...loggedUser.following.map(following => following.user) ]
                    } 
                })
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate('user')
                    .populate('comments.user')
            } else {
                posts = await PostModel.find({ user: userId })
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate('user')
                    .populate('comments.user');
            }
        } else {
            const skips = size * (number - 1);

            if (loggedUser.following.length > 0) {
                posts = await PostModel.find({ 
                    user: { 
                        $in: [ userId, ...loggedUser.following.map(following => following.user) ]
                    } 
                })
                    .skip(skips)
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate('user')
                    .populate('comments.user')
            } else {
                posts = await PostModel.find({ user: userId })
                    .skip(skips)
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate('user')
                    .populate('comments.user');
            }
        }

        return res.json(posts);
        
    } catch (error) {
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

// Like a post
router.post('/like/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req;

        const post = await PostModel.findById(postId);
        if (!post) {
            res.status(404).send('Post not found');
        }
        const isLiked = post.likes.filter( like => like.user.toString() === userId).length > 0;

        if (isLiked) {
            return res.status(401).send('Post already liked');
        }

        await post.likes.unshift({ user: userId });
        await post.save();

        return res.status(200).send('Post liked');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Unlike a post
router.put('/unlike/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req;

        const post = await PostModel.findById(postId);
        if (!post) {
            res.status(404).send('Post not found');
        }
        const isLiked = post.likes.filter( like => like.user.toString() === userId).length === 0;

        if (isLiked) {
            return res.status(401).send('Post not liked');
        }

        const index = post.likes.map(like => like.user.toString()).indexOf(userId);

        await post.likes.splice(index, 1);
        await post.save();

        return res.status(200).send('Post unliked');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Get all likes
router.get('/like/:postId', async (req,res) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId).populate('likes.user');

        if (!post) {
            res.status(404).send('Post not found');
        }

        return res.status(200).json(post.likes)

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Create a comment
router.post('/comment/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (text.length < 1) return res.status(401).send('Comment should be at least 1 character');

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).send('Post not found');

        const newComment = {
            _id: uuid(),
            text,
            user: req.userId,
            date: Date.now()
        };

        await post.comments.unshift(newComment);
        await post.save();

        return res.status(200).json(newComment._id);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

// Delete a comment
router.delete('/:postId/:commentId', authMiddleware, async (req,res) => {
    try {
        const { postId, commentId } = req.params;
        const { userId } = req;

        const post = await PostModel.findById(postId);
        if(!post) return res.status(404).send('Post not found');

        const comment = post.comments.find(comment => comment._id === commentId);
        if (!comment) return res.status(404).send('No comment found');

        const user = await UserModel.findById(userId);

        const deleteComment = async () => {
            const indexOf = post.comments.map(comment => comment._id).indexOf(commentId);

            await post.comments.splice(indexOf, 1);
            await post.save();

            return res.status(200).send('Comment deleted successfully');
        };

        if (comment.user.toString() !== userId) {
            if (user.role === 'root') {
                await deleteComment();
            } else {
                return res.status(401).send('Unauthorized');
            }
        }
        
        await deleteComment();
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;