const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// READ - Users can access only their own data, Admin can access all users
router.get('/fetch/:id', authMiddleware, roleMiddleware(['admin', 'user']), async (req, res) => {
  try {
    const { id } = req.params;

    // If the user is not admin and trying to access someone else's data
    if (req.user.role === 'user' && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied. You can only view your own data." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server error' });
  }
});


// UPDATE - Users can update their own data, Admin can update all users
router.put('/update/:id', authMiddleware, roleMiddleware(['admin', 'user']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // If the user is not admin and trying to update someone else's data
    if (req.user.role === 'user' && req.user.id !== id) {
      return res.status(403).json({ message: "You can only update your own data." });
    }
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server error' });
  }
});


// DELETE - Users can delete their own account, Admin can delete any user
router.delete('/delete/:id', authMiddleware, roleMiddleware(['admin', 'user']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // If the user is not admin and trying to delete someone else's account
    if (req.user.role === 'user' && req.user.id !== id) {
      return res.status(403).json({ message: "You can only delete your own account." });
    }
    await User.findByIdAndDelete(id);
    return res.status(204).json({message:"User Deleted"});
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server error' });
  }
});

module.exports = router;