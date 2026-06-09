import express from "express";
import * as repo from "../repositories/requestsRepo";
import { demoAuth } from "../middlewares/demoAuth";

const router = express.Router();

// Усі роути вимагають заголовок X-Demo-UserId
router.use(demoAuth);

// POST - Створення
router.post("/", async (req: any, res, next) => {
    try {
        const { date, accessType, comments, status } = req.body;
        if (!date || !accessType) throw { status: 400, message: "date та accessType є обов'язковими" };
        
        // Використовуємо req.user.id замість userName (Захист IDOR)
        const created = await repo.createRequest(req.user.id, date, accessType, comments, status);
        res.status(201).json({ data: created });
    } catch (err) { next(err); }
});

// GET - Список
router.get("/", async (req: any, res, next) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const requests = await repo.getRequestsFiltered(req.query.status as string, undefined, undefined, limit);
        res.json({ data: requests });
    } catch (err) { next(err); }
});

// GET - Безпечний пошук (Захист SQLi)
router.get("/search", async (req: any, res, next) => {
    try {
        const q = (req.query.q as string) || "";
        const results = await repo.searchRequestsSafe(q);
        res.json({ data: results });
    } catch (err) { next(err); }
});

// GET by ID - Тільки свої (Захист IDOR)
router.get("/:id", async (req: any, res, next) => {
    try {
        const request = await repo.getRequestByIdAndOwner(Number(req.params.id), req.user.id);
        // Якщо чужа або не існує - повертаємо 403
        if (!request) throw { status: 403, message: "Доступ заборонено або заявку не знайдено" };
        res.json({ data: request });
    } catch (err) { next(err); }
});

// PUT - Тільки свої (Захист IDOR)
router.put("/:id", async (req: any, res, next) => {
    try {
        const { date, accessType, comments, status } = req.body;
        if (!date || !accessType) throw { status: 400, message: "date та accessType обов'язкові" };

        const updated = await repo.updateRequestFullSafe(Number(req.params.id), req.user.id, date, accessType, status, comments || "");
        if (!updated) throw { status: 403, message: "Доступ заборонено або заявку не знайдено" };
        res.json({ data: updated });
    } catch (err) { next(err); }
});

// DELETE - Тільки свої (Захист IDOR)
router.delete("/:id", async (req: any, res, next) => {
    try {
        const ok = await repo.deleteRequestSafe(Number(req.params.id), req.user.id);
        if (!ok) throw { status: 403, message: "Доступ заборонено або заявку не знайдено" };
        res.status(204).send();
    } catch (err) { next(err); }
});

export default router;