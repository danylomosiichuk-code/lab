import { getList, createItem, removeItem, updateItem } from "./apiClient";
import { showNotice, renderListStatus, setFormEnabled } from "./ui";
import type { AccessRequest, ApiError } from "./dtos";

const tbody = document.getElementById("itemsTableBody") as HTMLTableSectionElement;
const createForm = document.getElementById("createForm") as HTMLFormElement;
const sortByDateBtn = document.getElementById("sortByDateBtn");
const submitBtn = document.querySelector("#createForm button[type='submit']") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
// Додаємо змінну для поля пошуку
const searchInput = document.getElementById("searchInput") as HTMLInputElement;

// Глобальні змінні
let itemsData: AccessRequest[] = [];
let currentSortOrder: "desc" | "asc" = "desc";
let editingId: number | null = null;
let searchQuery = ""; // Зберігає поточний текст пошуку

// ОБРОБНИК ПОШУКУ
searchInput?.addEventListener("input", (e) => {
    searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
    renderItems(); // Миттєво перемальовуємо список
});

// СОРТУВАННЯ
sortByDateBtn?.addEventListener("click", () => {
    currentSortOrder = currentSortOrder === "desc" ? "asc" : "desc";
    sortByDateBtn.innerHTML = currentSortOrder === "desc" ? "Дата і час ↓" : "Дата і час ↑";
    renderItems();
});

async function loadList() {
    renderListStatus("loading");
    if (tbody) tbody.innerHTML = "";
    
    try {
        const response = await getList();
        itemsData = (response as any).data || response;

        if (!itemsData || itemsData.length === 0) {
            renderListStatus("empty");
            return;
        }
        
        renderListStatus("success");
        renderItems();
    } catch (e) {
        renderListStatus("error", e as ApiError);
    }
}

function renderItems() {
    if (!tbody) return;
    
    // 1. ФІЛЬТРАЦІЯ (Пошук)
    const filteredItems = itemsData.filter(item => {
        const name = (item.userName || "Гість").toLowerCase();
        return name.includes(searchQuery);
    });

    // 2. СОРТУВАННЯ
    const sortedItems = [...filteredItems].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return currentSortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // 3. РЕНДЕРИНГ
    const rowsHtml = sortedItems.map((item: any) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.userName || "Гість"}</td>
          <td>${item.date ? item.date.replace('T', ' ') : '-'}</td>
          <td>${item.accessType || '-'}</td>
          <td>${item.status || 'Pending'}</td>
          <td>${item.comments || '-'}</td>
          <td>
            <button type="button" class="edit-btn" data-id="${item.id}" style="background:#ffc107; color:#000; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px; font-weight:bold;" title="Редагувати заявку">✎</button>
            <button type="button" class="delete-btn" data-id="${item.id}" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;" title="Видалити">✕</button>
          </td>
        </tr>
    `).join("");
    
    tbody.innerHTML = rowsHtml;
}

// ДЕЛЕГУВАННЯ ПОДІЙ ДЛЯ ТАБЛИЦІ (один слухач для всього списку)
tbody?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // Якщо клікнули по кнопці Редагувати
    if (target.classList.contains("edit-btn")) {
        const id = Number(target.getAttribute("data-id"));
        const item = itemsData.find(i => i.id === id);
        if (!item) return;

        editingId = id;
        submitBtn.textContent = "Зберегти зміни";
        
        (document.getElementById("userNameInput") as HTMLInputElement).value = item.userName || "";
        (document.getElementById("dateInput") as HTMLInputElement).value = item.date;
        (document.getElementById("accessTypeSelect") as HTMLSelectElement).value = item.accessType;
        (document.getElementById("statusSelect") as HTMLSelectElement).value = item.status || "Pending";
        (document.getElementById("commentsInput") as HTMLTextAreaElement).value = item.comments || "";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Якщо клікнули по кнопці Видалити
    if (target.classList.contains("delete-btn")) {
        const id = Number(target.getAttribute("data-id"));
        if (confirm("Точно видалити цю заявку?")) {
            (target as HTMLButtonElement).disabled = true;
            try {
                await removeItem(id);
                showNotice("Заявку видалено!");
                await loadList();
            } catch (err) {
                showNotice(`Помилка: ${(err as ApiError).message}`, true);
                (target as HTMLButtonElement).disabled = false;
            }
        }
    }
});

// КНОПКА ОЧИСТИТИ (Також скидає режим редагування)
resetBtn?.addEventListener("click", () => {
    editingId = null;
    submitBtn.textContent = "Додати заявку";
    createForm.reset();
});

// ВІДПРАВКА ФОРМИ (Створення або Оновлення)
createForm?.addEventListener("submit", async (e: Event) => {
    e.preventDefault();
    
    const userName = (document.getElementById("userNameInput") as HTMLInputElement)?.value.trim();
    const date = (document.getElementById("dateInput") as HTMLInputElement)?.value;
    const accessType = (document.getElementById("accessTypeSelect") as HTMLSelectElement)?.value;
    const status = (document.getElementById("statusSelect") as HTMLSelectElement)?.value;
    const comments = (document.getElementById("commentsInput") as HTMLTextAreaElement)?.value.trim();
    
    if (!userName || !date || !accessType) {
        showNotice("Заповніть обов'язкові поля!", true);
        return;
    }

    setFormEnabled(false);
    
    try {
        const dto = { userName, date, accessType, status, comments };

        if (editingId) {
            // Режим редагування
            await updateItem(editingId, dto);
            showNotice("Заявку успішно оновлено!");
            editingId = null;
            submitBtn.textContent = "Додати заявку";
        } else {
            // Режим створення
            await createItem(dto as any);
            showNotice("Успішно створено!");
        }
        
        createForm.reset();
        await loadList();
    } catch (e) {
        const err = e as ApiError;
        showNotice(`Помилка: ${err.message}`, true);
    } finally {
        setFormEnabled(true);
    }
});

loadList();