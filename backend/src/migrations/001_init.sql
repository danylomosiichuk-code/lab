-- 1. Таблиця Користувачів
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
);

-- 2. Таблиця Заявок (з коментарем та статусом)
CREATE TABLE IF NOT EXISTS AccessRequests (
    id INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    accessType TEXT NOT NULL,
    comments TEXT, -- Текстове поле, може бути порожнім
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
);

-- 3. Таблиця Погоджень (хто погодив, яку заявку і який вердикт)
CREATE TABLE IF NOT EXISTS Approvals (
    id INTEGER PRIMARY KEY,
    requestId INTEGER NOT NULL UNIQUE, -- Одна заявка = одне фінальне рішення
    approverId INTEGER NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('Approved', 'Rejected')),
    reason TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (requestId) REFERENCES AccessRequests (id) ON DELETE CASCADE,
    FOREIGN KEY (approverId) REFERENCES Users (id) ON DELETE RESTRICT
);