import { API_BASE_URL } from "./config";
import type { ApiError, AccessRequest } from "./dtos";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    let response: Response;
    
    try {
        response = await fetch(url, options);
    } catch (e: any) {
        const err: ApiError = { status: 0, message: "Помилка мережі або CORS", details: e?.message };
        throw err;
    }

    if (response.status === 204) return null as unknown as T;

    const rawText = await response.text();
    if (response.ok) {
        if (!rawText) return null as unknown as T;
        try { return JSON.parse(rawText) as T; } catch { return rawText as unknown as T; }
    }

    let payload: any = null;
    try { payload = rawText ? JSON.parse(rawText) : null; } catch {}

    const err: ApiError = {
        status: response.status,
        message: payload?.message ?? payload?.error ?? "HTTP помилка",
        details: payload?.details ?? rawText
    };
    throw err;
}

export async function getList(): Promise<{ data: AccessRequest[] }> {
    return await request<{ data: AccessRequest[] }>("/requests");
}

export async function createItem(dto: Partial<AccessRequest>): Promise<{ data: AccessRequest }> {
    return await request<{ data: AccessRequest }>("/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });
}
export async function updateItem(id: number, dto: any): Promise<{ data: AccessRequest }> {
    return await request<{ data: AccessRequest }>(`/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });
}

export async function removeItem(id: number): Promise<void> {
    return await request<void>(`/requests/${id}`, { method: "DELETE" });
}
async function fetchApi(url: string, method = "GET", data?: any) {
    const response = await fetch(`http://localhost:3000${url}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-Demo-UserId": "1" // Обов'язковий заголовок для бекенду
        },
        body: data ? JSON.stringify(data) : undefined,
    });
    // ... обробка відповіді
}