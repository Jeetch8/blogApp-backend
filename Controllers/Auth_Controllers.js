const CustomError = require("../errors");
const { createJWT } = require("../Utlis/jwt");
const User = require("../Models/User_Model");

const register = async (req, res) => {
  const { email, name, password, profileImg } = req.body;
  console.log(req.body);

  if (!email || !name || !password) {
    throw new CustomError.BadRequestError(
      "Please fill in all details to register"
    );
  }

  const emailAlreadyExists = await User.findOne({ email });
  console.log(emailAlreadyExists);
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    profileImg,
  });
  if (!user) {
    throw new CustomError.BadRequestError("Something went wrong");
  }
  console.log(user);
  const token = await createJWT(
    { userId: user._id, userName: user.name },
    "30d"
  );
  if (!token) {
    throw new CustomError.CustomAPIError("Something went wrong");
  }

  res.status(200).json({
    success: true,
    profileImg: user.profileImg,
    userName: user.name,
    email: user.email,
    address: user.address,
    userId: user._id,
    token,
  });
};

const verifyEmailforRegistration = async (req, res) => {
  const { id } = req.params;
  const search = await User.findOne({ accountVerification: id });
  if (!search) {
    throw new CustomError.BadRequestError("Link is not valid");
  }
  search.accountVerification = "verified";
  await search.save();

  res.status(201).json({ success: true, msg: "Email Verified Successfully" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError("Email not found");
  }
  const compPass = await user.checkCryptedPassword(password);
  if (!compPass) {
    throw new CustomError.UnauthorizedError("Password was incorrect");
  }
  const token = await createJWT(
    { userId: user._id, userName: user.name, role: "user" },
    "30d"
  );
  if (!token) {
    throw new CustomError.CustomAPIError("Something went wrong");
  }

  res.status(200).json({
    success: true,
    profileImg: user.profileImg,
    userName: user.name,
    email: user.email,
    address: user.address,
    userId: user._id,
    token,
  });
};

const logout = async (req, res) => {
  const { userId } = req.cookies;
  const updateToken = await User.findByIdAndUpdate(userId, {
    accessToken: "",
  });
  // logoutClearCookie(res, "token");
  // logoutClearCookie(res, "userName");
  // logoutClearCookie(res, "userId");
  res.status(201).json({ msg: "user logged out!" });
};

const forgotPasswordStep1 = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please provide email and try again");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.BadRequestError(
      "No user found, Please check the email"
    );
  }
  const uuid1 = uuid.v1();
  const uuidLink = `https://parlour-frontend.vercel.app/newPassword/${uuid1}`;

  const sendMail = await sendMailJetEmail({
    reciverEmail: email,
    reciverName: user.name,
    emailPurpose: "resetPassword",
    uuidLink,
  });
  if (sendMail !== 200) {
    throw new CustomError.BadRequestError(
      "Something went wrong, Please try again email"
    );
  }
  const updateLinkDB = await User.findOneAndUpdate(
    { email },
    { forgotPassword: uuid1 }
  );
  if (!updateLinkDB) {
    throw new CustomError.BadRequestError(
      "Somthing went wrong, please try again"
    );
  }
  res.status(200).json({
    success: true,
    message: `Reset Link sent to the email ${email}`,
  });
};

const forgotPassStep2 = async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;
  console.log(id);
  const foundUserWithuuiId = await User.findOne({ forgotPassword: id });
  if (!foundUserWithuuiId) {
    throw new CustomError.BadRequestError("Link is not valid");
  }
  if (!password) {
    throw new CustomError.BadRequestError("Please provide a new password");
  }
  foundUserWithuuiId.password = password;
  foundUserWithuuiId.forgotPassword = "changed";
  await foundUserWithuuiId.save();
  res.status(200).json({ success: true });
};

module.exports = {
  register,
  login,
  logout,
  forgotPasswordStep1,
  forgotPassStep2,
  verifyEmailforRegistration,
};
