import JWTservice from "../services/Jwtservice.js";
import User from "../models/user.js";
import UserDTO from "../DTO/UserDto.js";
const auth = async (req, res, next) => {
  //validate accessToken and refreshToken
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken || !refreshToken) {
    const error = {
      status: 401,
      message: "unAuthorized!!!",
    };
    return next(error);
  }

  //verify accessToken

  let _id;
  try {
    _id = await JWTservice.verifyAccessToken(accessToken)._id;
  } catch (error) {
    return next(error);
  }
  let user;
  try {
    user = await User.findOne({ _id });
  } catch (error) {
    return next(error);
  }

  const userDto = new UserDTO(user);
  req.user = userDto;
  next();
};

export default auth;
