use axum::{
    Router,
    routing::{any, get},
};
use sysinfo::{Percantage, SystemMonitorMessage};
use tokio::sync::watch;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
mod api;
mod sse;
mod sysinfo;
mod tailscale;

pub struct Config {
    pub api_url: String,
}

#[derive(Clone)]
pub struct AppState {
    rx_sm: watch::Receiver<SystemMonitorMessage>,
}

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    sysinfo::get_cpu_cores();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "SCADA=debug,axum=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let (tx, rx) = tokio::sync::watch::channel(SystemMonitorMessage {
        total_cpu_usage: Percantage(0),
    });
    sysinfo::start_system_monitor(tx).await;

    let state = AppState { rx_sm: rx.clone() };

    let cors = tower_http::cors::CorsLayer::new().allow_origin(tower_http::cors::Any);

    let app = Router::new()
        .route("/api/{version}/system/info", get(api::system_info))
        .route("/sse/system/monitor", get(sse::system_monitor))
        .with_state(state)
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
