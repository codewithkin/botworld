import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FileText, MessageSquare, Clock } from 'lucide-react';

export function UsageStats({
    botCount,
    documentCount,
    messageCount
}: {
    botCount: number;
    documentCount: number;
    messageCount: number;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={<Bot className="h-6 w-6" />}
                        title="Bots"
                        value={botCount}
                    />
                    <StatCard
                        icon={<FileText className="h-6 w-6" />}
                        title="Documents"
                        value={documentCount}
                    />
                    <StatCard
                        icon={<MessageSquare className="h-6 w-6" />}
                        title="Messages"
                        value={messageCount}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
    return (
        <div className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="rounded-full bg-muted p-3">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold">{value}</p>
            </div>
        </div>
    );
}