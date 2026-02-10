import React from 'react';
import Modal from '@/Components/elements/other/Modal';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import TextInput from '@/Components/elements/inputs/TextInput';
import InputError from '@/Components/elements/inputs/InputError';
import { useForm } from '@inertiajs/react';
import { PrimaryButton } from '@/Components/elements/buttons/PrimaryButton';

export default function ForgotPasswordModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, errors, processing } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('auth.password.email'), {
            onSuccess: () => {
                onClose();
            },
        });



    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <div className="flex justify-between">
                    <h2 className="flex justify-center text-xl font-bold">Forgot Password</h2>

                    <button type="button" onClick={onClose} className="text-lg text-gray-500 hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <span className="text-gray-500 text-bae hover:text-black">Your are automatically logged out after this process</span>
                <div className="mt-4">
                    <InputLabel required htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full mt-1 placeholder:text-sm"
                        placeholder="Enter your email address"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>
                <div className="flex justify-end mt-6">
                    <PrimaryButton className="ms-4 rounded-3xl" disabled={processing}>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
