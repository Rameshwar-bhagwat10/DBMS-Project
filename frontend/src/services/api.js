import axios from "axios";

const TOKEN_KEY = "lib_auth_token";

const api = axios.create({
	baseURL: "http://localhost:5000/api",
	withCredentials: true,
});

// Attach JWT token to every request.
api.interceptors.request.use((config) => {
	const token = localStorage.getItem(TOKEN_KEY);

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

// On 401 response, clear token and redirect to login.
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			// Don't redirect if the request was to the login endpoint itself.
			const isLoginRequest = error.config.url && error.config.url.includes("/auth/login");

			if (!isLoginRequest) {
				localStorage.removeItem(TOKEN_KEY);
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

export default api;
