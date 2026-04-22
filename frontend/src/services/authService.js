import api from "./api";

export async function loginUser(email, password) {
	const response = await api.post("/auth/login", { email, password });
	return response.data.data;
}

export async function getCurrentUser() {
	const response = await api.get("/auth/me");
	return response.data.data;
}

export async function updateProfile({ name, email, currentPassword, newPassword }) {
	const response = await api.put("/auth/profile", {
		name,
		email,
		currentPassword,
		newPassword,
	});
	return response.data.data;
}

export async function logoutUser() {
	await api.post("/auth/logout");
}
