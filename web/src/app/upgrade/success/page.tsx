"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect } from 'react';

// Extracted the search params logic to a separate component
function UpgradeSuccessContent() {
    const router = useRouter();
    const { mutate, isPending, isError, isSuccess } = useMutation({
        mutationFn: upgradePlan,
        onSuccess: () => {
            // You might want to update user context here
        },
        onError: (error) => {
            console.error('Upgrade error:', error);
        },
    });

    // This will be rendered on the client side after hydration
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
            <div className="max-w-md w-full text-center">
                {isPending && (
                    <>
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Processing Your Upgrade</h1>
                        <p className="text-muted-foreground">
                            We're upgrading your account. Please wait...
                        </p>
                    </>
                )}

                {isError && (
                    <>
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Upgrade Failed</h1>
                        <p className="text-muted-foreground mb-6">
                            Something went wrong while processing your upgrade. Please try again.
                        </p>
                        <Button onClick={() => router.push('/upgrade')}>
                            Back to Plans
                        </Button>
                    </>
                )}

                {isSuccess && (
                    <>
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Upgrade Successful!</h1>
                        <p className="text-muted-foreground mb-6">
                            Your account has been successfully upgraded.
                            You can now enjoy all the premium features.
                        </p>
                        <Button onClick={() => router.push('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

// Moved the mutation function outside the component
async function upgradePlan({ plan, userId }: { plan: string; userId: string }) {
    const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to upgrade plan');
    }

    return response.json();
}

// Main page component with Suspense boundary
export default function UpgradeSuccessPage() {
    const userId = "user123"; // You'd typically get this from your auth context

    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading upgrade details...</p>
            </div>
        }>
            <PlanUpgradeHandler userId={userId} />
        </Suspense>
    );
}

// Component that handles the search params and initiates the upgrade
function PlanUpgradeHandler({ userId }: { userId: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    const { mutate } = useMutation({
        mutationFn: upgradePlan,
        onError: (error) => {
            console.error('Upgrade error:', error);
        },
    });

    useEffect(() => {
        if (plan) {
            mutate({ plan, userId });
        } else {
            router.push('/upgrade');
        }
    }, [plan, mutate, router]);

    return <UpgradeSuccessContent />;
}