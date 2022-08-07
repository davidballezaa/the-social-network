const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");

// get user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update user
router.put("/:id", async (req, res) => {
  // add or isAdmin
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      // with $set we prevent overwriting whole document
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Your account was succesfully updated");
    } catch (err) {
      return res.status(400).json(err);
    }
  } else {
    return res.status(400).json("You can only update your account");
  }
});
// delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    const user = await User.deleteOne({ _id: req.params.id });
    res.status(200).json("Your account was succesfully deleted");
  } else {
    return res.status(400).json("You can only delete your account");
  }
});

// follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.body.userId);
      const newFollow = await User.findById(req.params.id);
      if (!newFollow.followers.includes(user)) {
        await user.updateOne({ $push: { following: req.params.id } });
        await newFollow.updateOne({ $push: { followers: req.body.userId } });
        res.status(200).json("User has been followed");
      } else {
        return res.status(403).json("You already follow this user");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can not follow yourself");
  }
});

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    const unfollow = await User.findById(req.params.id);
    await user.updateOne({ $pull: { following: req.params.id } });
    await unfollow.updateOne({ $pull: { followers: req.body.userId } });
    res.status(200).json("User has been unfollowed");
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
