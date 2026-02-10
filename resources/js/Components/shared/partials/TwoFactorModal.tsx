import React, { useState } from "react";
import InputError from "@/Components/elements/inputs/InputError";
import InputLabel from "@/Components/elements/inputs/InputLabel";
import TextInput from "@/Components/elements/inputs/TextInput";
import Modal from "@/Components/elements/other/Modal";
import { useForm } from "@inertiajs/react";

interface TwoFactorModalProps {
    user: {
        email?: string;
    };
    show: boolean;
    onClose: () => void;
}

export default function TwoFactorModal({ user, show, onClose }: TwoFactorModalProps) {
    const [otpSent, setOtpSent] = useState(false);
    const [enableTwoFactor, setEnableTwoFactor] = useState(true);
    const [errors, setErrors] = useState<{ otp?: string }>({});
    const { data, setData, post, reset } = useForm({
        otp: '',
        email: user.email || '',
    });

    const sendOtp = () => {
        post(route('profile.sendOtpCode', { type: 'two_factor_enable' }), {
            onSuccess: () => {
                setOtpSent(true);
            },
            onError: (errorData: any) => {
                setErrors(errorData);
            }
        });
    };


    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.otp === "") {
            return;
        }
        post(route('profile.updateTwoFactorInfo'), {
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {

            }
        });
    };

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <div className="flex justify-between">
                    <h2 className="flex justify-center text-xl font-bold">
                        Two-factor authentication
                    </h2>
                    <button
                        type='button'
                        className="text-lg text-gray-500 hover:text-black" onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    <p className="text-lg text-gray-800">
                        A one-time password (OTP) will be sent to your email address:
                        <span className="font-bold text-gray-800 "> {user.email} </span>.
                    </p>
                    <p className="mt-4 text-gray-700 text-m">
                        Use this OTP to verify your identity.
                    </p>
                </div>
                {otpSent && (
                    <div className="mt-4">
                        <InputLabel htmlFor="otp" value="OTP" required />
                        <TextInput
                            id="otp"
                            type="text"
                            name="otp"
                            value={data.otp}
                            className="block w-full mt-1 rounded-xl"
                            onChange={(e) => setData({ ...data, otp: e.target.value })}
                        />
                        <InputError message={errors.otp} className="mt-2" />
                    </div>
                )}

                <div className="flex justify-end mt-6 space-x-2">

                    {otpSent ? (
                        <button
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                            onClick={submit}
                        >
                            Verify OTP
                        </button>
                    ) : (
                        <button
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                            onClick={sendOtp}
                        >
                            Send OTP
                        </button>
                    )}
                </div>
            </form>
        </Modal>
    );
}



