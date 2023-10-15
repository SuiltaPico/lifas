use rusqlite::{named_params, Connection};
use std::fs;
use tauri::AppHandle;

const CURRENT_DB_VERSION: u32 = 2;

/// 初始化数据库连接，创建.sqlite 文件，升级过期的数据库
pub fn initialize_database(app_handle: &AppHandle) -> Result<Connection, rusqlite::Error> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist.");
    fs::create_dir_all(&app_dir).expect("app data 文件夹无法创建");
    let sqlite_path = app_dir.join("MyApp.sqlite");

    let mut db = Connection::open(sqlite_path)?;

    let mut user_pragma = db.prepare("PRAGMA user_version")?;
    let existing_user_version: u32 =
        user_pragma.query_row([], |row: &rusqlite::Row<'_>| Ok(row.get(0)?))?;
    drop(user_pragma);

    upgrade_database_if_needed(&mut db, existing_user_version)?;

    Ok(db)
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct Record {
    id: i32,
    record_type: String,
    date: i64,
    start_date: i64,
    end_date: i64,
    description: String,
}

/// 升级过期的数据库
pub fn upgrade_database_if_needed(
    db: &mut Connection,
    existing_version: u32,
) -> Result<(), rusqlite::Error> {
    if existing_version < CURRENT_DB_VERSION {
        // 将数据库的日志模式设置为"journal_mode"的 WAL（Write-Ahead Logging）
        db.pragma_update(None, "journal_mode", "WAL")?;

        let tx = db.transaction()?;

        tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;

        tx.execute_batch(
            "
          CREATE TABLE IF NOT EXISTS records (
              id INTEGER PRIMARY KEY,
              type TEXT NOT NULL,
              date TIMESTAMP,
              start_date TIMESTAMP,
              end_date TIMESTAMP,
              description TEXT NOT NULL
          );",
        )?;

        tx.commit()?;
    }

    Ok(())
}

pub fn add_record(record: Record, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare(
      "INSERT INTO records (type, date, start_date, end_date, description) VALUES (@type, @date, @start_date, @end_date, @description)",
  )?;
    statement.execute(named_params! {
        "@type": record.record_type,
        "@date": record.date,
        "@start_date": record.start_date,
        "@end_date": record.end_date,
        "@description": record.description,
    })?;

    Ok(())
}

pub fn delete_record(id: i32, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("DELETE FROM records WHERE id = @id")?;
    statement.execute(named_params! {
        "@id": id,
    })?;

    Ok(())
}

pub fn get_record_by_time_range(
    start_date: i64,
    end_date: Option<i64>,
    db: &Connection,
) -> Result<Vec<Record>, rusqlite::Error> {
    let end_date = end_date.unwrap_or_else(|| chrono::Local::now().timestamp());

    let mut statement = db.prepare(
        "SELECT * FROM records WHERE start_date >= @start_date AND end_date <= @end_date",
    )?;
    let records = statement
        .query_map(
            named_params! {
                "@start_date": start_date,
                "@end_date": end_date,
            },
            |row| {
                Ok(Record {
                    id: row.get(0)?,
                    record_type: row.get(1)?,
                    date: row.get(2)?,
                    start_date: row.get(3)?,
                    end_date: row.get(4)?,
                    description: row.get(5)?,
                })
            },
        )?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(records)
}

pub fn get_record_count_before(date: i64, db: &Connection) -> Result<u32, rusqlite::Error> {
    let mut statement = db.prepare("SELECT COUNT(*) FROM records WHERE date < @date")?;
    let count = statement.query_row(
        named_params! {
            "@date": date,
        },
        |row| row.get(0),
    )?;

    Ok(count)
}

pub fn get_records_page(
    page: u32,
    page_size: u32,
    db: &Connection,
) -> Result<Vec<Record>, rusqlite::Error> {
    let offset = (page - 1) * page_size;
    let mut statement = db.prepare(
      "SELECT id, type, date, start_date, end_date, description FROM records LIMIT @page_size OFFSET @offset",
  )?;
    let records_iter = statement.query_map(
        named_params! {
            "@page_size": page_size,
            "@offset": offset,
        },
        |row| {
            Ok(Record {
                id: row.get(0)?,
                record_type: row.get(1)?,
                date: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                description: row.get(5)?,
            })
        },
    )?;

    let mut records = Vec::new();
    for record_result in records_iter {
        records.push(record_result?);
    }

    Ok(records)
}

pub fn get_records_page_count(page_size: u32, db: &Connection) -> Result<u32, rusqlite::Error> {
    let mut statement = db.prepare("SELECT COUNT(*) FROM records")?;
    let count: u32 = statement.query_row(named_params! {}, |row| row.get(0))?;

    let page_count = (count as f64 / page_size as f64).ceil() as u32;

    Ok(page_count)
}
