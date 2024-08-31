import { z } from 'zod';

const createEmployeeSchemas = z.object({
    body: z.object
    ({
        EmployeeID: z.number().int(),
        FirstName: z.string(),
        LastName: z.string(),
        BirthDate: z.string().date(),
        HireDate: z.string().datetime(),
        Salary: z.number(),
        IsActive: z.boolean(),
        Email: z.string().email(),
        PhoneNumber: z.number().int()
    })
})

const updateEmployeeSchemas = z.object({
    EmployeeID: z.number().int(),
    body: z.object
    ({
        FirstName: z.string(),
        LastName: z.string(),
        BirthDate: z.string().date(),
        HireDate: z.string().datetime(),
        Salary: z.number(),
        IsActive: z.boolean(),
        Email: z.string().email(),
        PhoneNumber: z.number().int()
    })
})

export { createEmployeeSchemas,  updateEmployeeSchemas}