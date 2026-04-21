import api from "./api";

function normalizeCollectionResponse(payload) {
	const data = payload?.data;

	if (Array.isArray(data)) {
		return {
			items: data,
			pagination: null,
		};
	}

	if (data && Array.isArray(data.items)) {
		return {
			items: data.items,
			pagination: data.pagination || null,
		};
	}

	return {
		items: [],
		pagination: null,
	};
}

export async function getMembers(params = {}) {
	const response = await api.get("/members", { params });
	return normalizeCollectionResponse(response.data);
}

export async function createMember(data) {
	const response = await api.post("/members", data);
	return response.data?.data;
}

export async function updateMember(id, data) {
	const response = await api.put(`/members/${id}`, data);
	return response.data?.data;
}

export async function deleteMember(id) {
	const response = await api.delete(`/members/${id}`);
	return response.data?.data;
}
