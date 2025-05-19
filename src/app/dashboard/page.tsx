'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Clock10 } from 'lucide-react';

function DashboardPage() {
  // Fetch the user's data
  const { data, isLoading: gettingUserData } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const res = await axios.get('/api/data');

      return res.data.data;
    },
  });

  console.log('Data: ', data);

  return (
    <section>
      {/* Data cards */}
      <article className="grid sm:grid-cols-2 gap-4 md:gap-8 md:grid-cols-4 w-full">
        {/* Time saved */}
        <Card>
          <CardContent>
            <CardHeader className="flex text-md font-semibold gap-2 items-center">
              <Clock10 />
              <h4>Time Saved</h4>
            </CardHeader>

            <article className="flex flex-col px-6 pt-6">
              <h3 className="text-2xl font-semibold">{40} hrs</h3>
            </article>

            <CardFooter className="pt-2">
              <CardDescription className="text-sm">
                All the time you've saved by using Botworld instead of replying to every DM yourself
              </CardDescription>
            </CardFooter>
          </CardContent>
        </Card>
      </article>
    </section>
  );
}

export default DashboardPage;
