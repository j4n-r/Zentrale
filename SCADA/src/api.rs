
use axum::{extract::Path, Json};
use serde_json::{json, Value};
use crate::sysinfo;

pub async fn system_info(Path(_version): Path<String>)  -> Json<Value> {
    Json(json!(*sysinfo::System::instance().lock().unwrap()))
}
