'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function StepFour({ botId }: { botId: string }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState('Connecting...');
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket with auth and options
    socketRef.current = io(process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL!, {
      auth: { botId },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      socket.emit('init');
    });

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

    socket.on('connect_error', (err) => {
      console.error('Connection Error:', err);
      setStatus('Connection failed - Please refresh');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('qr');
      socket.off('status');
      socket.off('connect_error');
      socket.off('disconnect');
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
              priority
            />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
          </div>
        )}

        <p className="text-lg text-muted-foreground">{status}</p>

        <Button variant="outline" onClick={() => socketRef.current?.emit('reconnect')}>
          Reconnect
        </Button>
      </div>
    </div>
  );
}
