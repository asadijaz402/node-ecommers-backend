const Product = require("../models/product");
const ErrorHandler = require("../utils/errorhandler");

exports.createProduct = (req, res, next) => {
  req.body.user = req.user.id;
  const bodyData = req.body;

  Product.create(bodyData)
    .then((data) => {
      res.status(201).json({ data, success: true });
    })
    .catch((err) => {
      next(new ErrorHandler(err, 500));
    });
};

exports.getAllProduct = async (req, res, next) => {
  const search = req?.query?.search || "";
  const productCount = await Product.countDocuments();
  const category = req?.query?.category || "";
  const page = Number(req?.query?.page) || 1;
  let price = req?.query?.price || {};
  // price = JSON.stringify(price);
  // price = price.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
  // console.log(price);
  Product.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
    category: { $regex: category, $options: "i" },
    //  price: { $gte: Number(price.gt), $lte: Number(price.lt) },
  })
    .limit(5)
    .skip((page - 1) * 5)
    .then((data) => {
      res.status(200).json({ success: true, data, count: productCount });
    })
    .catch((err) => {
      next(new ErrorHandler(err, 500));
    });
};

exports.updateProduct = (req, res, next) => {
  const id = req.params.id;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        return next(new ErrorHandler("product not found", 404));
      }

      Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      })
        .then((data) => {
          res.status(200).json({ data, success: true });
        })
        .catch((err) => {
          next(new ErrorHandler(err, 500));
        });
    })
    .catch((err) => {
      return next(new ErrorHandler("product not found", 404));
    });
};

exports.deleteProduct = (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return next(new ErrorHandler("product not found", 404));
      }
      product.remove().then(() => {
        res.status(200).json({ product, success: true });
      });
    })
    .catch((err) => {
      return next(new ErrorHandler("product not found", 404));
    });
};

exports.getSingleProduct = (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return next(new ErrorHandler("product not found", 404));
      }
      res.status(200).json({ product });
    })
    .catch((err) => {
      return next(new ErrorHandler("product not found", 404));
    });
};

exports.createProductReview = async (req, res, next) => {
  console.log("a");
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  const isReviewed = product.reviews.find(
    (rev) => rev?.user?.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev?.user?.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;
  product
    .save({ validateBeforeSave: false })
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      return next(new ErrorHandler("product save error", 404));
    });
};

exports.getProductReviews = async (req, res, next) => {
  const id = req.query.productId;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  res.status(200).json({ reviews: product.reviews, success: true });
};

exports.deleteReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg = +rev.rating;
  });
  console.log(avg);
  let ratings = 0;
  if (avg > 0) {
    ratings = avg / reviews.length;
  }

  const numberOfReviews = reviews.length;
  console.log(ratings);
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      ratings,
      numberOfReviews,
      reviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  console.log("1");
  res.status(200).json({ reviews: reviews, success: true });
};
