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
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
                        <TableRow className="bg-gray-200">
                            <TableHead className="p-4 py-4 md:px-8">Bot</TableHead>
                            <TableHead className="p-4 py-4 md:px-8">Purpose</TableHead>
                            <TableHead className="p-4 py-4 md:px-8">Sender</TableHead>
                            <TableHead className="p-4 py-4 md:px-8">Content</TableHead>
                            <TableHead className="p-4 py-4 md:px-8">Date</TableHead>
                            <TableHead className="p-4 py-4 md:px-8">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="p-4 py-4 md:px-8"><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell className="p-4 py-4 md:px-8"><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell className="p-4 py-4 md:px-8"><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell className="p-4 py-4 md:px-8"><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell className="p-4 py-4 md:px-8"><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell className="p-4 py-4 md:px-8"><Skeleton className="h-4 w-[80px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            data?.data?.map((message: any) => (
                                <TableRow key={message.id}>
                                    <TableCell className="p-4 py-4 md:px-8 font-medium">{message.bot?.name || '-'}</TableCell>
                                    <TableCell className="p-4 py-4 md:px-8">{message.bot?.purpose || '-'}</TableCell>
                                    <TableCell className="p-4 py-4 md:px-8 capitalize">{message.sender}</TableCell>
                                    <TableCell className="p-4 py-4 md:px-8 max-w-[200px] truncate">
                                        {message.contentSnippet}
                                    </TableCell>
                                    <TableCell className="p-4 py-4 md:px-8 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="p-4 py-4 md:px-8">
                                        <Badge
                                            className={
                                                message.fallback
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : message.reply
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-gray-100 text-gray-500"
                                            }
                                        >
                                            {message.fallback ? (
                                                <span>Fallback</span>
                                            ) : message.reply ? (
                                                <span>Replied</span>
                                            ) : (
                                                <span>Received</span>
                                            )}
                                        </Badge>
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