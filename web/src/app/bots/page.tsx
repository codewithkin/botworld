"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Bot, Message, Document } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "./components/icons";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import NewBotFAB from "@/components/shared/NewBotFAB";
import { plans } from "@/lib/plans/limitations";

type BotWithRelations = Bot & {
    documents: Document[];
    messages: Message[];
};

function BotsPage() {
    const { data: bots, isLoading } = useQuery({
        queryKey: ["bots"],
        queryFn: async (): Promise<BotWithRelations[]> => {
            const { data } = await axios.get("/api/bots");
            return data.bots;
        },
    });

    console.log("Bots: ", bots);

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await axios.get("/api/user");
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-[400px] rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!bots || bots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                <Icons.bot className="h-24 w-24 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                    No AI Assistants Found
                </h2>
                <p className="text-muted-foreground mb-6">
                    Start by creating your first AI assistant to automate conversations
                </p>
                <Button asChild>
                    <Link href="/bots/new">Create First Bot</Link>
                </Button>
                <NewBotFAB />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Your AI Assistants</h1>
                    {user && (
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                                {bots.length}/{plans[user.plan as keyof typeof plans].bots} Bots Used
                            </Badge>
                            <Badge variant="outline">
                                {bots.reduce((acc, bot) => acc + bot.documents.length, 0)} Documents
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto">
                        <Icons.filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto">
                        <Icons.search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </div>
            </div>

            {/* Bots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                    <Card key={bot.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                                    {bot.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{bot.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {bot.purpose}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {bot.messages.some(
                                    (m) =>
                                        new Date(m.createdAt).getTime() >
                                        Date.now() - 24 * 60 * 60 * 1000
                                ) ? (
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                ) : (
                                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                )}
                            </div>
                        </div>

                        {/* Channel Connections */}
                        <div className="flex gap-2 my-4">
                            {bot.whatsapp_number && (
                                <Badge variant="secondary" className="gap-1">
                                    <Icons.whatsapp className="h-3 w-3 text-green-600" />
                                    WhatsApp
                                </Badge>
                            )}
                            {bot.telegram_username && (
                                <Badge variant="secondary" className="gap-1">
                                    <Icons.telegram className="h-3 w-3 text-blue-500" />
                                    Telegram
                                </Badge>
                            )}
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-4 my-4">
                            <StatBadge
                                icon={<Icons.file className="h-3 w-3" />}
                                label="Documents"
                                value={bot.documents.length}
                            />
                            <StatBadge
                                icon={<Icons.message className="h-3 w-3" />}
                                label="Messages"
                                value={bot.messages.length}
                            />
                            <StatBadge
                                icon={<Icons.clock className="h-3 w-3" />}
                                label="Last Active"
                                value={
                                    bot.messages.length > 0
                                        ? formatDistanceToNow(
                                            new Date(
                                                bot.messages.reduce((latest, message) =>
                                                    new Date(message.createdAt) > new Date(latest.createdAt)
                                                        ? message
                                                        : latest
                                                ).createdAt
                                            ),
                                            { addSuffix: true }
                                        )
                                        : "Never"
                                }
                            />
                            <StatBadge
                                icon={<Icons.calendar className="h-3 w-3" />}
                                label="Created"
                                value={formatDistanceToNow(new Date(bot.createdAt), {
                                    addSuffix: true,
                                })}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-6">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                <Link href={`/bots/${bot.id}/analytics`}>Analytics</Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Icons.moreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {/* <DropdownMenuItem>
                                        <Icons.edit className="mr-2 h-4 w-4" />
                                        Edit Config
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Icons.history className="mr-2 h-4 w-4" />
                                        Chat History
                                    </DropdownMenuItem> */}
                                    <DropdownMenuItem className="text-red-600">
                                        <Icons.trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>
                ))}
            </div>

            <NewBotFAB />
        </div>
    );
}

function StatBadge({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{icon}</span>
            <span className="font-medium">{label}:</span>
            <span className="ml-auto font-semibold">{value}</span>
        </div>
    );
}

export default BotsPage;