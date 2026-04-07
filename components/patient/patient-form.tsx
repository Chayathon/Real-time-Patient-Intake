"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    INACTIVE_TIMEOUT_MS,
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
    patientFormSchema,
    type PatientFormValues,
} from "@/lib/validations";
import { supabase } from "@/utils/supabase/client";

const createPatientSessionId = () => `patient-${crypto.randomUUID()}`;

export function PatientForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRealtimeReady, setIsRealtimeReady] = useState(false);
    const [sessionId] = useState(createPatientSessionId);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const isResettingRef = useRef(false);
    const lastTrackedPresenceStatusRef = useRef<PatientRealtimeStatus | null>(
        null,
    );

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm<PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: patientFormDefaultValues,
    });

    const updatePresenceStatus = useCallback(
        async (status: PatientRealtimeStatus) => {
            const channel = channelRef.current;
            if (!channel || !isRealtimeReady) {
                return;
            }

            if (lastTrackedPresenceStatusRef.current === status) {
                return;
            }

            const presencePayload: PatientPresencePayload = {
                sessionId,
                status,
                updatedAt: new Date().toISOString(),
            };

            const result = await channel.track(presencePayload);

            if (result === "ok") {
                lastTrackedPresenceStatusRef.current = status;
            }
        },
        [isRealtimeReady, sessionId],
    );

    const sendFieldChange = useCallback(
        async (payload: PatientFieldChangedPayload) => {
            const channel = channelRef.current;
            if (!channel || !isRealtimeReady) {
                return;
            }

            await channel.send({
                type: "broadcast",
                event: PATIENT_FIELD_CHANGED_EVENT,
                payload,
            });
        },
        [isRealtimeReady],
    );

    const sendSubmitted = async (payload: PatientSubmittedPayload) => {
        const channel = channelRef.current;
        if (!channel || !isRealtimeReady) {
            return;
        }

        await channel.send({
            type: "broadcast",
            event: PATIENT_SUBMITTED_EVENT,
            payload,
        });
    };

    const clearInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    }, []);

    const scheduleInactivePresence = useCallback(() => {
        clearInactivityTimer();
        inactivityTimerRef.current = setTimeout(() => {
            void updatePresenceStatus("inactive");
        }, INACTIVE_TIMEOUT_MS);
    }, [clearInactivityTimer, updatePresenceStatus]);

    useEffect(() => {
        const channel = supabase.channel(PATIENT_INTAKE_CHANNEL, {
            config: {
                presence: { key: sessionId },
            },
        });

        channelRef.current = channel;

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                setIsRealtimeReady(true);
                const initialPresence: PatientPresencePayload = {
                    sessionId,
                    status: "inactive",
                    updatedAt: new Date().toISOString(),
                };

                void channel.track(initialPresence).then((result) => {
                    if (result === "ok") {
                        lastTrackedPresenceStatusRef.current = "inactive";
                        return;
                    }
                });

                console.log("Patient connected to Realtime");
                return;
            }

            if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT" ||
                status === "CLOSED"
            ) {
                setIsRealtimeReady(false);
            }
        });

        return () => {
            setIsRealtimeReady(false);
            clearInactivityTimer();
            lastTrackedPresenceStatusRef.current = null;
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [clearInactivityTimer, sessionId]);

    useEffect(() => {
        const subscription = watch((values, context) => {
            if (
                !context.name ||
                context.type !== "change" ||
                isResettingRef.current
            ) {
                return;
            }

            const field = context.name as PatientFormField;
            const payload: PatientFieldChangedPayload = {
                sessionId,
                field,
                value: String(values[field]),
                updatedAt: new Date().toISOString(),
            };

            void sendFieldChange(payload);
            void updatePresenceStatus("typing");
            scheduleInactivePresence();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [
        scheduleInactivePresence,
        sendFieldChange,
        sessionId,
        updatePresenceStatus,
        watch,
    ]);

    const onSubmit = async (data: PatientFormValues) => {
        setIsSubmitting(true);

        try {
            const payload: PatientSubmittedPayload = {
                sessionId,
                values: data,
                submittedAt: new Date().toISOString(),
            };

            await sendSubmitted(payload);
            await updatePresenceStatus("submitted");
            clearInactivityTimer();

            console.log("Form Submitted Successfully:", data);
            toast.success("Patient registered successfully!");

            isResettingRef.current = true;
            reset(patientFormDefaultValues);
        } catch (error) {
            console.error("Failed to submit patient form:", error);
            toast.error("Unable to submit patient form. Please try again.");
        } finally {
            isResettingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 w-full max-w-5xl mx-auto"
        >
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Please provide the patient&apos;s basic personal
                        details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="firstName"
                            placeholder="John"
                            {...register("firstName")}
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-500">
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="middleName">
                            Middle Name (Optional)
                        </Label>
                        <Input
                            id="middleName"
                            placeholder="M."
                            {...register("middleName")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            placeholder="Doe"
                            {...register("lastName")}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-500">
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dob">
                            Date of Birth{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input id="dob" type="date" {...register("dob")} />
                        {errors.dob && (
                            <p className="text-sm text-red-500">
                                {errors.dob.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        id="gender"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.gender && (
                            <p className="text-sm text-red-500">
                                {errors.gender.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nationality">
                            Nationality <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nationality"
                            placeholder="e.g. Thai, American"
                            {...register("nationality")}
                        />
                        {errors.nationality && (
                            <p className="text-sm text-red-500">
                                {errors.nationality.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="religion">Religion (Optional)</Label>
                        <Controller
                            name="religion"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        id="religion"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select religion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Buddhism">
                                            Buddhism
                                        </SelectItem>
                                        <SelectItem value="Christianity">
                                            Christianity
                                        </SelectItem>
                                        <SelectItem value="Islam">
                                            Islam
                                        </SelectItem>
                                        <SelectItem value="Hinduism">
                                            Hinduism
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                    <CardDescription>
                        How can we reach the patient?
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+66 81 234 5678"
                            {...register("phone")}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-500">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">
                            Address <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="address"
                            placeholder="123 Example Street..."
                            {...register("address")}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">
                                {errors.address.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferredLanguage">
                            Preferred Language{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="preferredLanguage"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        id="preferredLanguage"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Thai">
                                            Thai
                                        </SelectItem>
                                        <SelectItem value="English">
                                            English
                                        </SelectItem>
                                        <SelectItem value="Chinese">
                                            Chinese
                                        </SelectItem>
                                        <SelectItem value="Japanese">
                                            Japanese
                                        </SelectItem>
                                        <SelectItem value="Korean">
                                            Korean
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.preferredLanguage && (
                            <p className="text-sm text-red-500">
                                {errors.preferredLanguage.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>
                        Who should we contact in case of an emergency?
                        (Optional)
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">
                            Contact Name
                        </Label>
                        <Input
                            id="emergencyContactName"
                            placeholder="Jane Doe"
                            {...register("emergencyContactName")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactRelationship">
                            Relationship
                        </Label>
                        <Controller
                            name="emergencyContactRelationship"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        id="emergencyContactRelationship"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Spouse">
                                            Spouse
                                        </SelectItem>
                                        <SelectItem value="Parent">
                                            Parent
                                        </SelectItem>
                                        <SelectItem value="Child">
                                            Child
                                        </SelectItem>
                                        <SelectItem value="Sibling">
                                            Sibling
                                        </SelectItem>
                                        <SelectItem value="Relative">
                                            Relative
                                        </SelectItem>
                                        <SelectItem value="Friend">
                                            Friend
                                        </SelectItem>
                                        <SelectItem value="Caregiver">
                                            Caregiver
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="w-full flex flex-col items-end gap-4">
                <Button
                    disabled={isSubmitting}
                    size="lg"
                    type="submit"
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? "Submitting..." : "Register Patient"}
                </Button>
            </div>
        </form>
    );
}
