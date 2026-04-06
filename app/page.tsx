import React from "react";
import { PatientForm } from "@/components/patient/patient-form";

export default function PatientPage() {
    return (
        <main className="min-h-screen bg-neutral-50 p-4 md:p-8 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                        Patient Registration
                    </h1>
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
