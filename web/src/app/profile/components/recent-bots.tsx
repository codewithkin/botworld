import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export function RecentBots({ bots }: { bots: any[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bots</CardTitle>
                <Button variant="ghost" asChild>
                    <Link href="/bots">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {bots.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bots.map((bot) => (
                                <TableRow key={bot.id}>
                                    <TableCell>
                                        <Link href={`/bots/${bot.id}`} className="font-medium hover:underline">
                                            {bot.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{bot.purpose}</TableCell>
                                    <TableCell>
                                        {new Date(bot.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bot className="h-8 w-8" />
                        <p>No bots created yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}