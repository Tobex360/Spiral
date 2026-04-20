import axios from "axios";
import { API_URL } from "../config/api";


const registerUser = (data) =>{
    return axios.post(`${API_URL}/user/register`,data);
}

const loginUser = (data) =>{
    return axios.post(`${API_URL}/user/login`,data);
}

const AuthServices ={
    registerUser,
    loginUser
}

export default AuthServices;