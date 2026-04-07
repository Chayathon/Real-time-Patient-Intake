import React from "react";
import { StaffDashboard } from "@/components/staff/staff-dashboard";

export default function StaffPage() {
    return (
        <main className="min-h-screen bg-neutral-50 p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Staff Realtime Dashboard
                    </h1>
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
