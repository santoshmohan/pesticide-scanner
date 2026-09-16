import Link from "next/link";
import BottomNav from "../components/BottomNav";

export default function ScoringMethodPage() {
    return (
        <main className="min-h-screen bg-[#f7f7f7] pb-28">
            <div className="max-w-md mx-auto px-5 pt-8">
                <Link href="/" className="inline-block mb-6 text-gray-600">
                    ← Back
                </Link>

                <h1 className="text-4xl font-bold mb-6">Scoring Method</h1>

                <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
                    <p className="text-gray-700">
                        Our scoring system evaluates pesticide products based on ingredient
                        risk data from regulatory sources and hazard databases.
                    </p>

                    <div>
                        <h2 className="font-semibold text-xl mb-3">How it works</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>All products start with a base score of <strong>100</strong></li>
                            <li>Points are deducted based on ingredient risk level</li>
                            <li>
                                <strong>High-risk</strong> ingredients (e.g., carcinogens,
                                neurotoxins): <span className="text-red-600">-30 to -35 points</span>
                            </li>
                            <li>
                                <strong>Medium-risk</strong> ingredients (e.g., moderate
                                aquatic toxicity): <span className="text-yellow-600">-15 to -20 points</span>
                            </li>
                            <li>
                                <strong>Low-risk</strong> ingredients (e.g., minimal concern):
                                <span className="text-green-600"> -5 points</span>
                            </li>
                            <li>Final score is capped at a minimum of 0</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-semibold text-xl mb-3">Score ranges</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                    ✓
                                </div>
                                <div>
                                    <p className="font-semibold text-green-700">70-100: Good</p>
                                    <p className="text-sm text-gray-600">
                                        Lower concern based on available data
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                                    !
                                </div>
                                <div>
                                    <p className="font-semibold text-yellow-700">40-69: Moderate</p>
                                    <p className="text-sm text-gray-600">
                                        Use with caution; consider alternatives
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                                    ✕
                                </div>
                                <div>
                                    <p className="font-semibold text-red-700">0-39: Bad</p>
                                    <p className="text-sm text-gray-600">
                                        High concern; seek safer alternatives
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-semibold text-xl mb-3">Data sources</h2>
                        <p className="text-sm text-gray-700">
                            This demo uses simplified hazard classifications based on:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mt-2">
                            <li>EPA Pesticide Chemical Search</li>
                            <li>EU Pesticides Database</li>
                            <li>PAN Pesticide Database</li>
                            <li>Academic toxicology literature</li>
                        </ul>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-xs text-gray-500">
                            <strong>Important:</strong> This scoring is for educational and
                            demonstration purposes only. It does not replace official product
                            labels, regulatory guidance, or professional advice. Always follow
                            manufacturer instructions and consult relevant authorities.
                        </p>
                    </div>
                </div>
            </div>

            <BottomNav />
        </main>
    );
}