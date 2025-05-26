import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail } from 'lucide-react';

export function UserProfileCard({ user }: { user: any }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button variant="outline">Edit</Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{user?.name || 'Not provided'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{user?.email}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Email Verified</p>
                        <p>{user?.emailVerified ? 'Verified' : 'Not verified'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}