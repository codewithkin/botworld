// components/messages/MessagesTable.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Message } from "@/generated/prisma";

export function MessagesTable() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['messages', page],
        queryFn: async () => {
            const res = await axios.get('/api/messages', {
                params: {
                    page,
                    pageSize
                }
            });
            return res.data;
        },
    });

    if (isError) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
                Failed to load messages. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bot</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Sender</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            data?.data?.map((message: any) => (
                                <TableRow key={message.id}>
                                    <TableCell className="font-medium">{message.bot?.name || '-'}</TableCell>
                                    <TableCell>{message.bot?.purpose || '-'}</TableCell>
                                    <TableCell className="capitalize">{message.sender}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {message.contentSnippet}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        {message.fallback ? (
                                            <span className="text-yellow-600">Fallback</span>
                                        ) : message.reply ? (
                                            <span className="text-green-600">Replied</span>
                                        ) : (
                                            <span className="text-gray-500">Received</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing page {page} of {data?.pagination?.totalPages || 1}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={
                                page === data?.pagination?.totalPages ||
                                isLoading ||
                                !data?.pagination?.hasNextPage
                            }
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}