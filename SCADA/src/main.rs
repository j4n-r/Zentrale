use axum::{
    extract::Path, routing::get, Json, Router
};
use serde_json::{json, Value};
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods(tower_http::cors::Any) 
        .allow_headers(tower_http::cors::Any);

    let app = Router::new()
        .route("/api/{version}/network/devices", get(network)).layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn network(Path(_version): Path<String>)  -> Json<Value> {
    Json(json!([{ "data": 1 }, {"data": 2}]))
}
