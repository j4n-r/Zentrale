use std::{ time::Duration};

use axum::{  routing::{any, get}, Router};
use sysinfo::{CpuTime, Percantage, System, SystemMonitorMessage};
use tokio::sync::watch;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
mod api;
mod sysinfo;
mod ws;
mod tailscale;

pub struct Config {
    pub api_url: String,
}

#[derive(Clone)]
pub struct AppState{
    rx_sm: watch::Receiver<SystemMonitorMessage>,
}

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "SCADA=debug,axum=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let (tx, mut rx) = tokio::sync::watch::channel(SystemMonitorMessage {
        total_cpu_usage: Percantage(0),
    });
    start_system_monitor(tx).await;

    let state = AppState{ rx_sm: rx.clone()};

    let cors = tower_http::cors::CorsLayer::new().allow_origin(tower_http::cors::Any);

    let app = Router::new()
        .route("/api/{version}/system/info", get(api::system_info))
        .route("/ws/system/monitor", any(ws::ws_system_monitor))
        .with_state(state)
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn start_system_monitor(tx: tokio::sync::watch::Sender<sysinfo::SystemMonitorMessage>) {
    tokio::spawn(async move {
        let system = System::new();
        let mut old_cpu_time = system.cpu_time;
        loop {
            let new_cpu_time = CpuTime::new(0).expect("");
            let cpu_usage = sysinfo::calculate_cpu_usage(&old_cpu_time, &new_cpu_time);
            old_cpu_time = new_cpu_time;
            let _ = tx.send(SystemMonitorMessage {
                total_cpu_usage: cpu_usage,
            });
            tokio::time::sleep(Duration::from_secs(3)).await;
        }
    });
}

