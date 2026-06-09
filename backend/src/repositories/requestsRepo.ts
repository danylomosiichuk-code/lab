import { all, get, run } from "../db/dbClient";

// БЕЗПЕЧНЕ СТВОРЕННЯ (Виправлено SQLi + IDOR: беремо userId з токена)
export async function createRequest(userId: number, date: string, accessType: string, comments: string = "", status: string = "Pending") {
    const now = new Date().toISOString();
    // Використовуємо плейсхолдери (?) замість конкатенації
    const result = await run(`
        INSERT INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?);
    `, [userId, date, accessType, comments, status, now]);
    
    return await get(`SELECT * FROM AccessRequests WHERE id = ?`, [result.lastID]);
}

// БЕЗПЕЧНИЙ ПОШУК (Виправлено SQLi: використовуємо параметри)
export async function searchRequestsSafe(searchTerm: string) {
    const sql = `SELECT * FROM AccessRequests WHERE comments LIKE '%' || ? || '%'`;
    return await all(sql, [searchTerm]); 
}

// IDOR FIX: ОТРИМАННЯ ТІЛЬКИ СВОЄЇ ЗАЯВКИ
export async function getRequestByIdAndOwner(id: number, ownerId: number) {
    return await get(`SELECT * FROM AccessRequests WHERE id = ? AND userId = ?`, [id, ownerId]);
}

// IDOR FIX: ВИДАЛЕННЯ ТІЛЬКИ СВОЄЇ ЗАЯВКИ
export async function deleteRequestSafe(id: number, ownerId: number) {
    const result = await run(`DELETE FROM AccessRequests WHERE id = ? AND userId = ?`, [id, ownerId]);
    return result.changes > 0;
}

// IDOR FIX: ПОВНЕ ОНОВЛЕННЯ ТІЛЬКИ СВОЄЇ ЗАЯВКИ
export async function updateRequestFullSafe(id: number, ownerId: number, date: string, accessType: string, status: string, comments: string) {
    const result = await run(`
        UPDATE AccessRequests 
        SET date = ?, accessType = ?, status = ?, comments = ?
        WHERE id = ? AND userId = ?
    `, [date, accessType, status, comments, id, ownerId]);
    
    if (result.changes === 0) return null;
    return await getRequestByIdAndOwner(id, ownerId);
}

// БЕЗПЕЧНА ФІЛЬТРАЦІЯ
export const getRequestsFiltered = async (status?: string, sortBy: string = 'id', order: string = 'DESC', limit: number = 10) => {
    let sql = `SELECT r.*, u.name as userName FROM AccessRequests r LEFT JOIN Users u ON u.id = r.userId WHERE 1=1`;
    const params: any[] = [];
    if (status) {
        sql += ` AND r.status = ?`;
        params.push(status);
    }
    sql += ` ORDER BY r.id DESC LIMIT ?`;
    params.push(limit);
    return await all(sql, params);
};