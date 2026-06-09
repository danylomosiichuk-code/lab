import { Request, Response, NextFunction } from "express";

export function demoAuth(req: any, res: any, next: NextFunction) {
    const userId = req.header("X-Demo-UserId");
    if (!userId) {
        // Вимога на "Добре": єдиний формат помилки { code, message }
        return res.status(401).json({ code: 401, message: "Unauthorized: Відсутній заголовок X-Demo-UserId" });
    }
    req.user = { id: Number(userId) };
    next();
}