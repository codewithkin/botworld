import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function StepThree({ setStep, step }: { setStep: any; step: number }) {
  const [botData, setBotData] = useState<{
    platform?: string;
    phoneNumber?: string;
    telegramUsername?: string;
  }>({});

  const [whatsappNumber, setPhoneNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  // Create bot mutation
  const { mutate, isPending: creatingBot } = useMutation({
    mutationKey: ["create-bot"],
    mutationFn: async () => {
      // Prepare update data
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

      // Save to localStoragestep={currentStep}
      const fullData = {
        ...botData,
        ...updateData,
      };
      localStorage.setItem("bot", JSON.stringify(fullData));

      // Submit to API
      const { data } = await axios.post("/api/bots", fullData);
      return data;
    },
    onSuccess: (newBot) => {
      toast.success("Bot created successfully");

      console.log("Data received from backend: ", newBot);

      // Clear the bot data from localStorage
      localStorage.removeItem("bot");

      // Set the botId
      localStorage.setItem("botId", newBot.id);

      setStep(step + 1);
    },
    onError: (error: any) => {
      toast.error("Failed to create bot", {
        description:
          error.response?.data?.message || "An unexpected error occurred",
      });
    },
  });

  useEffect(() => {
    // Load existing bot data from localStorage
    const savedData = JSON.parse(localStorage.getItem("bot") || "{}");
    setBotData(savedData);
  }, []);

  const showWhatsAppField = ["whatsapp", "both"].includes(
    botData.platform || "",
  );
  const showTelegramField = ["telegram", "both"].includes(
    botData.platform || "",
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
