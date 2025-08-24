use axum::{Json, extract::Path};
use serde_json::Value;

pub async fn system_info(Path(_version): Path<String>) -> Json<Value> {
    // Json(json!(*sysinfo::System::instance().lock().unwrap()))
    todo!();
}
