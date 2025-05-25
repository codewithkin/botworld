import { Check, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/plans";

function UpgradePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Select the perfect plan for your needs. Upgrade, downgrade, or cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(plans).map(([key, plan]) => (
                    <Card
                        key={key}
                        className={`relative ${key === 'free' ? 'ring-2 ring-blue-500' : ''} ${key === 'lite' ? 'border-2 border-green-500' : ''
                            }`}
                    >
                        {key === 'lite' && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 transform rotate-12 translate-x-2 -translate-y-1">
                                POPULAR
                            </div>
                        )}
                        {key === 'business' && (
                            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 transform rotate-12 translate-x-2 -translate-y-1">
                                BEST VALUE
                            </div>
                        )}

                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl">
                                    {plan.name}
                                    {key === 'free' && (
                                        <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Your Current Plan
                                        </span>
                                    )}
                                </CardTitle>
                                {plan.badge && (
                                    <Badge variant="secondary" className="text-xs">
                                        {plan.badge}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm">{plan.description}</p>
                        </CardHeader>

                        <CardContent>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-muted-foreground">/{plan.price === 0 ? 'forever' : 'month'}</span>
                            </div>

                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            {key === 'free' ? (
                                <Button className="w-full" variant="outline" disabled>
                                    {plan.buttonText}
                                </Button>
                            ) : (
                                <Link target="_blank" href={plan.url} className="w-full">
                                    <Button className={`w-full ${plan.buttonColor} ${plan.buttonTextColor} ${plan.buttonHoverColor} ${plan.buttonHoverTextColor} ${plan.buttonBorderColor} ${plan.buttonBorderWidth} ${plan.buttonBorderRadius}`}>
                                        {plan.buttonText}
                                    </Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="border-b pb-4">
                        <h3 className="font-medium">Can I change plans later?</h3>
                        <p className="text-muted-foreground text-sm">Yes, you can upgrade or downgrade at any time.</p>
                    </div>
                    <div className="border-b pb-4">
                        <h3 className="font-medium">What payment methods do you accept?</h3>
                        <p className="text-muted-foreground text-sm">We accept all major credit cards and PayPal.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpgradePage