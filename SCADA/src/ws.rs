use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade}, State
    },
    response::Response, 
};

use crate::{AppState };

pub async fn ws_system_monitor(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(|socket| system_monitor_subs(socket, state))
}
async fn system_monitor_subs(mut socket: WebSocket, state: AppState) {
    // Use the equivalent of a "do-while" loop so the initial value is
    // processed before awaiting the `changed()` future.
    loop {
        let mut rx = state.rx_sm.clone();
        let message = *rx.borrow_and_update();
        let msg = serde_json::to_string(&message).unwrap();
        let ws_msg = Message::from(msg);
        let _ = socket.send(ws_msg).await;
        println!("{:?}! ", *rx.borrow_and_update());
        if rx.changed().await.is_err() {
            break
        }

    }
}
