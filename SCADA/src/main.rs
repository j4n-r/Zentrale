use axum::{
    extract::Path, routing::get, Json, Router
};
use serde_json::{json, Value};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
mod tailscale;

pub struct Config {
    pub api_url: String
}

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| {
                    "SCADA=debug,axum=debug,tower_http=debug".into()
                })
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any);

    let app = Router::new()
        .route("/api/{version}/network/devices", get(network)).layer(cors).layer(tower_http::trace::TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn network(Path(_version): Path<String>)  -> Json<Value> {
    Json(json!([{ "data": 1 }, {"data": 2}]))
}


