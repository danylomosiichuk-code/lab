import express from "express";
import * as repo from "../repositories/usersRepo";

const router = express.Router();

// GET /api/users
router.get("/", async (req, res, next) => {
    try {
        const users = await repo.getAllUsers();
        res.json({ data: users });
    } catch (err) {
        next(err);
    }
});

// POST /api/users
router.post("/", async (req, res, next) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: "Поля email та name є обов'язковими" });
        }
        
        const created = await repo.createUser(email, name);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

export default router;