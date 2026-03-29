import axios from 'axios';

// URL base del API de Farmacia
const API_FARMACIA_URL = 'https://api-farmacia.farmadinamica.com.bo/api/farmalink-farmacia';

// Crear instancia de Axios para Farmacia
const pharmacyApiClient = axios.create({
    baseURL: API_FARMACIA_URL,
    timeout: 45000,
    // Asumimos que comparte cookies de sesión o auth
    withCredentials: true,
});

// Interceptor de REQUEST
pharmacyApiClient.interceptors.request.use(
    (config) => {
        // console.log('💊 PHARMACY REQUEST:', {
        //   method: config.method?.toUpperCase(),
        //   url: config.url,
        // });
        return config;
    },
    (error) => {
        console.error('❌ PHARMACY REQUEST ERROR:', error);
        return Promise.reject(error);
    }
);

// Interceptor de RESPONSE
pharmacyApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('❌ PHARMACY RESPONSE ERROR:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default pharmacyApiClient;
