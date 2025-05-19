import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { useEffect, useState } from 'react';

function StepThree({ setStep, step }: { setStep: any; step: number }) {
  const [botData, setBotData] = useState<{
    platform?: string;
    phoneNumber?: string;
    telegramUsername?: string;
  }>({});

  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');

  useEffect(() => {
    // Load existing bot data from localStorage
    const savedData = JSON.parse(localStorage.getItem('bot') || '{}');
    setBotData(savedData);
  }, []);

  const completeStepThree = () => {
    // Prepare update data
    const updateData: Record<string, string> = {};

    if (botData.platform?.includes('whatsapp') || botData.platform === 'both') {
      updateData.phoneNumber = phoneNumber;
    }

    if (botData.platform?.includes('telegram') || botData.platform === 'both') {
      updateData.telegramUsername = telegramUsername;
    }

    // Save to localStorage
    localStorage.setItem(
      'bot',
      JSON.stringify({
        ...botData,
        ...updateData,
      })
    );

    console.log(JSON.parse(localStorage.getItem('bot')));

    // Move to next step
    // setStep(step + 1);
  };

  const showWhatsAppField = ['whatsapp', 'both'].includes(botData.platform || '');
  const showTelegramField = ['telegram', 'both'].includes(botData.platform || '');

  return (
    <section className="my-24 flex flex-col justify-center items-center">
      <article className="flex flex-col justify-center items-center w-full gap-8 md:max-w-[500px]">
        {showWhatsAppField && (
          <article className="flex flex-col gap-2 w-full">
            <Label htmlFor="whatsapp-phone">WhatsApp Phone Number</Label>
            <PhoneInput
              value={phoneNumber}
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
          onClick={completeStepThree}
          className="py-6 px-4 w-full"
          type="button"
          disabled={(showWhatsAppField && !phoneNumber) || (showTelegramField && !telegramUsername)}
        >
          Next
        </Button>
      </article>
    </section>
  );
}

export default StepThree;
