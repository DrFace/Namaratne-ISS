import { useState } from "react";

export default function CreateSeriasModal({
    isOpen,
    onClose,
    onCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (s: any) => void;
}) {
    const [form, setForm] = useState({
        seriasNo: "",
        status: "active",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/serias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": (document.querySelector(
                        'meta[name="csrf-token"]'
                    ) as HTMLMetaElement).content,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to save Vehicle Type");
            }

            const data = await res.json();
            onCreated(data);
            onClose();
            setForm({ seriasNo: "", status: "active" });
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error saving vehicle type");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Add Vehicle Type</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Vehicle Type
                        </label>
                        <input
                            type="text"
                            name="seriasNo"
                            value={form.seriasNo}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
