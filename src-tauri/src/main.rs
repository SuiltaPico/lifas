// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod state;

// #[tauri::command]
// fn add_record(app_handle: AppHandle, record: Record) -> Result<(), String> {
//     app_handle
//         .db(|db: &rusqlite::Connection| database::add_record(record, db))
//         .map_err(|e| e.to_string())
// }

// #[tauri::command]
// fn remove_record(app_handle: AppHandle, id: i32) -> Result<(), String> {
//     app_handle
//         .db(|db| database::delete_record(id, db))
//         .map_err(|e| e.to_string())
// }

// #[tauri::command]
// fn get_records_page_count(app_handle: AppHandle, page_size: u32) -> Result<u32, String> {
//     app_handle
//         .db(|db| database::get_records_page_count(page_size, db))
//         .map_err(|e| e.to_string())
// }

// #[tauri::command]
// fn get_records_page(
//     app_handle: AppHandle,
//     page: u32,
//     page_size: u32,
// ) -> Result<Vec<Record>, String> {
//     app_handle
//         .db(|db| database::get_records_page(page, page_size, db))
//         .map_err(|e| e.to_string())
// }

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        // .manage(AppState {
        //     db: Default::default(),
        // })
        // .invoke_handler(tauri::generate_handler![
        //     add_record,
        //     remove_record,
        //     get_records_page_count,
        //     get_records_page
        // ])
        // .setup(|app| {
        //     let handle = app.handle();

        //     let app_state: State<AppState> = handle.state();
        //     let db = database::initialize_database(&handle).expect("数据库初始化失败了");
        //     *app_state.db.lock().unwrap() = Some(db);

        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
