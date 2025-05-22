"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  totalMessages: {
    label: "Total Messages",
    color: "hsl(var(--chart-1))",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-3))",
  },
};

interface MessagesOverTimeProps {
  messages: Array<{
    createdAt: Date | string;
    sender: string;
  }>;
}

export function MessagesOverTime({ messages = [] }: MessagesOverTimeProps) {
  const chartData = React.useMemo(() => {
    if (!messages.length) return [];

    const groupedData = messages.reduce(
      (acc, message) => {
        const date = new Date(message.createdAt).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = { desktop: 0, mobile: 0 };

        if (message.sender.toLowerCase() === "desktop") {
          acc[date].desktop += 1;
        } else if (message.sender.toLowerCase() === "mobile") {
          acc[date].mobile += 1;
        }
        return acc;
      },
      {} as Record<string, { desktop: number; mobile: number }>,
    );

    return Object.entries(groupedData)
      .map(([date, counts]) => ({
        date,
        ...counts,
        totalMessages: counts.desktop + counts.mobile,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [messages]);

  if (!messages.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Messages Over Time</CardTitle>
          <CardDescription>No messages available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Messages Over Time</CardTitle>
          <CardDescription>No valid message data to display</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Messages Over Time</CardTitle>
        <CardDescription>
          Total messages sent across devices in the last few months.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalMessages"
              stroke={chartConfig.totalMessages.color}
              name={chartConfig.totalMessages.label}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="desktop"
              stroke={chartConfig.desktop.color}
              name={chartConfig.desktop.label}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mobile"
              stroke={chartConfig.mobile.color}
              name={chartConfig.mobile.label}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
