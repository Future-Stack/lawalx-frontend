/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore, Middleware } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import authReducer from "../features/auth/authSlice";
import settingsReducer from "../features/settings/settingsSlice";

// Custom middleware to reset the RTK Query API state/cache when logging out
const rtkQueryResetMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  if (action && action.type === "auth/logout") {
    storeApi.dispatch(baseApi.util.resetApiState());
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "baseApi/executeQuery/pending",
          "baseApi/executeMutation/pending",
          "baseApi/executeMutation/fulfilled",
          "baseApi/executeMutation/rejected",
        ],
        ignoredPaths: ["baseApi"],
      },
      immutableCheck: {
        ignoredPaths: ["baseApi"],
      },
    }).concat(baseApi.middleware, rtkQueryResetMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { configureStore, Middleware } from "@reduxjs/toolkit";
// import { baseApi } from "../api/baseApi";
// import authReducer from "../features/auth/authSlice";
// import settingsReducer from "../features/settings/settingsSlice";

// // Custom middleware to reset the RTK Query API state/cache when logging out
// const rtkQueryResetMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
//   if (action && action.type === "auth/logout") {
//     storeApi.dispatch(baseApi.util.resetApiState());
//   }
//   return next(action);
// };

// export const store = configureStore({
//   reducer: {
//     [baseApi.reducerPath]: baseApi.reducer,
//     auth: authReducer,
//     settings: settingsReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(baseApi.middleware, rtkQueryResetMiddleware),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;