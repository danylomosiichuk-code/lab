import type { ApiError } from "./dtos";

export function showNotice(text: string, isError: boolean = false): void {
    const el = document.getElementById("notice") as HTMLDivElement;
    if (!el) return; // Захист від null
    
    el.innerHTML = text;
    el.style.display = "block";
    el.style.backgroundColor = isError ? "#f8d7da" : "#d4edda";
    el.style.color = isError ? "#721c24" : "#155724";
    el.style.padding = "10px";
    el.style.marginBottom = "15px";
    el.style.borderRadius = "4px";
    el.style.border = `1px solid ${isError ? "#f5c6cb" : "#c3e6cb"}`;
    
    setTimeout(() => { el.style.display = "none"; }, 4000);
}

export function renderListStatus(status: "loading" | "empty" | "error" | "success", error: ApiError | null = null): void {
    const el = document.getElementById("listStatus") as HTMLDivElement;
    if (!el) return; // Захист від null
    
    if (status === "loading") el.innerHTML = "⏳ Завантаження даних з сервера...";
    else if (status === "empty") el.innerHTML = "📭 Поки що немає записів.";
    else if (status === "error") el.innerHTML = `<span style="color:red">❌ Помилка: ${error?.message || 'Невідома помилка'}</span>`;
    else el.innerHTML = "";
}

export function setFormEnabled(isEnabled: boolean): void {
    // Шукаємо кнопку відправки всередині форми
    const submitBtn = document.querySelector('#createForm button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
        submitBtn.disabled = !isEnabled;
        submitBtn.innerHTML = isEnabled ? "Додати заявку" : "Відправка...";
    }
}