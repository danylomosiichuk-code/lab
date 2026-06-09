import { run } from "./dbClient";
import { migrate } from "./migrate";

async function seed() {
    await migrate(); // Спочатку створюємо таблиці
    const now = new Date().toISOString();

    console.log("Seeding database...");

    // Створюємо двох користувачів
    await run(`INSERT OR IGNORE INTO Users (id, email, name, createdAt) VALUES (1, 'student@knu.ua', 'Danylo', '${now}');`);
    await run(`INSERT OR IGNORE INTO Users (id, email, name, createdAt) VALUES (2, 'admin@knu.ua', 'Admin', '${now}');`);

    // Створюємо дві заявки
    await run(`INSERT OR IGNORE INTO AccessRequests (id, userId, date, accessType, comments, status, createdAt) 
               VALUES (1, 1, '2026-06-10', 'Student', 'Need access for Lab 3', 'Approved', '${now}');`);
    await run(`INSERT OR IGNORE INTO AccessRequests (id, userId, date, accessType, comments, status, createdAt) 
               VALUES (2, 1, '2026-06-12', 'Student', 'Extra practice', 'Pending', '${now}');`);

    // Створюємо одне погодження для першої заявки
    await run(`INSERT OR IGNORE INTO Approvals (id, requestId, approverId, decision, reason, createdAt) 
               VALUES (1, 1, 2, 'Approved', 'Looks good', '${now}');`);

    console.log("Seed completed!");
}

seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});