"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

function StepThree({ setBotId, setStep, step }: { setBotId: any, setStep: any; step: number }) {
  const [botData, setBotData] = useState<{
    platform?: string;
    phoneNumber?: string;
    telegramUsername?: string;
  }>({});

  const [whatsappNumber, setPhoneNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("bot") || "{}");
    setBotData(savedData);
  }, []);

  const { mutate, isPending: creatingBot } = useMutation({
    mutationKey: ["create-bot"],
    mutationFn: async () => {
      const updateData: Record<string, string> = {};

      if (
        botData.platform?.includes("whatsapp") ||
        botData.platform === "both"
      ) {
        updateData.whatsappNumber = whatsappNumber;
      }

      if (
        botData.platform?.includes("telegram") ||
        botData.platform === "both"
      ) {
        updateData.telegramUsername = telegramUsername;
      }

      const fullData = {
        ...botData,
        ...updateData,
      };
      localStorage.setItem("bot", JSON.stringify(fullData));

      const { data } = await axios.post("/api/bots", fullData);
      return data;
    },
    onSuccess: (newBot) => {
      toast.success("Bot created successfully");

      localStorage.removeItem("bot");
      localStorage.setItem("botId", newBot.id);

      // Update the botId in the parent component
      setBotId(newBot.id);
      console.log("New bot created:", newBot);

      socketRef.current = io(process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL!, {
        auth: { botId: newBot.id },
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Socket connected in StepThree");
        socket.emit("authenticate", {
          botId: newBot.id,
          userId: newBot.userId,
          assistantId: newBot.assistantId,
        });
        setStep(step + 1);
      });

      socket.on("connect_error", (err) => {
        console.error("Connection error in StepThree:", err);
        toast.error("Failed to connect to socket.");
      });

      socket.on("disconnect", (reason) => {
        console.warn("Socket disconnected in StepThree:", reason);
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("You have reached the limit of bots for your plan", {
          description: "Please upgrade your plan to create more bots.",
          action: {
            label: "Upgrade",
            onClick: () => router.push("/upgrade"),
          },
        });
        return;
      }

      toast.error("Failed to create bot", {
        description:
          error.response?.data?.message || "An unexpected error occurred",
      });
    },
  });

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.disconnect();
      }
    };
  }, []);

  const showWhatsAppField = ["whatsapp", "both"].includes(
    botData.platform || ""
  );
  const showTelegramField = ["telegram", "both"].includes(
    botData.platform || ""
  );

  const isValid = () => {
    const whatsappValid = !showWhatsAppField || whatsappNumber.length > 5;
    const telegramValid = !showTelegramField || telegramUsername.length > 3;
    return whatsappValid && telegramValid;
  };

  return (
    <section className="my-24 flex flex-col justify-center items-center">
      <article className="flex flex-col justify-center items-center w-full gap-8 md:max-w-[500px]">
        {showWhatsAppField && (
          <article className="flex flex-col gap-2 w-full">
            <Label htmlFor="whatsapp-phone">WhatsApp Phone Number</Label>
            <PhoneInput
              value={whatsappNumber}
              onChange={setPhoneNumber}
              required
              id="whatsapp-phone"
              placeholder="+1 234 567 890"
            />
          </article>
        )}

        {showTelegramField && (
          <article className="flex flex-col gap-2 w-full">
            <Label htmlFor="telegram-username">Telegram Username</Label>
            <Input
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              required
              id="telegram-username"
              placeholder="@your_username"
              className="py-6 px-4"
            />
          </article>
        )}

        <Button
          onClick={() => mutate()}
          className="py-6 px-4 w-full"
          type="button"
          disabled={!isValid() || creatingBot}
        >
          {creatingBot ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Bot...
            </>
          ) : (
            "Create Bot"
          )}
        </Button>
      </article>
    </section>
  );
}

export default StepThree;

