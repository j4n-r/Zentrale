use std::{fs, time::Duration};

use anyhow::Context;
use serde::Serialize;

#[derive(Debug, Serialize, Clone, Copy)]
pub struct SystemMonitorMessage {
    pub total_cpu_usage: Percantage,
}

#[derive(Debug, Serialize, Clone, Copy)]
pub struct Percantage(pub u8);

#[derive(Debug, Serialize)]
pub struct System {
    pub host_name: String,
    pub os_name: String,
    pub kernel_version: String,
    cpu_time: CpuTime,
    pub cpu_cores: usize,
    pub cpu_arch: String,
    
    // cpu_usage_per_core: HashMap<String, i32>,
    // total_mem_usage: u8,
    // TODO add later processes, usage per process
}
#[derive(Debug, Serialize, Clone)]
pub struct CpuTime {
    total_time: usize,
    work_time: usize,
}

impl System {
    // use cpu_core = 0 for all cores
    pub fn new() -> Self {
        let cpu_time = CpuTime::new(0).expect("");
        System {
            host_name: get_hostname(),
            os_name: get_os_name(),
            kernel_version: get_kernel_version(),
            cpu_time: cpu_time,
            cpu_cores : get_cpu_cores(),
            cpu_arch: std::env::consts::ARCH.to_string(),
        }
    }
}

fn get_hostname() -> String {
    fs::read_to_string("/etc/hostname")
        .expect("Error reading hostname /etc/hostname")
        .trim()
        .to_string()
}

fn get_os_name() -> String {
    let os_release = fs::read_to_string("/etc/os-release").expect("Error reading /etc/os-release");
    for line in os_release.lines() {
        if let Some(rest) = line.strip_prefix("PRETTY_NAME=") {
            return rest.trim_matches('"').to_string();
        }
    }
    String::from("Unknown OS")
}
fn get_kernel_version() -> String {
    let version = fs::read_to_string("/proc/version").expect("Error reading /proc/version");
    version
        .split_whitespace()
        .take(3)
        .collect::<Vec<&str>>()
        .join(" ")
        .to_string()
}

pub fn get_cpu_cores() -> usize {
    std::thread::available_parallelism()
        .unwrap()
        .get()
}

impl CpuTime {
    // cpu_core=0 for all cores
    fn new(cpu_core: u16) -> anyhow::Result<Self> {
        let proc_stat = fs::read_to_string("/proc/stat").context("Error reading /proc/stat")?;
        let line = proc_stat
            .lines()
            .nth(cpu_core as usize)
            .context("not enough lines in /proc/stat")?;
        let cpu_time = line
            .strip_prefix("cpu")
            .context("line did not start with cpu")?
            .split_whitespace()
            .map(|s| s.parse::<usize>().unwrap())
            .collect::<Vec<usize>>();

        let new_total_time: usize = cpu_time.iter().sum();
        let new_work_time = new_total_time - cpu_time[3] - cpu_time[4]; // if this fails smth is seriously wrong and it should panic
        Ok(CpuTime {
            total_time: new_total_time,
            work_time: new_work_time,
        })
    }
}

fn calculate_cpu_usage(old_stats: &CpuTime, new_stats: &CpuTime) -> Percantage {
    let work_time_delta = (new_stats.work_time - old_stats.work_time) as f64;
    let total_time_delta = (new_stats.total_time - old_stats.total_time) as f64;
    let usage = ((work_time_delta / total_time_delta) * 100.0).round() as u8;
    dbg!(usage);
    Percantage(usage)
}


pub async fn start_system_monitor(tx: tokio::sync::watch::Sender<SystemMonitorMessage>) {
    tokio::spawn(async move {
        let system = System::new();
        let mut old_cpu_time = system.cpu_time;
        loop {
            let new_cpu_time = CpuTime::new(0).expect("");
            let cpu_usage = calculate_cpu_usage(&old_cpu_time, &new_cpu_time);
            old_cpu_time = new_cpu_time;
            let _ = tx.send(SystemMonitorMessage {
                total_cpu_usage: cpu_usage,
            });
            tokio::time::sleep(Duration::from_secs(3)).await;
        }
    });
}
