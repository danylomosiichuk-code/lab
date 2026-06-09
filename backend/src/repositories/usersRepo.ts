import { all, run } from "../db/dbClient";

// Отримати всіх користувачів (Асинхронно)
export const getAllUsers = async () => {
    return await all("SELECT * FROM Users");
};

// Створити нового користувача (Асинхронно)
export const createUser = async (email: string, name: string) => {
    const createdAt = new Date().toISOString();
    
    // Формуємо SQL запит. Оскільки твоя функція run() приймає лише рядок, 
    // ми підставляємо змінні прямо в текст (як у твоїх інших репозиторіях)
    const sql = `INSERT INTO Users (email, name, createdAt) VALUES ('${email}', '${name}', '${createdAt}')`;
    
    const info = await run(sql);
    return { id: info.lastID, email, name };
};