import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function StepOne() {
  return (
    <section className="my-24 flex flex-col justify-center items-center">
      <article className="flex flex-col justify-center items-center w-full gap-8 md:max-w-[500px]">
        <article className="flex flex-col gap-2 w-full">
          <Label htmlFor="name">Bot Name</Label>
          <Input required name="name" id="name" placeholder="Botworld customer support" />
        </article>
      </article>
    </section>
  );
}

export default StepOne;
