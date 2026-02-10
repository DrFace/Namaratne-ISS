import React, { useState } from 'react';
import Modal from '@/Components/elements/other/Modal';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import TextInput from '@/Components/elements/inputs/TextInput';
import InputError from '@/Components/elements/inputs/InputError';
import { useForm } from '@inertiajs/react';
import { User } from '@/types';

export default function EmailModal(
    {
        show,
        onClose,
        user
    }: {
        show: boolean;
        onClose: () => void;
        user: User
    }) {

    const [otpSent, setOtpSent] = useState(false);
    const { data, setData, post, errors, reset, processing } = useForm({
        current_email: user.email || '',
        new_email: '',
        otp: '',
    });

    const sendOtp = () => {
        post(route('profile.sendOtp'), {
            onSuccess: () => {
                setOtpSent(true);
            },
            onError: (errors) => {
                console.error('Error sending OTP:', errors);
            }
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.updateEmail'), {
            onSuccess: () => {
                setOtpSent(false);
                onClose();
                reset();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    const handleClose = () => {
        setOtpSent(false);
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <div className="flex justify-between">
                    <h2 className="flex justify-center text-xl font-bold">Update Email</h2>
                    <button
                        type='button'
                        onClick={handleClose}
                        className="text-lg text-gray-500 hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    <InputLabel htmlFor="current_email" value="Current Email" />
                    <TextInput
                        id="current_email"
                        type="email"
                        placeholder="Current Email"
                        maxLength={100}
                        name="current_email"
                        value={data.current_email}
                        className="block w-full mt-1 opacity-60 rounded-xl"
                        disabled={true}
                    />
                </div>
                <div className="mt-4">
                    <InputLabel htmlFor="new_email" value="New Email" required />
                    <TextInput
                        id="new_email"
                        type="email"
                        placeholder="New Email"
                        name="new_email"
                        maxLength={100}
                        value={data.new_email}
                        className="block w-full mt-1 rounded-xl"
                        onChange={(e) => setData('new_email', e.target.value)}
                        required
                        disabled={otpSent}
                    />
                    <InputError message={errors.new_email} className="mt-2" />
                </div>

                {otpSent && (
                    <div className="mt-4">
                        <InputLabel htmlFor="otp" value="OTP" required />
                        <TextInput
                            id="otp"
                            type="text"
                            name="otp"
                            maxLength={6}
                            placeholder="Enter OTP"
                            value={data.otp}
                            className="block w-full mt-1 rounded-xl"
                            onChange={(e) => setData('otp', e.target.value)}

                        />
                        <InputError message={errors.otp} className="mt-2" />
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    {!otpSent ? (
                        <button type="button" disabled={processing} onClick={sendOtp} className="px-4 py-2 text-white bg-blue-500 rounded-lg">
                            {processing ? 'Sending...' : 'Send OTP'}
                        </button>
                    ) : (

                        <button disabled={processing} type="submit" className="px-5 py-2 text-white bg-blue-500 rounded-xl">
                            {processing ? 'Updating...' : 'Update'}
                        </button>
                    )}
                </div>
            </form>
        </Modal>
    );
}
