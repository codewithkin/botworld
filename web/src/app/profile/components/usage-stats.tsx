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
                        containerClass="bg-primary/10 text-primary"
                        iconClass="bg-primary/20 text-primary"
                    />
                    <StatCard
                        icon={<FileText className="h-6 w-6" />}
                        title="Documents"
                        value={documentCount}
                        containerClass="bg-secondary text-secondary-foreground"
                        iconClass="bg-secondary/70 text-secondary-foreground"
                    />
                    <StatCard
                        icon={<MessageSquare className="h-6 w-6" />}
                        title="Messages"
                        value={messageCount}
                        containerClass="bg-orange-100 text-orange-600"
                        iconClass="bg-orange-200 text-orange-600"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function StatCard({
    icon,
    title,
    value,
    containerClass,
    iconClass
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
    containerClass: string;
    iconClass: string;
}) {
    return (
        <div className={`flex items-center space-x-4 rounded-lg p-4 ${containerClass}`}>
            <div className={`rounded-full p-3 ${iconClass}`}>{icon}</div>
            <div>
                <p className="text-sm">{title}</p>
                <p className="text-2xl font-semibold">{value}</p>
            </div>
        </div>
    );
}