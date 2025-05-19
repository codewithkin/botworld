'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
      <h1>Dashboard</h1>
    </section>
  );
}

export default DashboardPage;
