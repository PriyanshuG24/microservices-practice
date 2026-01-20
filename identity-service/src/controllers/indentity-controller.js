const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const generateToken = require("../utils/generateToken");
const generateTokens = require("../utils/generateToken");
//user registration
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit");
  try {
    //validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    user = new User({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateToken(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully!!",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error("Registation error occurred", error);
    return res.status(500).json({
      success: false,
      message: "Intenal server error",
    });
  }
};
//user login
const loginUser = async (req, res) => {
  logger.info("Login endpoints hit");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid User");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid Password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(user);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("Login error occurred", error);
    return res.status(500).json({
      success: false,
      message: "Intenal server error",
    });
  }
};

//refresh token

const refreshTokenUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token Missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid Refresh Token");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("Invalid User");
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);
    await RefreshToken.deleteOne({ _id: storedToken._id });
    await newRefreshToken.save();
    return res.status(200).json({
      success: true,
      message: "Refresh token updated successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occurred", error);
    return res.status(500).json({
      success: false,
      message: "Intenal server error",
    });
  }
};

//logout
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token Missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }
    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Logout successful");
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error occurred", error);
    return res.status(500).json({
      success: false,
      message: "Intenal server error",
    });
  }
};
module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser };
