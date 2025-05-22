"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StepFour({ botId }: { botId: string }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting...");
  const [expired, setExpired] = useState(false);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const expirationTimer = useRef<NodeJS.Timeout | null>(null);

  const startExpirationTimer = () => {
    // WhatsApp QR codes typically expire after 25 seconds
    expirationTimer.current = setTimeout(() => {
      setExpired(true);
      setStatus("QR Code Expired - Click below to refresh");
    }, 25_000); // 25 seconds
  };

  const resetExpirationTimer = () => {
    if (expirationTimer.current) {
      clearTimeout(expirationTimer.current);
    }
    setExpired(false);
  };

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL!, {
      auth: { botId },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      resetExpirationTimer();
      socket.emit("init");
    });

    socket.on("qr", (qr: string) => {
      resetExpirationTimer();
      setQrCode(qr);
      setStatus("Scan QR Code with WhatsApp Mobile");
      startExpirationTimer();
    });

    socket.on("status", (newStatus: string) => {
      resetExpirationTimer();
      setStatus(newStatus);
      if (newStatus === "connected") {
        toast.success(
          "The bot has connected successfully. Send a message on whatsapp to test it out",
        );

        router.push(`/dashboard`);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err);
      setStatus("Connection failed - Please refresh");
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    return () => {
      if (expirationTimer.current) clearTimeout(expirationTimer.current);
      socket.off("connect");
      socket.off("qr");
      socket.off("status");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [botId, router]);

  const handleReconnect = () => {
    resetExpirationTimer();
    socketRef.current?.emit("reconnect");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Connect WhatsApp</h1>

        {/* QR Code Display */}
        {qrCode ? (
          <div className="space-y-4">
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

            {expired && (
              <div className="text-red-500 font-medium animate-pulse">
                QR Code Expired - Generate a new one below
              </div>
            )}

            {/* Connection Steps */}
            <div className="text-left space-y-3 p-4 bg-muted rounded-lg">
              <h2 className="font-semibold text-lg mb-2">How to connect:</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  <span className="font-medium">Open WhatsApp:</span>
                  <span className="block pl-5 text-muted-foreground">
                    On your primary mobile device
                  </span>
                </li>
                <li>
                  <span className="font-medium">
                    {`Android: Tap `}
                    <span className="italic">⋮ (three dots)</span>
                    {` → Linked devices`}
                  </span>
                  <span className="block pl-5 text-muted-foreground">
                    iOS: Tap <span className="italic">Settings</span> → Linked
                    devices
                  </span>
                </li>
                <li>
                  <span className="font-medium">Tap </span>
                  <span className="font-medium italic">Link a device</span>
                </li>
                <li>
                  <span className="font-medium">Scan this QR code</span>
                  <span className="block pl-5 text-muted-foreground">
                    Point your phone's camera at the code
                  </span>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
          </div>
        )}

        {/* Status Message */}
        <p className="text-lg text-muted-foreground min-h-[2rem]">{status}</p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleReconnect}
            disabled={!expired && !!qrCode}
          >
            {expired ? "Generate New Code" : "Refresh Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
