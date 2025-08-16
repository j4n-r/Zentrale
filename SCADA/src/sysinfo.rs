use std::{collections::HashMap, fs, sync::OnceLock};

#[derive(Debug)]
pub struct System {
    host_name: String,
    os_name: String,
    kernel_version: String,
    // total_cpu_usage: i32,
    // cpu_usage_per_core: HashMap<String, i32>,
    // total_mem_usage: i32,
    // TODO add later processes, usage per process
}

impl System {
    pub fn new() -> Self {
        let hostname = fs::read_to_string("/etc/hostname")
            .expect("Error reading hostname /etc/hostname")
            .trim()
            .to_string();
        System {
            host_name: hostname,
            os_name: Self::get_os_name(),
            kernel_version: Self::get_kernel_version(),
        }
    }
    pub fn instance() -> &'static System {
        static INSTANCE: OnceLock<System> = OnceLock::new();
        INSTANCE.get_or_init(|| System::new())
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
}
