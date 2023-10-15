import { invoke } from "@tauri-apps/api";
import { LifeRecord } from "../interfaces/life_record";
import Database from "tauri-plugin-sql-api";
import { escape } from "sqlstring";

const db = await Database.load("sqlite:test.db");

async function sql_select<T>(sql: string, bindValues?: unknown[] | undefined) {
  return (await db.select(sql, bindValues)) as T;
}

async function sql_execute(sql: string, bindValues?: unknown[] | undefined) {
  return await db.execute(sql, bindValues);
}

function generate_crud<T extends Record<string, any>>(table_name: string) {
  async function get_page_count(page_size: number) {
    const res = await sql_select<number>(`SELECT COUNT(*) FROM ${table_name}`);
    return Math.ceil(res / page_size);
  }

  async function get_page(page: number, page_size: number) {
    const res = await sql_select<T[]>(
      `SELECT * FROM ${table_name} LIMIT $1 OFFSET $2`,
      [page_size, page]
    );
    return res;
  }

  async function get_all(page: number, page_size: number) {
    const res = await sql_select<T[]>(`SELECT * FROM ${table_name}`, [
      page_size,
      page,
    ]);
    return res;
  }

  async function insert(item: T) {
    const keys = Object.keys(item);
    const values = Object.values(item);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${table_name} (${escape(
      keys.join(", ")
    )}) VALUES (${escape(placeholders.join(", "))}) RETURNING id`;
    const result = await sql_select<{ id: number }>(sql, values);
    return result.id;
  }

  async function remove(id: number) {
    const sql = `DELETE FROM ${table_name} WHERE id = $1`;
    await sql_execute(sql, [id]);
  }

  async function update(id: number, item: T) {
    const keys = Object.keys(item);
    const values = Object.values(item);
    const assignments = keys.map((key, i) => `${key} = $${i + 2}`);
    const sql = `UPDATE ${table_name} SET ${assignments.join(
      ", "
    )} WHERE id = $1`;
    await sql_execute(sql, [id, ...values]);
  }
  return {
    get_page_count,
    get_page,
    get_all,
    insert,
    remove,
    update,
  };
}
