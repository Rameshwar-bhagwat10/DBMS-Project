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

export async function issueBook(data) {
	const response = await api.post("/issues", data);
	return response.data?.data;
}

export async function returnBook(id) {
	const response = await api.put(`/issues/${id}/return`);
	return response.data?.data;
}

export async function getIssues(params = {}) {
	const response = await api.get("/issues", { params });
	return normalizeCollectionResponse(response.data);
}

export async function getActiveIssues(params = {}) {
	const response = await api.get("/issues/active", { params });
	return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getMostIssuedBooksReport(params = {}) {
	const response = await api.get("/issues/reports/most-issued-books", { params });
	return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getTopBorrowingMembersReport(params = {}) {
	const response = await api.get("/issues/reports/top-borrowing-members", { params });
	return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getTotalFinesCollectedReport() {
	const response = await api.get("/issues/reports/total-fines-collected");
	return response.data?.data || { total_fines_collected: 0 };
}
