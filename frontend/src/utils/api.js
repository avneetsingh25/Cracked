async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const requestOptions = {
        ...options,
        headers,
        credentials: "include"
    };

    let response = await fetch(url, requestOptions);
    if (response.status !== 401) {
        return response;
    }
    const refreshResponse = await fetch(
        "http://localhost:3000/api/auth/refresh-token",
        {
            method: "POST",
            credentials: "include"
        }
    );
    if (!refreshResponse.ok) {
        localStorage.removeItem("accessToken");
        return response;
    }

    const refreshData = await refreshResponse.json();

    if (!refreshData.accessToken) {
        return response;
    }

    localStorage.setItem("accessToken", refreshData.accessToken);
    headers.set("Authorization", `Bearer ${refreshData.accessToken}`);
    return fetch(url, requestOptions);
}

export default apiFetch;
