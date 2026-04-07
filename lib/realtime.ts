import type { PatientFormValues } from "@/lib/validations";

export const PATIENT_INTAKE_CHANNEL = "patient-intake-room";
export const PATIENT_FIELD_CHANGED_EVENT = "patient-field-changed";
export const PATIENT_FIELD_BLURRED_EVENT = "patient-field-blurred";
export const PATIENT_SUBMITTED_EVENT = "patient-submitted";
export const INACTIVE_TIMEOUT_MS = 5000;

export type PatientRealtimeStatus = "typing" | "inactive" | "submitted";

export type PatientFormField = keyof PatientFormValues;

export type PatientFieldChangedPayload = {
    sessionId: string;
    field: PatientFormField;
    value: string;
    updatedAt: string;
};

export type PatientFieldBlurredPayload = {
    sessionId: string;
    field: PatientFormField;
    value: string;
    updatedAt: string;
};

export type PatientSubmittedPayload = {
    sessionId: string;
    values: PatientFormValues;
    submittedAt: string;
};

export type PatientPresencePayload = {
    sessionId: string;
    status: PatientRealtimeStatus;
    updatedAt: string;
};
