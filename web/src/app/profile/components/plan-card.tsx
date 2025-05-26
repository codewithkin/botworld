import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { plans } from '@/lib/plans';
import { PlanBadge } from './plan-badge';

export function PlanCard({ plan }: { plan: string }) {
    const currentPlan = plans[plan as keyof typeof plans] || plans.free;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Your Plan</span>
                    <PlanBadge plan={plan} />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Current Plan</p>
                        <p>{currentPlan.name}</p>
                    </div>
                </div>
                <Button className="w-full" asChild>
                    <a href="/upgrade">Manage Subscription</a>
                </Button>
            </CardContent>
        </Card>
    );
}