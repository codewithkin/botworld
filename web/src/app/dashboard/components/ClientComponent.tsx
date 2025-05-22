"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Clock10, Bot, FileText, MessageCircle } from "lucide-react";
import { MessagesOverTime } from "../components/messages/MessagesOverTime";

function ClientComponent() {
  // Fetch the user's data
  const { data, isLoading: gettingUserData } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      const res = await axios.get("/api/data");
      return res.data.data;
    },
  });

  // Show loading skeletons while fetching
  if (gettingUserData) {
    return (
      <section>
        <article className="grid sm:grid-cols-2 gap-4 md:gap-8 md:grid-cols-4 w-full">
          {["n", "d", "k", "l"].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-4 p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </article>
      </section>
    );
  }

  // Construct card metrics from data
  const metrics = [
    {
      title: "Time Saved",
      value: data.messages.length * 5,
      unit: "hrs",
      description: `All the time you've saved by using Botworld instead of replying to every DM yourself.`,
      icon: <Clock10 />,
    },
    {
      title: "Bots",
      value: data.bots.length,
      unit: "",
      description: `Total bots you've created to handle customer interactions.`,
      icon: <Bot />,
    },
    {
      title: "Documents",
      value: data.documents.length,
      unit: "",
      description: `Knowledge base documents uploaded and used by your bots.`,
      icon: <FileText />,
    },
    {
      title: "Messages",
      value: data.messages.length,
      unit: "",
      description: `Total messages handled automatically by your bots.`,
      icon: <MessageCircle />,
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <article className="grid sm:grid-cols-2 gap-4 md:gap-8 md:grid-cols-4 w-full">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent>
              <CardHeader className="flex text-md font-semibold gap-2 items-center">
                {metric.icon}
                <h4>{metric.title}</h4>
              </CardHeader>

              <article className="flex flex-col px-6 pt-6">
                <h3 className="text-2xl font-semibold">
                  {metric.value} {metric.unit}
                </h3>
              </article>

              <CardFooter className="pt-2">
                <CardDescription className="text-sm">
                  {metric.description}
                </CardDescription>
              </CardFooter>
            </CardContent>
          </Card>
        ))}
      </article>

      {/* Messages over time */}
      <MessagesOverTime messages={data.messages} />
    </section>
  );
}

export default ClientComponent;
