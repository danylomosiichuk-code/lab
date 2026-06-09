import express from "express";
import * as repo from "../repositories/approvalsRepo";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const data = await repo.getAllApprovals();
        res.json({ data });
    } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
    try {
        await repo.deleteApproval(Number(req.params.id));
        res.status(204).send();
    } catch (err) { next(err); }
});

export default router;