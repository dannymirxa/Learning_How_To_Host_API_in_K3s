import { Database, type TableData } from "duckdb-async";

const db = await Database.create("Employee.db");
const con = await db.connect();

async function getAllEmployees(): Promise<TableData> {
    const rows = await db.all("select * from Employees;");
    return rows;
}

// console.log(await getAllEmployess());

export { getAllEmployees };