use std::{thread, time::Duration};

use axum::{Router, extract::Path, routing::get};
use sysinfo::System;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
mod api;
mod sysinfo;
mod tailscale;

pub struct Config {
    pub api_url: String,
}

#[tokio::main]
async fn main() {
    start_system_monitor().await;

    dotenv::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "SCADA=debug,axum=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    let cors = tower_http::cors::CorsLayer::new().allow_origin(tower_http::cors::Any);

    let app = Router::new()
        .route("/api/{version}/system/info", get(api::system_info))
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn start_system_monitor() {
    tokio::spawn(async move {
        let mut system = System::new();
        info!(system);
        loop {
            System::update_cpu_stats(&mut system);
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });
}
