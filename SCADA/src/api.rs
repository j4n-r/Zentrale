use axum::{Json, extract::Path};
use serde_json::{Value, json};

use crate::sysinfo::System;

pub async fn system_info(Path(_version): Path<String>) -> Json<Value> {
    Json(json!(System::new()))
}
