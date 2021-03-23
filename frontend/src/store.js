import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { productListReducer } from './reducers/productListReducer';

const reducer = combineReducers({
  productList: productListReducer,
});

const initialState = {}; //whatever we want loaded in when the application starts

const middleware = [thunk]; //to allows async and to use devtools

const store = createStore(
  reducer, //all reducers combined into one object
  initialState, //initial values for the state
  composeWithDevTools(applyMiddleware(...middleware))
); //finalize our global state.

export default store; //we use a provider to implement the state into the app
