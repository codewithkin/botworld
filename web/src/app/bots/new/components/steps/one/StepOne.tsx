import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { AnyUseBaseQueryOptions, useMutation } from "@tanstack/react-query";
import { useState } from "react";

function StepOne({ setStep, step }: { setStep: any; step: number }) {
  // Track values
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const completeStepOne = () => {
    // Save the data to localStorage
    localStorage.setItem("bot", JSON.stringify({ name, purpose, phoneNumber }));

    // Update the step counter
    setStep(step++);
  };

  return (
    <section className="my-24 flex flex-col justify-center items-center">
      <article className="flex flex-col justify-center items-center w-full gap-8 md:max-w-[500px]">
        <article className="flex flex-col gap-2 w-full">
          <Label htmlFor="name">Bot Name</Label>
          <Input
            className="py-6 px-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            name="name"
            id="name"
            placeholder="Botworld customer support"
          />
        </article>

        <article className="flex flex-col gap-2 w-full">
          <Label htmlFor="purpose">Purpose</Label>
          <Textarea
            className="py-6 px-4"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            name="purpose"
            id="purpose"
            placeholder="A bot that answers customer questions about Botworld"
          />
        </article>

        <article className="flex flex-col gap-2 w-full">
          <Label htmlFor="purpose">Fallback phone number</Label>
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            required
            name="purpose"
            id="purpose"
            placeholder="The phone number of a real person"
          />
        </article>

        <Button
          onClick={() => completeStepOne()}
          className="py-6 px-4 w-full"
          type="button"
        >
          Create bot
        </Button>
      </article>
    </section>
  );
}

export default StepOne;
