"use client";

import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function StaffPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-neutral-50 p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                            Staff Realtime Dashboard
                        </h1>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.push("/");
                            }}
                        >
                            View Patient Intake Form
                        </Button>
                    </div>
                    <p className="text-neutral-500">
                        Monitor patient typing activity and form progress in
                        real-time.
                    </p>
                </div>
                <StaffDashboard />
            </div>
        </main>
    );
}
