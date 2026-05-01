import express from 'express';
import jwt from 'jsonwebtoken';
import User from './User.js';

const router = express.Router();

// ============ SIGN UP ============
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
      name: name || username
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Signup successful!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        tmtBalance: user.tmtBalance
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed', message: err.message });
  }
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        tmtBalance: user.tmtBalance,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// ============ GMAIL LOGIN (OAuth Callback) ============
router.post('/gmail-login', async (req, res) => {
  try {
    const { googleId, email, name, profilePicture } = req.body;

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user from Gmail
      user = new User({
        googleId,
        email,
        username: email.split('@')[0], // Use email prefix as username
        name,
        profilePicture,
        isVerified: true
      });

      await user.save();
    } else {
      // Update profile picture if changed
      user.profilePicture = profilePicture;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Gmail login successful!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        tmtBalance: user.tmtBalance,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('Gmail login error:', err);
    res.status(500).json({ error: 'Gmail login failed', message: err.message });
  }
});

// ============ FORGOT PASSWORD ============
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, just return token
    res.json({
      message: '✅ Reset token sent to email',
      resetToken, // Only for development
      note: 'In production, this would be sent via email'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request', message: err.message });
  }
});

// ============ RESET PASSWORD ============
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update password
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '✅ Password reset successful!' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed', message: err.message });
  }
});

// ============ GET CURRENT USER ============
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(401).json({ error: 'Invalid token', message: err.message });
  }
});

export default router;