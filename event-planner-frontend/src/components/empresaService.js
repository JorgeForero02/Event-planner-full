const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';


const getAuthToken = () => {
    try {
        const accessToken = localStorage.getItem('access_token');

        const user = localStorage.getItem('user');
        const parsedUser = user ? JSON.parse(user) : null;

        const token = accessToken || parsedUser?.token || parsedUser?.access_token;

        if (!token) {
            return null;
        }
        return token;
    } catch (error) {
        return null;
    }
};


const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};


const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message ||
            errorData.error ||
            `Error ${response.status}: ${response.statusText}`
        );
    }
    return response.json();
};

const empresaService = {
    obtenerEmpresaGerente: async () => {
        try {
            const response = await fetch(`${API_URL}/empresas`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    obtenerTodasCiudades: async () => {
        try {
            const response = await fetch(`${API_URL}/ciudades`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    obtenerEmpresaPorId: async (id) => {
        try {
            const response = await fetch(`${API_URL}/empresas/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    actualizarEmpresa: async (id, datos) => {
        try {
            const response = await fetch(`${API_URL}/empresas/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(datos)
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    obtenerCiudadPorId: async (idCiudad) => {
        try {
            const response = await fetch(`${API_URL}/ciudades/${idCiudad}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    obtenerPaisPorId: async (idPais) => {
        try {
            const response = await fetch(`${API_URL}/paises/${idPais}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    }

};

export default empresaService;
