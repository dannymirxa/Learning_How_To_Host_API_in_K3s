// import { Database } from "duckdb-async";
import { getAllEmployees } from "./router.ts";
import express from "express";
import { z } from "zod";

const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
});

app.get("/getAllEmployees", async (req: any, res: any) => {
    try {
        const employees = await getAllEmployees();
        const jsonEmployees = JSON.stringify(employees, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );
        res.json(JSON.parse(jsonEmployees));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});