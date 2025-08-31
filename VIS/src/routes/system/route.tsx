import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Cpu,
  TrendingUp,
  Zap,
  HardDrive,
  MemoryStick,
} from "lucide-react";
import { env } from "@/env";

type SystemMonitorMessage = {
  total_cpu_usage: number;
  mem_info: {
    mem_total: number;
    mem_free: number;
  };
};

type HistoricalData = {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  time: number;
};

export const Route = createFileRoute("/system")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialState: SystemMonitorMessage = {
    total_cpu_usage: 0,
    mem_info: { mem_total: 0, mem_free: 0 },
  };
  const [systemData, setSystemData] =
    useState<SystemMonitorMessage>(initialState);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [maxCpu, setMaxCpu] = useState(0);
  const [avgCpu, setAvgCpu] = useState(0);
  const [maxMemory, setMaxMemory] = useState(0);
  const [avgMemory, setAvgMemory] = useState(0);

  // Helper functions
  const formatMemoryFromKB = (kb: number): string => {
    if (kb === 0) return "0 KB";
    const k = 1024;
    const sizes = ["KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(kb) / Math.log(k));
    return parseFloat((kb / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMemoryUsage = () => {
    const { mem_total, mem_free } = systemData.mem_info;
    if (mem_total === 0) return 0;
    return ((mem_total - mem_free) / mem_total) * 100;
  };

  const getMemoryUsed = () => {
    const { mem_total, mem_free } = systemData.mem_info;
    return mem_total - mem_free;
  };

  useEffect(() => {
    const evtSource = new EventSource(`${env.VITE_API_URL}/sse/system/monitor`);

    evtSource.onopen = () => {
      setIsConnected(true);
    };

    evtSource.onerror = () => {
      setIsConnected(false);
    };

    const handleSystemData = (data: SystemMonitorMessage) => {
      setSystemData(data);

      const memoryUsagePercent =
        data.mem_info.mem_total > 0
          ? ((data.mem_info.mem_total - data.mem_info.mem_free) /
              data.mem_info.mem_total) *
            100
          : 0;

      const now = Date.now();
      const newDataPoint: HistoricalData = {
        timestamp: new Date().toLocaleTimeString(),
        cpu_usage: data.total_cpu_usage,
        memory_usage: memoryUsagePercent,
        time: now,
      };

      setHistoricalData((prev) => {
        const updated = [newDataPoint, ...prev].slice(0, 10); // Keep first 20 points (newest first)

        // Calculate CPU stats
        const cpuValues = updated.map((d) => d.cpu_usage);
        setMaxCpu(Math.max(...cpuValues));
        setAvgCpu(cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length);

        // Calculate Memory stats
        const memoryValues = updated.map((d) => d.memory_usage);
        setMaxMemory(Math.max(...memoryValues));
        setAvgMemory(
          memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
        );

        return updated;
      });
    };

    evtSource.onmessage = (event) => {
      const data: SystemMonitorMessage = JSON.parse(event.data);
      handleSystemData(data);
    };

    evtSource.addEventListener("system_update", (event) => {
      const data: SystemMonitorMessage = JSON.parse(event.data);
      handleSystemData(data);
    });

    return () => {
      evtSource.close();
    };
  }, []);

  const getStatusColor = (usage: number) => {
    if (usage < 50) return "text-green-600";
    if (usage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (usage: number) => {
    if (usage < 50) return { variant: "secondary", text: "Normal" };
    if (usage < 80) return { variant: "default", text: "Moderate" };
    return { variant: "destructive", text: "High" };
  };

  const cpuBadgeInfo = getStatusBadge(systemData.total_cpu_usage);
  const memoryUsagePercent = getMemoryUsage();
  const memoryBadgeInfo = getStatusBadge(memoryUsagePercent);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              System Monitor
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time system performance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Main Metrics Grid - Now 6 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Current CPU Usage */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {systemData.total_cpu_usage.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Progress value={systemData.total_cpu_usage} className="h-2" />
              </div>
              <div className="mt-2">
                <Badge
                  variant={cpuBadgeInfo.variant as any}
                  className="text-xs"
                >
                  {cpuBadgeInfo.text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Current Memory Usage */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-900/50 border-amber-200 dark:border-amber-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Memory Usage
              </CardTitle>
              <MemoryStick className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {memoryUsagePercent.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Progress value={memoryUsagePercent} className="h-2" />
              </div>
              <div className="mt-2">
                <Badge
                  variant={memoryBadgeInfo.variant as any}
                  className="text-xs"
                >
                  {memoryBadgeInfo.text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Memory Details */}
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/50 dark:to-cyan-900/50 border-teal-200 dark:border-teal-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Used</CardTitle>
              <HardDrive className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-teal-700 dark:text-teal-300">
                {formatMemoryFromKB(getMemoryUsed())}
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                of {formatMemoryFromKB(systemData.mem_info.mem_total)}
              </p>
            </CardContent>
          </Card>

          {/* Max CPU */}
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/50 dark:to-rose-900/50 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak CPU</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {maxCpu.toFixed(1)}%
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Session maximum
              </p>
            </CardContent>
          </Card>

          {/* Average CPU */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CPU</CardTitle>
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {avgCpu.toFixed(1)}%
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Session average
              </p>
            </CardContent>
          </Card>

          {/* Data Points */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {historicalData.length}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Samples collected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Charts - Stacked */}
        <div className="space-y-6">
          {/* CPU Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                CPU Usage History
              </CardTitle>
              <CardDescription>
                Real-time CPU usage over the last {historicalData.length} data
                points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalData.length > 1 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        label={{
                          value: "CPU %",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number) => [
                          `${value.toFixed(1)}%`,
                          "CPU Usage",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cpu_usage"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{
                          fill: "#3b82f6",
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: "#3b82f6",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Waiting for CPU data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memory Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5" />
                Memory Usage History
              </CardTitle>
              <CardDescription>
                Real-time memory usage over the last {historicalData.length}{" "}
                data points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalData.length > 1 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        label={{
                          value: "Memory %",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number) => [
                          `${value.toFixed(1)}%`,
                          "Memory Usage",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="memory_usage"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{
                          fill: "#f59e0b",
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: "#f59e0b",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MemoryStick className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Waiting for memory data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
