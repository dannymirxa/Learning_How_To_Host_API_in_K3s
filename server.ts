// import { Database } from "duckdb-async";
import { getAllEmployees, getEmployeeByID, createNewEmployee } from "./router.ts";
import { createEmployeeSchemas, updateEmployeeSchemas } from "./schemas.ts";
import express from "express";
import { z } from "zod";

const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
});


const validate = (schema: any) => (req: any, res: any, next: any) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return res.status(400).send(error);
    }
} 

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

app.get("/getEmployeebyID/:id", async (req: any, res: any) => {
    const id = req.params.id;
    try {
        z.number().int().parse(Number(id))
        const employees = await getEmployeeByID(id);
        const jsonEmployees = JSON.stringify(employees, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );
        res.json(JSON.parse(jsonEmployees));
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch employee with id ${id}` });
    }
});

app.post("/createNewEmployee", validate(createEmployeeSchemas), async (req: any, res: any) => {
    try {
        const newEmployee = await createNewEmployee(req);
        const jsonEmployees = JSON.stringify(newEmployee, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );
        res.json(JSON.parse(jsonEmployees));
    } catch (error) {
        res.status(404).json({ error: "Failed to create new Employee" });
    }
})