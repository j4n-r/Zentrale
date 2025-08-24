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
import { Activity, Cpu, TrendingUp, Zap } from "lucide-react";
import { env } from "@/env";

type SystemMonitorMessage = {
  total_cpu_usage: number;
};

type HistoricalData = {
  timestamp: string;
  cpu_usage: number;
  time: number;
};

export const Route = createFileRoute("/system")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialState: SystemMonitorMessage = { total_cpu_usage: 0 };
  const [cpu, setCpu] = useState<SystemMonitorMessage>(initialState);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [maxCpu, setMaxCpu] = useState(0);
  const [avgCpu, setAvgCpu] = useState(0);

  useEffect(() => {
    const evtSource = new EventSource(`${env.VITE_API_URL}/sse/system/monitor`);

    evtSource.onopen = () => {
      setIsConnected(true);
    };

    evtSource.onerror = () => {
      setIsConnected(false);
    };

    evtSource.onmessage = (event) => {
      const data: SystemMonitorMessage = JSON.parse(event.data);
      setCpu(data);

      const now = Date.now();
      const newDataPoint: HistoricalData = {
        timestamp: new Date().toLocaleTimeString(),
        cpu_usage: data.total_cpu_usage,
        time: now,
      };

      setHistoricalData((prev) => {
        const updated = [...prev, newDataPoint].slice(-20); // Keep last 20 points

        // Calculate stats
        const values = updated.map((d) => d.cpu_usage);
        setMaxCpu(Math.max(...values));
        setAvgCpu(values.reduce((a, b) => a + b, 0) / values.length);

        return updated;
      });
    };

    evtSource.addEventListener("system_update", (event) => {
      const data: SystemMonitorMessage = JSON.parse(event.data);
      setCpu(data);

      const now = Date.now();
      const newDataPoint: HistoricalData = {
        timestamp: new Date().toLocaleTimeString(),
        cpu_usage: data.total_cpu_usage,
        time: now,
      };

      setHistoricalData((prev) => {
        const updated = [...prev, newDataPoint].slice(-20);

        const values = updated.map((d) => d.cpu_usage);
        setMaxCpu(Math.max(...values));
        setAvgCpu(values.reduce((a, b) => a + b, 0) / values.length);

        return updated;
      });
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

  const badgeInfo = getStatusBadge(cpu.total_cpu_usage);

  return (
    <div className="min-h-screen  p-6">
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

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current CPU Usage */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {cpu.total_cpu_usage.toFixed(1)}%
              </div>
              <div className="mt-3">
                <Progress value={cpu.total_cpu_usage} className="h-2" />
              </div>
              <div className="mt-2">
                <Badge variant={badgeInfo.variant as any}>
                  {badgeInfo.text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Max CPU */}
          <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/50 dark:to-rose-900/50 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {maxCpu.toFixed(1)}%
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Maximum in session
              </p>
            </CardContent>
          </Card>

          {/* Average CPU */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Usage
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
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
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {historicalData.length}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Samples collected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
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
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--primary)",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "var(--primary)",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for data...</p>
                  <p className="text-sm mt-1"></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
