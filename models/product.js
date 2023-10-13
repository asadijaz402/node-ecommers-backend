const mongoose = require("mongoose");

const productScheema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
  },
  decs: {
    type: String,
    required: [true, "Please enter product decs"],
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    maxLength: [8, "please can not exceed 8 characters"],
  },

  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        require: true,
      },
      url: {
        type: String,
        require: true,
      },
    },
  ],

  category: {
    type: String,
    required: [true, "please enter product category"],
  },

  stock: {
    type: Number,
    required: [true, "please enter total number of product"],
    maxLength: [4, "Stoct can not exceed 4 digit"],
    default: 1,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      name: {
        type: String,
        required: true,
      },

      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productScheema);
