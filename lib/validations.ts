import * as z from "zod";

export const patientFormSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    lastName: z.string().min(1, { message: "Last name is required" }),
    dob: z.string().min(1, { message: "Date of Birth is required" }),
    gender: z.string().min(1, { message: "Gender is required" }),
    nationality: z.string().min(1, { message: "Nationality is required" }),
    religion: z.string().optional(),
    phone: z
        .string()
        .min(9, { message: "Phone number must be at least 9 characters" })
        .max(15, { message: "Phone number must be at most 15 characters" })
        .regex(/^[0-9+\-\s()]*$/, {
            message: "Invalid phone number format",
        }),
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email address" }),
    address: z.string().min(1, { message: "Address is required" }),
    preferredLanguage: z
        .string()
        .min(1, { message: "Preferred language is required" }),
    emergencyContactName: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const patientFormDefaultValues: PatientFormValues = {
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    nationality: "",
    religion: "",
    phone: "",
    email: "",
    address: "",
    preferredLanguage: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
};
