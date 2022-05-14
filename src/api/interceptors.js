import { get } from "lodash-es";
//import axios from 'axios';
import errorObject from "./errorObject";

// const refreshAccessToken = async () => {
//   const token = sessionStorageService.getItem(SessionStorage.RefreshToken);
//   // eslint-disable-next-line
//   return await axios
//     .get(`${SERVICE_URLS.ADMIN_AUTH}auth/refresh-token`, {
//       headers: {
//         Authorization: token ? `Bearer ${token}` : null,
//       },
//     })
//     .then(response => {
//       if (response.data && response.data.data) {
//         const refreshedToken = response.data.data;
//         sessionStorageService.setItem(SessionStorage.Token, refreshedToken.access_token);
//         sessionStorageService.setItem(SessionStorage.RefreshToken, refreshedToken.refresh_token);
//       }
//     })
//     .catch(error => {
//       if (
//         error &&
//         error.response &&
//         (get(error.response, 'status') === 400 ||
//           get(error.response, 'status') === 401 ||
//           get(error.response, 'status') === 500)
//       ) {
//         sessionStorageService.removeAll();
//         window.location.reload(true);
//       }
//       throw errorObject(error);
//     });
// };

export const successRequestHandler = async (config) => {
  config.headers = {
    ...config.headers,
    //Authorization: `Bearer ${sessionStorageService.getItem(SessionStorage.Token)}`,
  };
  console.log("start");
  //document.body.classList.add('request-overlay');
  const child = document.createElement("div");
  child.id = "requestOverlay";
  child.className = "request-overlay";
  document.body.appendChild(child);
  //document.body.append('<div id="requestOverlay" class="request-overlay"></div>');
  return config;
};
/* eslint-disable */
export const errorResponseHandler = async (error, http) => {
  debugger;
  let { message } = error;
  console.log("Error");
  console.log(error);
  const originalRequest = error.config;
  if (
    error &&
    get(error.response, "status") === 401 &&
    !originalRequest._retry
  ) {
    originalRequest._retry = true;
    //await refreshAccessToken();
    return http.instance(originalRequest);
  }
  if (
    error &&
    (get(error, "status") === 403 || get(error, "response.status") === 403)
  ) {
    message = "You're UnAuthorized, check login or user privileges";
  }

  if (
    error &&
    (get(error, "status") === 404 || get(error, "response.status") === 404)
  ) {
    message = "Not Found";
  }

  if (
    error &&
    (get(error, "status") === 503 || get(error, "response.status")) === 503
  ) {
    message = "Internal Server Error";
  }
  var element = document.getElementById("requestOverlay");
  element.parentNode.removeChild(element);
  if (error) {
    error.message = message;
    throw errorObject(error);
  }
};

export function successResponseHandler(response) {
  const { data } = response;
  const res = data;
  console.log("end");
  //document.body.classList.remove('request-overlay');
  var element = document.getElementById("requestOverlay");
  element.parentNode.removeChild(element);
  if (data.pageNumber !== undefined) {
    res.pageDetails = {
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      length: data.length,
    };
  }

  return res;
}
