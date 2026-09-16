"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { supabase } from "../../lib/supabase";



function ReportIssueForm() {
    const searchParams = useSearchParams();
    const barcode = searchParams.get("barcode") || "";
    const productName = searchParams.get("name") || "";

    const [formData, setFormData] = useState({
        barcode,
        productName,
        issueType: "",
        description: "",
        email: "",
    });

    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.from("issues").insert({
            barcode: formData.barcode,
            product_name: formData.productName,
            issue_type: formData.issueType,
            description: formData.description,
            email: formData.email || null,
        });

        if (error) {
            console.error("Error saving issue:", error);
            alert("Failed to submit report. Please try again.");
            return;
        }

        console.log("Issue saved to database");
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <main className="min-h-screen bg-[#f7f7f7] pb-28 flex items-center justify-center px-5">
                <div className="bg-white rounded-3xl p-8 shadow-sm text-center max-w-md">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-8 h-8 text-green-600"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
                    <p className="text-gray-600 mb-6">
                        Your report has been submitted. We'll review it and update our
                        database if needed.
                    </p>

                    <Link
                        href="/"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-full font-semibold"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f7f7] pb-28">
            <div className="max-w-md mx-auto px-5 pt-8">
                <Link href="/" className="inline-block mb-6 text-gray-600">
                    ← Back
                </Link>

                <h1 className="text-4xl font-bold mb-2">Report an Issue</h1>
                <p className="text-gray-600 mb-6">
                    Help us improve our database by reporting incorrect or missing
                    information.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
                        {/* Product info (read-only if passed) */}
                        {productName && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    disabled
                                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-700"
                                />
                            </div>
                        )}

                        {barcode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Barcode
                                </label>
                                <input
                                    type="text"
                                    value={barcode}
                                    disabled
                                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-mono"
                                />
                            </div>
                        )}

                        {/* Issue type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue type <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.issueType}
                                onChange={(e) =>
                                    setFormData({ ...formData, issueType: e.target.value })
                                }
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select an issue type</option>
                                <option value="incorrect-info">Incorrect product information</option>
                                <option value="missing-ingredient">Missing ingredient</option>
                                <option value="wrong-score">Score seems wrong</option>
                                <option value="product-not-found">Product not found</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Please describe the issue in detail..."
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Email (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your email (optional)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="your@email.com"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                We may contact you if we need more information.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-4 rounded-full font-semibold"
                    >
                        Submit Report
                    </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                    For urgent safety concerns, please contact your local regulatory
                    authority or poison control center.
                </p>
            </div>

            <BottomNav />
        </main>
    );
}

export default function ReportIssuePage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-[#f7f7f7]" />}>
            <ReportIssueForm />
        </Suspense>
    );
}