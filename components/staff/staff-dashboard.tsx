"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    PATIENT_FIELD_CHANGED_EVENT,
    PATIENT_INTAKE_CHANNEL,
    PATIENT_SUBMITTED_EVENT,
    type PatientFieldChangedPayload,
    type PatientFormField,
    type PatientPresencePayload,
    type PatientRealtimeStatus,
    type PatientSubmittedPayload,
} from "@/lib/realtime";
import {
    patientFormDefaultValues,
    type PatientFormValues,
} from "@/lib/validations";
import { supabase } from "@/utils/supabase/client";

const fieldLabels: Record<PatientFormField, string> = {
    firstName: "First Name",
    middleName: "Middle Name",
    lastName: "Last Name",
    dob: "Date of Birth",
    gender: "Gender",
    phone: "Phone Number",
    email: "Email",
    address: "Address",
    preferredLanguage: "Preferred Language",
    nationality: "Nationality",
    religion: "Religion",
    emergencyContactName: "Emergency Contact Name",
    emergencyContactRelationship: "Emergency Contact Relationship",
};

type PatientFormCategory = {
    title: string;
    description: string;
    fields: PatientFormField[];
    gridClassName: string;
};

const patientFormCategories: PatientFormCategory[] = [
    {
        title: "Personal Information",
        description: "Basic details about the patient.",
        fields: [
            "firstName",
            "middleName",
            "lastName",
            "dob",
            "gender",
            "nationality",
            "religion",
        ],
        gridClassName: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    },
    {
        title: "Contact Details",
        description: "How staff can reach the patient.",
        fields: ["phone", "email", "address", "preferredLanguage"],
        gridClassName: "grid-cols-1 md:grid-cols-2",
    },
    {
        title: "Emergency Contact",
        description: "Emergency contact information provided by the patient.",
        fields: ["emergencyContactName", "emergencyContactRelationship"],
        gridClassName: "grid-cols-1 md:grid-cols-2",
    },
];

const statusStyleMap: Record<PatientRealtimeStatus, string> = {
    typing: "border-emerald-200 bg-emerald-50 text-emerald-700",
    inactive: "border-amber-200 bg-amber-50 text-amber-700",
    submitted: "border-sky-200 bg-sky-50 text-sky-700",
};

const formatTime = (timestamp: string | null) => {
    if (!timestamp) {
        return "No activity yet";
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return "No activity yet";
    }

    return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export function StaffDashboard() {
    const [draftValues, setDraftValues] = useState<PatientFormValues>(
        patientFormDefaultValues,
    );
    const [status, setStatus] = useState<PatientRealtimeStatus>("inactive");
    const [isPatientOnline, setIsPatientOnline] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
    const [lastChangedField, setLastChangedField] =
        useState<PatientFormField | null>(null);

    const syncPatientPresence = useCallback((channel: RealtimeChannel) => {
        const allPresence = Object.values(
            channel.presenceState<PatientPresencePayload>(),
        ).flat();

        const latest = allPresence.reduce<PatientPresencePayload | null>(
            (a, b) =>
                !a || new Date(b.updatedAt) > new Date(a.updatedAt) ? b : a,
            null,
        );

        setIsPatientOnline(!!latest);
        setStatus(latest?.status ?? "inactive");
        setLastUpdatedAt(latest?.updatedAt ?? new Date().toISOString());
    }, []);

    useEffect(() => {
        const channel = supabase.channel(PATIENT_INTAKE_CHANNEL);

        channel
            .on(
                "broadcast",
                { event: PATIENT_FIELD_CHANGED_EVENT },
                ({ payload }) => {
                    const data = payload as Partial<PatientFieldChangedPayload>;
                    const field = data.field;

                    if (!field) {
                        return;
                    }

                    setDraftValues((current) => ({
                        ...current,
                        [field]: data.value,
                    }));

                    setLastChangedField(field);
                    setStatus("typing");

                    const updatedAt =
                        data.updatedAt || new Date().toISOString();

                    setLastUpdatedAt(updatedAt);
                    setIsPatientOnline(true);
                },
            )
            .on(
                "broadcast",
                { event: PATIENT_SUBMITTED_EVENT },
                ({ payload }) => {
                    const data = payload as PatientSubmittedPayload;
                    const submittedAt =
                        data.submittedAt || new Date().toISOString();

                    setDraftValues(data.values);
                    setStatus("submitted");
                    setLastUpdatedAt(submittedAt);
                    setLastSubmittedAt(submittedAt);
                    setLastChangedField(null);
                    setIsPatientOnline(true);
                },
            )
            .on("presence", { event: "sync" }, () => {
                syncPatientPresence(channel);
            })
            .on("presence", { event: "join" }, () => {
                syncPatientPresence(channel);
            })
            .on("presence", { event: "leave" }, () => {
                syncPatientPresence(channel);
            });

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                syncPatientPresence(channel);
                return;
            }
        });

        return () => {
            setIsPatientOnline(false);
            supabase.removeChannel(channel);
        };
    }, [syncPatientPresence]);

    const statusLabel =
        status === "submitted"
            ? "Submitted"
            : status === "typing"
              ? "Typing"
              : "Inactive";

    return (
        <section className="space-y-4 md:space-y-6">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle>Live Intake Monitor</CardTitle>
                    <CardDescription>
                        Staff sees patient input instantly before submit using
                        Supabase Broadcast and Presence.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                "font-medium",
                                isPatientOnline
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-neutral-200 bg-neutral-50 text-neutral-600",
                            )}
                        >
                            {isPatientOnline
                                ? "Patient Online"
                                : "Patient Offline"}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                "font-medium",
                                statusStyleMap[status],
                            )}
                        >
                            {statusLabel}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-md border border-neutral-200 p-3">
                            <p className="text-xs text-neutral-500 mb-1">
                                Last Activity
                            </p>
                            <p className="font-medium text-neutral-900">
                                {formatTime(lastUpdatedAt)}
                            </p>
                        </div>
                        <div className="rounded-md border border-neutral-200 p-3">
                            <p className="text-xs text-neutral-500 mb-1">
                                Last Changed Field
                            </p>
                            <p className="font-medium text-neutral-900">
                                {lastChangedField
                                    ? fieldLabels[lastChangedField]
                                    : "No field changed yet"}
                            </p>
                        </div>
                        <div className="rounded-md border border-neutral-200 p-3">
                            <p className="text-xs text-neutral-500 mb-1">
                                Submitted At
                            </p>
                            <p className="font-medium text-neutral-900">
                                {formatTime(lastSubmittedAt)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 md:space-y-6">
                {patientFormCategories.map((category) => (
                    <Card key={category.title} className="shadow-xl">
                        <CardHeader>
                            <CardTitle>{category.title}</CardTitle>
                            <CardDescription>
                                {category.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={cn(
                                    "grid gap-3",
                                    category.gridClassName,
                                )}
                            >
                                {category.fields.map((field) => {
                                    const value = draftValues[field];
                                    const isRecentlyChanged =
                                        lastChangedField === field;

                                    return (
                                        <div
                                            key={field}
                                            className={cn(
                                                "rounded-md border border-neutral-200 p-3 transition-colors",
                                                isRecentlyChanged &&
                                                    status === "typing" &&
                                                    "border-emerald-300 bg-emerald-50/50",
                                            )}
                                        >
                                            <p className="text-xs text-neutral-500 mb-1">
                                                {fieldLabels[field]}
                                            </p>
                                            <p className="text-sm font-medium text-neutral-900 break-words min-h-5">
                                                {value || "-"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
