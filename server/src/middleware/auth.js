import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !decoded.sessionId || user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.sessionId = decoded.sessionId;
    console.log('Auth middleware - userId:', req.userId, 'role:', req.userRole);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;