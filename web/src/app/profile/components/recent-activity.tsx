import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare } from 'lucide-react';

export function RecentActivity({ messages }: { messages: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {messages.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bot</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages.map((message) => (
                                <TableRow key={message.id}>
                                    <TableCell>{message.bot?.name || 'Unknown'}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {message.contentSnippet}
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
                                    <TableCell>
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p>No recent activity</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}