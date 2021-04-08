# FunShop

Funshop is an e-commerce site utilizing all the basics of cart-handling, user login/registration, admin functionality, and payment/checkout. This website was created following Brad Traversy's course on Node.js, MongoDB, React and Redux.

## Technologies Used

- MongoDB - Storing profiles, login information, posts, and comments
- Node.js, Express
- Mongoose - For data managing, schema validation, and connection between MongoDB and Node.js
- Bcrypt - Hashing user passwords
- jsonwebtokrn - For session authentication
- React Bootstrap for UI
- Paypal API for payments
- React, Redux, HTML, CSS

## Knowledge Acquired

Below is a list of some useful tricks/processes I picked up during the website's creation.

### Backend: Custom Error Middleware

Implementing a custom error middleware to be run in tandem with async try/catch blocks took the complications out of error handling.

The first middleware function handles any requests with an unrecognized url.

```javascript
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
```

The second middleware function handles specific errors. Messages are specified in the "catch" portion of the try/catch block. There are times when the status code might be 200 but an error still exists. In that case the status code is changed to 500 and returns the message specified in the controller. If the site is in production mode, we leave out the stack trace.

```javascript
const errorHandler = (err, req, res, next) => {
  //pass in error first in error middleware
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; //Changing 200 into 500
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
```

In the server file, the placement of these middleware function calls is important. They must be under the route references.

### Frontend: Error Handling

Because of the uniformity in our errors made possible by the error middleware implementaion above, setting errors to our action payloads are made simpler.

```javascript
} catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message //specific
          ? error.response.data.message
          : error.message, //generic
    });
  }
```

### Backend: Using Controllers for Router Functions

Before this project, my process was to write all REST functionality directly into the routes folder. Implementing controllers allowed for a much more readable routes folder while adding modularity to the backend.

```javascript
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);
```

### Backend: Implementation of two Schemas in one Model

Instead of creating a whole new model for reviews, simply adding the model schema to the product model allows for a more streamlined approach. This process drove home the benefits of using a no-SQL database.

```javascript
const reviewSchema = mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema((reviews: [reviewSchema]));
```

Creating Reviews:

Checks to see if product is already reviewed by the logged in user -> creates review object -> add review into the products.reviews array -> calculates the average of ratings -> save the product

```javascript
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review Added' });
  } else {
    res.status(404);
  }
});
```

### Backend: Pagination

Pagination allows for limiting the size of the data that is retrieved from each GET request. If there were a million products, making a GET request each time there was a change to a product would be taxing and inefficent.

To implement pagination in a GET request, 3 pieces of information are needed:

1. pageSize = How many (products) documents per request (which is how many products will show on the screen)
2. page = The requested page number (default will be 1 if not provided)
3. count = The total number of documents in a data set (Model)

pageSize will be used for the .limit() function to limit the query. But with limit() alone, every page will have the same products. Taking the current page (page - 1) and multiplying that by the pageSize will provide the number of documents to skip.

```javascript
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 4;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};
  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});
```

### Frontend: Pagination

The response from the GET request contains the following which will be in the productList global state:

- products (an array of products)
- page (the page number)
- pages (how many pages there are total according to the number of products)

The frontend home page will check for any query strings attached. If the url is ".../2", the 2 is used to make the backend call and will be used as the "page" variable.

As for the the page navigation on the bottom of the screen, a paginate component was created. It takes in pages, page, keyword(search string) as props.

```javascript
    pages > 1 && (
      <Pagination className='mt-4'>
        {[...Array(pages).keys()].map(x => (
          <LinkContainer
            key={x + 1}
            to={
              !isAdmin
                ? keyword
                  ? `/search/${keyword}/page/${x + 1}`
                  : `/page/${x + 1}`
                : `/admin/productlist/${x + 1}`
            }
          >
            <Pagination.Item active={x + 1 === page}>{x + 1}</Pagination.Item>
          </LinkContainer>
        ))}
      </Pagination>
```

### Backend/Frontend: Paypal API

Functionality for allowing users to use paypal to pay for their order.

In the frontend, the paypal pay script is created then added dynamically depending on the field "isPaid" in the orderDetails state.
This is combined with a boolean local state that changes upon the completion of the script construction:

```javascript
seEffect(() => {
  const addPayPalScript = async () => {
    const { data: clientId } = await axios.get('/api/config/paypal');
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
    };
    document.body.appendChild(script);
  };

  if (!userInfo) {
    history.push('/login');
  }

  if (!order || successPay || order._id !== orderId) {
    dispatch({
      type: ORDER_PAY_RESET,
    });
    dispatch(getOrderDetails(orderId));
  } else if (!order.isPaid) {
    if (!window.paypal) {
      addPayPalScript();
    } else {
      setSdkReady(true);
    }
  }
}, [dispatch, order, orderId, successPay, userInfo, history]);
```

Upon successful payment, the payOrder action is fired off. "paymentResult" is provided by the Paypal API when the user pays. While the "orderId" is from the global orderDetails state.

```javascript
<PayPalButton amount={order.totalPrice} onSuccess={successPaymentHandler} />;

const successPaymentHandler = paymentResult => {
  dispatch(payOrder(orderId, paymentResult));
};
```

Then the order document is updated in the database, now isPaid=true, which fires off the useEffect due to the dependency "successPay" coming from the payOrder action. The useEffect will see that successPay is now true, firing off the order pay reset and skipping the addition of the paypal script to the page.
