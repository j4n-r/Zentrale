use std::convert::Infallible;

use axum::{
    extract::State,
    response::{
        Sse,
        sse::{Event, KeepAlive},
    },
};
use tokio_stream::wrappers::WatchStream;
use tokio_stream::{Stream, StreamExt};

use crate::AppState;

pub async fn system_monitor(
    State(state): State<AppState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = WatchStream::new(state.rx_sm.clone()).map(|value| {
        let msg = serde_json::to_string(&value).unwrap();
        Ok(Event::default().event("system_update").data(msg))
    });

    Sse::new(stream).keep_alive(KeepAlive::default())
}
