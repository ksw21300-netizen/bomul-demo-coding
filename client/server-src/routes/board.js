import { Router } from 'express';
import { requireAdmin, requireUser } from '../middleware/auth.js';
import { createPost, createReply, deletePost, deleteReply, listPosts } from '../controllers/board.js';

const router = Router();

router.use(requireUser);
router.get('/', listPosts);
router.post('/', createPost);
router.post('/:id/replies', createReply);
router.delete('/:id/replies/:replyId', requireAdmin, deleteReply);
router.delete('/:id', deletePost);

export default router;
