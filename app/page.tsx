"use client";

import { PatientForm } from "@/components/patient/patient-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PatientPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-neutral-50 p-4 md:p-8 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                            Patient Registration
                        </h1>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.push("/staff");
                            }}
                        >
                            View Staff Dashboard
                        </Button>
                    </div>
                    <p className="text-neutral-500">
                        Please fill out the form below to register a new patient
                        into the system.
                    </p>
                </div>
                <PatientForm />
            </div>
        </main>
    );
}
