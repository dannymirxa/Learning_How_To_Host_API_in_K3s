import { Database, type TableData } from "duckdb-async";
import { createEmployeeSchemas, updateEmployeeSchemas } from "./schemas.ts";
import { z } from "zod";

const db = await Database.create("Employee.db");
const con = await db.connect();

async function getAllEmployees(): Promise<TableData> {
    const rows = await db.all("select * from Employees;");
    return rows;
}

async function getEmployeeByID(id: number): Promise<TableData> {
    const rows = await db.all(`select * from Employees where EmployeeID = ${id};`);
    return rows;
}

function validateCreateInput(input: unknown) {
    const result = createEmployeeSchemas.safeParse(input);
    if (!result.success) {
        throw new Error('Invalid input');
    }
    return result.data;
}

function validateUpdateInput(input: unknown) {
    const result = updateEmployeeSchemas.safeParse(input);
    if (!result.success) {
        throw new Error('Invalid input');
    }
    return result.data;
}


async function createNewEmployee(body: any) {
    try {
        const validInput = validateCreateInput(body)
        const stmt = await con.prepare(`
        INSERT INTO Employees (
            EmployeeID,
            FirstName,
            LastName,
            BirthDate,
            HireDate,
            Salary,
            IsActive,
            Email,
            PhoneNumber
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        await stmt.run(
            validInput.body.EmployeeID,
            validInput.body.FirstName,
            validInput.body.LastName,
            validInput.body.BirthDate,
            validInput.body.HireDate,
            validInput.body.Salary,
            validInput.body.IsActive,
            validInput.body.Email,
            validInput.body.PhoneNumber
        );
        const rows = await db.all(`select * from Employees where EmployeeID = ${validInput.body.EmployeeID};`);
        return rows;
    } catch (error) {
        console.error((error as Error).message);
    }
}

async function updateEmployee(id: number, body: any) {
    try {
        const validInput = validateUpdateInput(body)
        const stmt = await con.prepare(`
        UPDATE Employees 
        SET
            FirstName = ?,
            LastName = ?,
            BirthDate = ?,
            HireDate = ?,
            Salary = ?,
            IsActive = ?,
            Email = ?,
            PhoneNumber = ?
        WHERE EmployeeID = ${id}`);

        await stmt.run(
            validInput.body.FirstName,
            validInput.body.LastName,
            validInput.body.BirthDate,
            validInput.body.HireDate,
            validInput.body.Salary,
            validInput.body.IsActive,
            validInput.body.Email,
            validInput.body.PhoneNumber
        );
        const rows = await db.all(`select * from Employees where EmployeeID = ${id};`);
        return rows;
    } catch (error) {
        console.error((error as Error).message);
    }
}

async function deleteEmployeeByID(id: number) {
    try {
        await db.all(`delete from Employees where EmployeeID = ${id};`);
    } catch (error) {
        console.error((error as Error).message);
    }
}

// console.log(validateUpdateInput(req))

export { getAllEmployees, getEmployeeByID, createNewEmployee, updateEmployee, deleteEmployeeByID};