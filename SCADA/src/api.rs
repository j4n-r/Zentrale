use axum::{Json, extract::Path};
use serde_json::{json, Value};

use crate::sysinfo::System;


pub async fn system_info(Path(_version): Path<String>) -> Json<Value> {
    Json(json!(System::new()))
}
