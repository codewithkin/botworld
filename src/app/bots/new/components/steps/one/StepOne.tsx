import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

function StepOne() {
  // Track values
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  // Create bot mutation
  const { data, isPending: creatingBot } = useMutation({
    mutationKey: ['create-bot'],
    mutationFn: async () => {},
  });

  return (
    <section className="my-24 flex flex-col justify-center items-center">
      <article className="flex flex-col justify-center items-center w-full gap-8 md:max-w-[500px]">
        <article className="flex flex-col gap-2 w-full">
          <Label htmlFor="name">Bot Name</Label>
          <Input
            className="py-6 px-4"
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
            required
            name="purpose"
            id="purpose"
            placeholder="A bot that answers customer questions about Botworld"
          />
        </article>

        <article className="flex flex-col gap-2 w-full">
          <Label htmlFor="purpose">Fallback phone number</Label>
          <PhoneInput
            required
            name="purpose"
            id="purpose"
            placeholder="The phone number of a real person"
          />
        </article>

        <Button className="py-6 px-4 w-full" type="button">
          Create bot
        </Button>
      </article>
    </section>
  );
}

export default StepOne;
