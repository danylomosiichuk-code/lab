import { all, run } from "../db/dbClient";

export const getAllApprovals = async () => {
    return await all("SELECT * FROM Approvals");
};

export const deleteApproval = async (id: number) => {
    await run(`DELETE FROM Approvals WHERE id = ${id}`);
    return true;
};