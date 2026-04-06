"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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

const patientFormSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    lastName: z.string().min(1, { message: "Last name is required" }),
    dob: z.string().min(1, { message: "Date of Birth is required" }),
    gender: z.string().min(1, { message: "Gender is required" }),
    phone: z
        .string()
        .min(9, { message: "Phone number must be at least 9 characters" })
        .regex(/^[0-9+\-\s()]*$/, { message: "Invalid phone number format" }),
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email address" }),
    address: z.string().min(1, { message: "Address is required" }),
    preferredLanguage: z
        .string()
        .min(1, { message: "Preferred language is required" }),
    nationality: z.string().min(1, { message: "Nationality is required" }),
    religion: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export function PatientForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            firstName: "",
            middleName: "",
            lastName: "",
            dob: "",
            gender: "",
            phone: "",
            email: "",
            address: "",
            preferredLanguage: "",
            nationality: "",
            religion: "",
            emergencyContactName: "",
            emergencyContactRelationship: "",
        },
    });

    const onSubmit = async (data: PatientFormValues) => {
        setIsSubmitting(true);
        setSuccessMessage("");

        console.log("Form Submitted Successfully:", data);
        setSuccessMessage("Patient registered successfully!");
        setIsSubmitting(false);
        reset();
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
                        Please provide the patient's basic personal details.
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
                                        <SelectItem value="Prefer not to say">
                                            Prefer not to say
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
                        <Input
                            id="religion"
                            placeholder="e.g. Buddhism, Christianity"
                            {...register("religion")}
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
                            Full Address <span className="text-red-500">*</span>
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
                        <Input
                            id="preferredLanguage"
                            placeholder="e.g. Thai, English"
                            {...register("preferredLanguage")}
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
                        <Input
                            id="emergencyContactRelationship"
                            placeholder="Spouse, Sibling, etc."
                            {...register("emergencyContactRelationship")}
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
                {successMessage && (
                    <div className="text-green-600 font-medium w-full text-right">
                        {successMessage}
                    </div>
                )}
            </div>
        </form>
    );
}
