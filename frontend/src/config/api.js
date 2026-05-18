const getApiUrl = () =>{
    return import.meta.env.VITE_API_URL;
};


export const API_URL = getApiUrl();