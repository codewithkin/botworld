'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Clock, FileText, MessageSquare, CreditCard, User, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { UserProfileCard } from './components/user-profile-card';
import { PlanCard } from './components/plan-card';
import { UsageStats } from './components/usage-stats';
import { RecentBots } from './components/recent-bots';
import { RecentActivity } from './components/recent-activity';

export default function ProfilePage() {
    const { data: session } = authClient.useSession();
    const userId = session?.user?.id;

    const { data: userData, isLoading } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: async () => {
            const res = await axios.get(`/api/user/${userId}`);
            return res.data;
        },
        enabled: !!userId
    });

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* User Info Column */}
                <div className="space-y-6">
                    <UserProfileCard user={userData} />
                    <PlanCard plan={userData?.plan} />
                    {/* <PaymentMethodCard /> */}
                </div>

                {/* Stats Column */}
                <div className="md:col-span-2 space-y-6">
                    <UsageStats
                        botCount={userData?._count?.bots || 0}
                        documentCount={userData?._count?.documents || 0}
                        messageCount={userData?._count?.messages || 0}
                    />
                    <RecentBots bots={userData?.bots || []} />
                    <RecentActivity messages={userData?.recentMessages || []} />
                </div>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/3" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}