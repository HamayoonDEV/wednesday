import Joi from "joi";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import UserDTO from "../DTO/UserDto.js";
import JWTservice from "../services/Jwtservice.js";
import RefreshToken from "../models/token.js";
const passwordPattren =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,64}$/;
const controller = {
  //register controller
  async register(req, res, next) {
    //validate user input
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattren).required(),
      confirmpassword: Joi.ref("password"),
    });
    //validate userRegisterSchema
    const { error } = userRegisterSchema.validate(req.body);
    //if error occurs middleWare will handle it
    if (error) {
      return next(error);
    }
    const { username, name, email, password } = req.body;
    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    //match the email and username if already in use
    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 409,
          message: "email is already in use please use another email!!",
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: "username is not available please choose anOther!!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //storing in databse
    let user;

    try {
      const userToRegister = new User({
        username,
        name,
        email,
        password: hashedPassword,
      });
      user = await userToRegister.save();
    } catch (error) {
      return next(error);
    }
    //genrating tokens
    const accessToken = JWTservice.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JWTservice.signRefreshToken({ _id: user._id }, "60m");
    //storing refresh token in database
    await JWTservice.storeRefreshToken(refreshToken, user._id);
    //sending tokens to the cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    //sending response
    res.status(201).json({ user, auth: true });
  },

  //login controller
  async login(req, res, next) {
    //validate user input
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattren).required(),
    });
    //validate user login schema
    const { error } = userLoginSchema.validate(req.body);
    //if error occurs middleware will handle it
    if (error) {
      return next(error);
    }
    const { username, password } = req.body;
    //fetch username and password from db
    let user;
    try {
      user = await User.findOne({ username });
      if (!user) {
        const error = {
          status: 401,
          message: "invalid username!!!",
        };
        return next(error);
      }
      //match password using bcrypt
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "invalid password!!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //genrate token
    const accessToken = JWTservice.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JWTservice.signRefreshToken({ _id: user._id }, "60m");
    //update refreshToken in database
    try {
      await RefreshToken.updateOne(
        { _id: user._id },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
    //sending tokens to the cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    //sending response
    const userDto = new UserDTO(user);
    res.status(200).json({ user: userDto, auth: true });
  },

  //logout controller
  async logout(req, res, next) {
    //fetch refreshToken from cookies
    const { refreshToken } = req.cookies;
    //delete refreshToken from database
    let user;
    try {
      user = await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }
    //clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    //sending response
    res.status(200).json({ user: null, auth: false });
  },

  //refresh controller
  async refresh(req, res, next) {
    //fetch refresh token from cookies
    const originalRefreshToken = req.cookies.refreshToken;
    //verify refreshToken
    let _id;
    try {
      _id = await JWTservice.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "unAuthorized!!",
      };
      return next(error);
    }
    //match the refreshToken and id
    try {
      const match = await RefreshToken.findOne({
        _id: _id,
        token: originalRefreshToken,
      });

      if (!match) {
        const error = {
          status: 401,
          message: "unAuthorized!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //gentate tokens
    try {
      const accessToken = JWTservice.signAccessToken({ _id: _id }, "30m");
      const refreshToken = JWTservice.signRefreshToken({ _id: _id }, "60m");
      //update refresh token
      await RefreshToken.updateOne(
        { _id: _id },
        {
          token: refreshToken,
        }
      );
      //sending tokens to the cookies
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }
    const user = await User.findOne({ _id });
    const userDto = new UserDTO(user);
    //sending response
    res.status(200).json({ user: userDto });
  },
};

export default controller;
