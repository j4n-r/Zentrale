use std::fs;

use anyhow::Context;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Percantage(u8);

#[derive(Debug, Serialize)]
pub struct System {
    pub host_name: String,
    pub os_name: String,
    pub kernel_version: String,
    pub total_cpu_usage: Percantage,
    cpu_time: CpuTime, //cpu_cores: u8,
                       // cpu_usage_per_core: HashMap<String, i32>,
                       // total_mem_usage: u8,
                       // TODO add later processes, usage per process
}
#[derive(Debug, Serialize)]
pub struct CpuTime {
    total_time: usize,
    work_time: usize,
}

impl System {
    pub fn new() -> Self {
        let hostname = fs::read_to_string("/etc/hostname")
            .expect("Error reading hostname /etc/hostname")
            .trim()
            .to_string();

        let cpu_time = Self::get_cpu_usage(0).expect("");
        System {
            host_name: hostname,
            os_name: Self::get_os_name(),
            kernel_version: Self::get_kernel_version(),
            total_cpu_usage: Percantage(0),
            cpu_time: cpu_time,
        }
    }
    fn get_os_name() -> String {
        let os_release =
            fs::read_to_string("/etc/os-release").expect("Error reading /etc/os-release");
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

    // line=0 for all cores
    fn get_cpu_usage(file_line: u16) -> anyhow::Result<CpuTime> {
        let proc_stat = fs::read_to_string("/proc/stat").context("Error reading /proc/stat")?;
        let line = proc_stat
            .lines()
            .nth(file_line as usize)
            .context("not enough lines in /proc/stat")?;
        let mut cpu_time = line
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

    fn calculate_cpu_usage(old_stats: &CpuTime, new_stats: &CpuTime) -> Percantage {
        let work_time_delta = (new_stats.work_time - old_stats.work_time) as f64;
        let total_time_delta = (new_stats.total_time - old_stats.total_time) as f64;
        let usage = ((work_time_delta / total_time_delta) * 100.0).round() as u8;
        dbg!(usage);
        Percantage(usage)
    }
    pub fn update_cpu_stats(&mut self) {
        let old_cpu_time = &self.cpu_time;
        let new_cpu_time = System::get_cpu_usage(0).expect("");
        self.total_cpu_usage = System::calculate_cpu_usage(old_cpu_time, &new_cpu_time);
        self.cpu_time = new_cpu_time;
    }
}
