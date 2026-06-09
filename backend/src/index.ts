
import usersRouter from "./routes/users.routes";
import express from 'express';
import cors from 'cors';
import requestsRouter from "./routes/requests.routes";
import approvalsRouter from "./routes/approvals.routes";
import { loggerMiddleware } from './middlewares';
import { migrate } from "./db/migrate";

const app = express();

// 1. Формат JSON та логування запитів
app.use(express.json()); 
app.use(loggerMiddleware);

// 2. ПІДКЛЮЧАЄМО НОВІ МАРШРУТИ ДЛЯ БАЗИ ДАНИХ

// Налаштування CORS
const allowedOrigins = [
    "http://127.0.0.1:5173", 
    "http://localhost:5173"
];



// Вимога на "Добре": обмежений CORS
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Demo-UserId"] 
}));

app.options(/.*/, cors());// Обробка preflight запитів
app.use('/api/requests', requestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/approvals', approvalsRouter);

// Вимога на "Добре": єдиний формат помилок (code/message)
app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        code: statusCode,
        message: err.message || "Internal Server Error"
    });
});

// 4. Ініціалізація та запуск сервера
async function bootstrap() {
    try {
        await migrate(); // Створюємо таблиці перед запуском сервера
        
        app.listen(3000, () => {
            console.log("API запущено на http://localhost:3000");
        });
    } catch (err) {
        console.error("Fatal startup error:", err);
        process.exit(1);
    }
}

bootstrap();