import axios from "axios";

import {
  successResponseHandler,
  errorResponseHandler,
  successRequestHandler,
} from "./interceptors";
import { BASE_URL } from "./constants";
export const contentType = {
  json: "application/json",
  multipart: "multipart/form-data",
};

export default class API {
  constructor(
    config = {
      headers: { contentType: contentType.json },
      baseURL: BASE_URL,
    }
  ) {
    this.config = {};
    this.instance = null;

    const token = null; // sessionStorageService.getItem(SessionStorage.Token);
    this.config = {
      baseURL: BASE_URL,
      headers: {
        //Authorization: token ? `Bearer ${token}` : null,
        "Content-Type":
          config.headers && config.headers.contentType
            ? config.headers.contentType
            : contentType.json,
      },
      withCredentials: true,
      timeout: 600000,
    };

    this.instance = axios.create(this.config);
    this.instance.interceptors.request.use(successRequestHandler, (error) =>
      Promise.reject(error)
    );
    this.instance.interceptors.response.use(successResponseHandler, (error) =>
      errorResponseHandler(error, this)
    );
  }

  get(url, id, params) {
    let endpoint = url;
    if (id) {
      endpoint += `/${id}`;
    }
    return this.instance.get(endpoint, { params });
  }

  post(url, body) {
    return this.instance.post(url, body);
  }

  delete(url, id) {
    return this.instance.delete(`${url}/${id}`);
  }

  put(url, body, id) {
    let endpoint = url;
    if (id) {
      endpoint += `/${id}`;
    }
    return this.instance.put(endpoint, body);
  }

  patch(url, body) {
    return this.instance.patch(url, body);
  }
}
