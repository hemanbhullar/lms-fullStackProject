import axios from "axios";

const BASE_URL = "http://localhost:5014/api/v1";

const axiosInstance = axios.create(); //created the axios instance

axiosInstance.defaults.baseURL = BASE_URL;
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;