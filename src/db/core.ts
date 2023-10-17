import { escape } from "sqlstring";
import Database from "tauri-plugin-sql-api";

const db = await Database.load("sqlite:test.db");

const CURRENT_DB_VERSION = 1;

function generate_create_table_sql(
  table_name: string,
  table_schema: Record<string, string>
) {
  const columns = Object.entries(table_schema)
    .map(([name, type]) => `${name} ${type}`)
    .join(", ");
  const sql = `CREATE TABLE IF NOT EXISTS ${table_name} (${columns})`;
  return sql;
}

async function update_database(create_table_sql: string) {
  await sql_execute(`
  BEGIN TRANSACTION;
  DECLARE uv INTEGER;
  SET uv = PRAGMA user_version;
  -- 执行数据库模式更新
  IF uv < ${CURRENT_DB_VERSION} THEN
    -- 创建表格的SQL语句
    DECLARE create_table_sql TEXT;
    SET create_table_sql = ${create_table_sql};
    EXECUTE create_table_sql;
  END IF;
  COMMIT;
  `);
}

async function sql_select<T>(sql: string, bindValues?: unknown[] | undefined) {
  return (await db.select(sql, bindValues)) as T;
}

async function sql_execute(sql: string, bindValues?: unknown[] | undefined) {
  return await db.execute(sql, bindValues);
}

export function generate_crud<T extends Record<string, any>>(
  table_name: string,
  table_schema: Record<string, string>
) {
  const init_promise = init();

  async function init() {
    await update_database(generate_create_table_sql(table_name, table_schema));
  }

  async function get_page_count(page_size: number) {
    await init_promise;
    const res = await sql_select<number>(`SELECT COUNT(*) FROM ${table_name}`);
    return Math.ceil(res / page_size);
  }

  async function get_page(page: number, page_size: number) {
    await init_promise;

    const res = await sql_select<T[]>(
      `SELECT * FROM ${table_name} LIMIT $1 OFFSET $2`,
      [page_size, page]
    );
    return res;
  }

  async function get_all(page: number, page_size: number) {
    await init_promise;

    const res = await sql_select<T[]>(`SELECT * FROM ${table_name}`, [
      page_size,
      page,
    ]);
    return res;
  }

  async function insert(item: Omit<T, "id">) {
    await init_promise;

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
    await init_promise;

    const sql = `DELETE FROM ${table_name} WHERE id = $1`;
    await sql_execute(sql, [id]);
  }

  async function update(id: number, item: Omit<T, "id">) {
    await init_promise;

    const keys = Object.keys(item);
    const values = Object.values(item);
    const assignments = keys.map((key, i) => `${key} = $${i + 2}`);
    const sql = `UPDATE ${table_name} SET ${assignments.join(
      ", "
    )} WHERE id = $1`;
    await sql_execute(sql, [id, ...values]);
  }
  return {
    init
    get_page_count,
    get_page,
    get_all,
    insert,
    remove,
    update,
  };
}
