'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Verified, X, Building2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function UserProfileCard({ user }: { user: any }) {
    const [name, setName] = useState(user?.name || '');

    const { mutate: updateName, isPending } = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/user/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error('Failed to update name');
            return res.json();
        },
        onSuccess: () => toast.success('Name updated successfully'),
        onError: () => toast.error('Failed to update name'),
    });

    return (
        <Card>
            <CardHeader />
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={user?.image} alt={user?.name} />
                        <AvatarFallback>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-2">
                        <p className="text-xl font-semibold">
                            {user?.name || 'Not provided'}
                        </p>
                        {user?.emailVerified ? (
                            <Verified className="h-6 w-6 fill-green-500 text-white" />
                        ) : (
                            <X className="h-5 w-5 text-destructive" />
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>

                {/* Editable Section */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Button
                            onClick={() => updateName()}
                            disabled={isPending || name === user?.name}
                            className="mt-2"
                        >
                            {isPending ? 'Updating...' : 'Update Name'}
                        </Button>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">
                            Email{' '}
                            <Badge variant="secondary" className="ml-2">
                                Coming soon
                            </Badge>
                        </Label>
                        <Input id="email" value={user?.email} disabled />
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="pt-6 border-t space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">
                        More fields (Coming soon)
                    </p>

                    <div className="space-y-1">
                        <Label htmlFor="username">
                            Username{' '}
                            <Badge variant="secondary" className="ml-2">
                                Coming soon
                            </Badge>
                        </Label>
                        <Input id="username" value={user?.username || ''} disabled />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="company" className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>Company Name</span>
                            <Badge variant="secondary" className="ml-2">
                                Coming soon
                            </Badge>
                        </Label>
                        <Input id="company" value={user?.company || ''} disabled />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="industry">Line of Business</Label>
                        <Input id="industry" value={user?.industry || ''} disabled />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="customers">Number of Customers</Label>
                        <Input
                            id="customers"
                            value={user?.customerCount?.toString() || ''}
                            disabled
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
