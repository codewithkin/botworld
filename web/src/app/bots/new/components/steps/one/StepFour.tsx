'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const socket = io(process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL!, {
  autoConnect: false,
  withCredentials: true,
});

export default function StepFour({ botId }: { botId: string }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState('Connecting...');
  const router = useRouter();

  console.log('Bot ID: ', botId);

  useEffect(() => {
    socket.auth = { botId };
    socket.connect();

    socket.on('qr', (qr: string) => {
      setQrCode(qr);
      setStatus('Scan QR Code with WhatsApp Mobile');
    });

    socket.on('status', (newStatus: string) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        router.push(`/bots/${botId}/dashboard`);
      }
    });

    return () => {
      socket.off('qr');
      socket.off('status');
      socket.disconnect();
    };
  }, [botId, router]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Connect WhatsApp</h1>

        {qrCode ? (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <Image
              src={qrCode}
              width={400}
              height={400}
              alt="WhatsApp QR Code"
              className="mx-auto"
            />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
          </div>
        )}

        <p className="text-lg text-muted-foreground">{status}</p>

        <Button variant="outline" onClick={() => socket.emit('reconnect')}>
          Reconnect
        </Button>
      </div>
    </div>
  );
}
