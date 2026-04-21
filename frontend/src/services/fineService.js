import api from "./api";

export async function getFines() {
	const response = await api.get("/fines");
	return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getUnpaidFines() {
	const response = await api.get("/fines/unpaid");
	return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function payFine(id) {
	const response = await api.put(`/fines/${id}/pay`);
	return response.data?.data;
}
