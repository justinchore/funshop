import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  productListReducer,
  productDetailsReducer,
} from './reducers/productReducer';
import { cartReducer } from './reducers/cartReducer';

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  cart: cartReducer,
});

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const initialState = {
  cart: { cartItems: cartItemsFromStorage },
}; //whatever we want loaded in when the application starts

const middleware = [thunk]; //to allows async and to use devtools

const store = createStore(
  reducer, //all reducers combined into one object
  initialState, //initial values for the state
  composeWithDevTools(applyMiddleware(...middleware))
); //finalize our global state.

export default store; //we use a provider to implement the state into the app
