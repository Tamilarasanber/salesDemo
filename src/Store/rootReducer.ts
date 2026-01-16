// Root reducer combining all slices
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import filterReducer from "./slices/filterSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  filter: filterReducer,
});

export default rootReducer;
