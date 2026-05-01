import jwt from 'jsonwebtoken';

// ============ JWT VERIFICATION MIDDLEWARE ============
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token', message: err.message });
  }
};

// ============ ADMIN/OWNER ONLY ============
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    // Import User model dynamically to avoid circular imports
    const { default: User } = await import('./User.js');
    const user = await User.findById(decoded.userId);

    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(401).json({ error: 'Invalid token', message: err.message });
  }
};

// ============ OWNER ONLY ============
export const verifyOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    // Import User model dynamically
    const { default: User } = await import('./User.js');
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'owner') {
      return res.status(403).json({ error: 'Owner access required' });
    }

    next();
  } catch (err) {
    console.error('Owner verification error:', err);
    res.status(401).json({ error: 'Invalid token', message: err.message });
  }
};

export default verifyToken;