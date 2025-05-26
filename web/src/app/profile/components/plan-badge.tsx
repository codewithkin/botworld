import { plans } from '@/lib/plans';
import { cn } from '@/lib/utils';

export function PlanBadge({ plan }: { plan: string }) {
    const currentPlan = plans[plan as keyof typeof plans] || plans.free;

    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            plan === 'free' ? 'bg-gray-100 text-gray-800' : '',
            plan === 'lite' ? 'bg-green-100 text-green-800' : '',
            plan === 'business' ? 'bg-purple-100 text-purple-800' : '',
            plan === 'unlimited' ? 'bg-amber-100 text-amber-800' : ''
        )}>
            {currentPlan.name}
        </span>
    );
}