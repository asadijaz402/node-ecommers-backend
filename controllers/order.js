const Order = require("../models/order");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorhandler");

exports.newOrder = async (req, res, next) => {
    const {
    shippingInfo,
    orderId,
    paymentInfo,
    itemPrice,
    textPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderId,
    paymentInfo,
    itemPrice,
    textPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  if (order) {
    res.status(201).json({
      success: true,
      order,
    });
  } else {
    res.status(400).json({
      success: false,
      order,
    });
  }
};
