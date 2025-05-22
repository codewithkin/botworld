"use client";
import { useState, useEffect, ReactNode } from "react";
import StepOne from "../components/steps/one/StepOne";
import StepTwo from "../components/steps/one/StepTwo";
import StepThree from "../components/steps/one/StepThree";
import StepFour from "../components/steps/one/StepFour";

type Step = {
  title: string;
  step: number;
  component?: ReactNode;
};

function ClientComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [botId, setBotId] = useState("");

  // Load botId safely after mount
  useEffect(() => {
    setIsClient(true);
    const savedBotId =
      typeof window !== "undefined" ? localStorage.getItem("botId") : null;
    setBotId(savedBotId || "");
  }, []);

  const stepsHeaderData: Step[] = [
    {
      title: "Bot metadata",
      step: 1,
      component: <StepOne step={currentStep} setStep={setCurrentStep} />,
    },
    {
      title: "Your bot's platforms",
      step: 2,
      component: <StepTwo setStep={setCurrentStep} step={currentStep} />,
    },
    {
      title: "Configure your bot's behavior",
      step: 3,
      component: <StepThree step={currentStep} setStep={setCurrentStep} />,
    },
    {
      title: "Confirm details",
      step: 4,
      component: isClient ? <StepFour botId={botId} /> : null,
    },
  ];

  // Only render after confirming client-side
  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Initializing bot creation...</p>
      </div>
    );
  }

  const CurrentStepComponent = stepsHeaderData[currentStep - 1].component;

  return (
    <section className="md:p-8 p-4">
      {/** Header (Showing progress) */}
      <article className="w-full h-full flex flex-col justify-center items-center">
        <article className="flex md:flex-row flex-col gap-4 justify-around md:items-center w-full">
          {stepsHeaderData.map((step: Step) => (
            <span
              key={step.step}
              className={`${
                step.step === currentStep
                  ? "text-primary"
                  : "text-muted-foreground"
              } font-medium flex items-center gap-2`}
            >
              <span
                className={` ${
                  step.step === currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground"
                } rounded-full p-2 text-white text-sm flex items-center justify-center h-6 w-6`}
              >
                {step.step}
              </span>
              {step.title}
            </span>
          ))}
        </article>
      </article>

      {/* Conditional rendering of step components */}
      {CurrentStepComponent && (
        <div className="mt-8 animate-fade-in">{CurrentStepComponent}</div>
      )}
    </section>
  );
}

export default ClientComponent;
