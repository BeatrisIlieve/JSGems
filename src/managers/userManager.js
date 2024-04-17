const bcrypt = require("bcrypt");
const jwt = require("../lib/jwt");
const User = require("../models/User");
const profileManager = require("./profileManager");
// const {SECRET} = require("../config/config");
const { SECRET, BAG_ITEMS, WISHLIST_ITEMS } = require("../config/config");

exports.register = async (userData) => {
  const user = await User.findOne({email: userData.email});

  if (user) {
    throw new Error("Email already exists!");
  }
  
  const createdUser = await User.create(userData);

  const token = await generateToken(createdUser);

  await profileManager.createProfile(createdUser._id);

  return token;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Cannot find email or password!");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Cannot find email or password!");
  }

  const token = await generateToken(user);

  return token;
};

async function generateToken(user) {
  const payload = {
    _id: user._id,
    email: user.email,
  }

  const token = await jwt.sign(payload, SECRET, {expiresIn: "7d"});

  return token;
};

exports.delete = (userId) => User.findByIdAndDelete(userId);
