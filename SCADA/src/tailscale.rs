use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::IpAddr;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DevicesResponse {
    pub devices: Vec<Device>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    pub addresses: Vec<IpAddr>,
    pub id: String,
    pub node_id: String,
    pub user: String,
    pub name: String,
    pub hostname: String,
    pub client_version: String,
    pub update_available: bool,
    pub os: String,
    pub created: Option<DateTime<Utc>>,
    pub last_seen: Option<DateTime<Utc>>,
    pub key_expiry_disabled: bool,
    pub expires: Option<DateTime<Utc>>,
    pub authorized: bool,
    pub is_external: bool,
    pub multiple_connections: Option<bool>,
    pub machine_key: String,
    pub node_key: String,
    pub blocks_incoming_connections: bool,
    #[serde(default)]
    pub enabled_routes: Vec<String>,
    #[serde(default)]
    pub advertised_routes: Vec<String>,
    pub client_connectivity: ClientConnectivity,
    #[serde(default)]
    pub tags: Vec<String>,
    pub tailnet_lock_error: String,
    pub tailnet_lock_key: String,
    pub posture_identity: Option<PostureIdentity>,
    pub is_ephemeral: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientConnectivity {
    #[serde(default)]
    pub endpoints: Vec<String>,
    pub mapping_varies_by_dest_ip: bool,
    #[serde(default)]
    pub latency: HashMap<String, DerpLatency>,
    pub client_supports: ClientSupports,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DerpLatency {
    pub preferred: Option<bool>,
    pub latency_ms: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientSupports {
    pub hair_pinning: Option<bool>,
    pub ipv6: bool,
    pub pcp: bool,
    pub pmp: bool,
    pub udp: bool,
    pub upnp: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostureIdentity {
    #[serde(default)]
    pub serial_numbers: Vec<String>,
    pub disabled: Option<bool>,
}
