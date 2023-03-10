const { isTokenValid } = require("../Utlis/jwt");
const User = require("../Models/User_Model");
const CustomError = require("../errors");

exports.checTokenAuthentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomError.UnauthenticatedError("No token provided");
  }
  const token = authHeader.split(" ")[1];
  const userTokenInfo = isTokenValid(token);
  if (!token) {
    throw new CustomError.BadRequestError("No token provided");
  }
  req.user = {
    ...userTokenInfo,
  };
  next();
};

exports.checkAdminTokenAuthentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomError.UnauthenticatedError("No token provided");
  }
  const token = authHeader.split(" ")[1];
  const adminInfo = isTokenValid(token);
  if (!adminInfo) {
    throw new CustomError.BadRequestError("Somthing went wrong");
  }
  const findAdmin = await User.findById(adminInfo.userId);
  if (!findAdmin) {
    throw new CustomError.UnauthenticatedError("Not authenticated");
  }
  if (findAdmin.authorization !== "FJ5vERQckWlagJm") {
    throw new CustomError.UnauthorizedError("Not authorized");
  }
  next();
};
