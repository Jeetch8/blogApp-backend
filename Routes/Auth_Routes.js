const {
  logout,
  register,
  login,
  forgotPassStep2,
  forgotPasswordStep1,
} = require("../Controllers/Auth_Controllers");
const router = require("./Blog_Routes");

router.get("/logout", logout);
router.post("/register", register);
router.post("/login", login);
router.post("/forgotPassword", forgotPasswordStep1);
router.post("/forgotPassword2/:id", forgotPassStep2);

module.exports = router;
