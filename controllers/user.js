const User = require("../models/user");
const ErrorHandler = require("../utils/errorhandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
exports.registerUser = (req, res, next) => {
  const { name, email, password } = req.body;

  User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "sample",
      url: "profileUrl",
    },
  })
    .then((data) => {
      const token = data.getJWTToken();
      res
        .status(201)
        .cookie("token", token, {
          expires: new Date(
            Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 100
          ),
          httpOnly: true,
        })
        .json({ data, token, success: true });
    })
    .catch((err) => {
      next(new ErrorHandler(err, 500));
    });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("please enter email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("invalid email or password", 401));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("invalid email or password", 401));
  }
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE * 24 * 60 * 60 * 100),
    httpOnly: true,
  };
  const token = user.getJWTToken();
  res
    .status(200)
    .cookie("token", token, options)
    .json({ user, token, success: true });
};

exports.logout = (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "logout" });
};

exports.forgetPassword = async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not Exist", 404));
  }
  try {
    const resetToken = await user.getResetPassword();
    await user.save({ validateBeforeSave: false });
    const resetPasswordurl = `${req.protocol}://${req.get(
      "host"
    )}/api/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordurl}\n\n if you have not requited this email then please ignore it`;

    await sendEmail({
      email: user.email,
      subject: "E-Commerce password Reset",
      message: message,
    }).then((data) => {
      res.status(200).json({
        success: true,
        message: `Email send to ${user.email} successfully`,
      });
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error, 500));
  }
};

exports.reSetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    // resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("this is invalid token or token is expired", 404)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password Not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE * 24 * 60 * 60 * 100),
    httpOnly: true,
  };
  const token = user.getJWTToken();
  res
    .status(200)
    .cookie("token", token, options)
    .json({ user, token, success: true });
};

exports.getUserDetail = async (req, res, next) => {
  const user = await User.findById(req?.user?.id);
  if (!user) {
    return next(new ErrorHandler("reLogin", 404));
  }
  res.status(200).json({ user, success: true });
};

exports.updateUserPassword = async (req, res, next) => {
  const user = await User.findById(req?.user?.id).select("+password");
  try {
    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("invalid old password", 401));
    }

    if (
      req.body.password !== req.body.confirmPassword &&
      req.body.password !== "" &&
      req.body.confirmPassword !== ""
    ) {
      return next(new ErrorHandler("Password Not match", 400));
    }

    user.password = req.body.password;
    await user.save();
  } catch (e) {
    return next(new ErrorHandler("invalid new password", 400));
  }

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE * 24 * 60 * 60 * 100),
    httpOnly: true,
  };
  const token = user.getJWTToken();
  res
    .status(200)
    .cookie("token", token, options)
    .json({ user, token, success: true });
};

exports.updateUserDetail = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ user, success: true });
};

exports.getAllUsers = (req, res, next) => {
  User.find().then((data) => {
    if (!data) {
      return next(new ErrorHandler("user not found", 400));
    }
    res.status(200).json({ data, success: true });
  });
};

exports.getSingleUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return next(new ErrorHandler("user not found", 404));
      }
      res.status(200).json({ data, success: true });
    })
    .catch((err) => {
      return next(new ErrorHandler("user not found", 404));
    });
};

exports.updateUserRole = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ user, success: true });
};

exports.deleteUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return next(new ErrorHandler("user not found", 404));
      }
      data
        .remove()
        .then(() => res.status(200).json({ data, success: true }))
        .catch((err) => {
          return next(new ErrorHandler("user remove error", 404));
        });
    })
    .catch((err) => {
      return next(new ErrorHandler("user not found", 404));
    });
};
