import { db } from "../index";
import { users } from "../schema";
import { type InferSelectModel, type InferInsertModel, eq, sql } from "drizzle-orm";
import { firstOrUndefined } from "./utils";
export type User = InferSelectModel<typeof users>

export type NewUser = InferInsertModel<typeof users>;

export async function createUser(name: string): Promise<User> {

    const [result] = await db.
        insert(users).
        values({ name })
        .returning() // returns User[]
    return result
}

export async function getUserByName(name: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.name, name));
    return firstOrUndefined(result);

}

/**
 * Delete *all* rows from the users table.
 * Returns how many rows were deleted.
 */
export async function deleteAllUsers(): Promise<number> {
    // `.returning()` gives you back the deleted rows as an array
    const deleted = await db.delete(users).returning()
    return deleted.length

}

export async function getUsers(): Promise<User[]> {

    return await db.select().from(users)


}