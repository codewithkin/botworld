import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { MessageCircleCode } from "lucide-react";
import Image from "next/image";

function StepTwo({ setStep, step }: { setStep: any; step: number }) {
  const [platform, setPlatform] = useState("");

  const platforms = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: (
        <Image
          src="/icons/whatsapp.png"
          alt="WhatsApp"
          width={48}
          height={48}
          className="h-6 w-6"
        />
      ),
      description: "Connect with customers through WhatsApp messaging",
      disabled: false,
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: (
        <Image
          src="/icons/telegram.png"
          alt="Telegram"
          width={48}
          height={48}
          className="h-6 w-6"
        />
      ),
      description: "Deploy your bot on the Telegram platform",
      disabled: true,
    },
    {
      id: "both",
      label: "Both Platforms",
      icon: <MessageCircleCode className="h-6 w-6" />,
      description: "Enable your bot on both WhatsApp and Telegram",
      disabled: true,
    },
  ];

  const completeStepTwo = () => {
    const botData = JSON.parse(localStorage.getItem("bot") || "{}");
    localStorage.setItem("bot", JSON.stringify({ ...botData, platform }));
    setStep(step + 1);
  };

  return (
    <section className="my-24 flex flex-col justify-center items-center">
      <article className="flex flex-col justify-center items-center w-full gap-8 md:max-w-[500px]">
        <article className="flex flex-col gap-4 w-full">
          <Label className="text-base">Select Platform</Label>

          {platforms.map(({ id, label, icon, description, disabled }) => (
            <article
              key={id}
              className={`p-4 border rounded-lg transition-all ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-muted-foreground/50"
              } ${
                platform === id
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/30"
              }`}
              onClick={() => !disabled && setPlatform(id)}
            >
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id={id}
                  name="platform"
                  value={id}
                  checked={platform === id}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                  onChange={() => {}}
                />
                <div className="flex items-center gap-3">
                  <span
                    className={`${disabled ? "opacity-70" : ""} ${
                      platform === id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {icon}
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={id}
                        className={`text-base ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {label}
                      </Label>
                      {disabled && (
                        <Badge variant="outline" className="text-xs">
                          Coming soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </article>

        <Button
          onClick={completeStepTwo}
          className="py-6 px-4 w-full"
          type="button"
          disabled={!platform}
        >
          Next
        </Button>
      </article>
    </section>
  );
}

export default StepTwo;
