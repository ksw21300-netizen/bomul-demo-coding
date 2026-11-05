import { Router } from 'express';
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/users.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', createUser);
router.get('/', requireAdmin, listUsers);
router.get('/:id', requireAdmin, getUser);
router.patch('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
