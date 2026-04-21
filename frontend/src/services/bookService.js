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

export async function getBooks(params = {}) {
	const response = await api.get("/books", { params });
	return normalizeCollectionResponse(response.data);
}

export async function searchBooks(query, params = {}) {
	const response = await api.get("/books/search", {
		params: {
			query,
			...params,
		},
	});

	return normalizeCollectionResponse(response.data);
}

export async function createBook(data) {
	const response = await api.post("/books", data);
	return response.data?.data;
}

export async function deleteBook(id) {
	const response = await api.delete(`/books/${id}`);
	return response.data?.data;
}
