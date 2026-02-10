import { useForm } from '@inertiajs/react';
import Modal from '@/Components/elements/other/Modal';
import { User } from '@/types';
import React from 'react';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import TextInput from '@/Components/elements/inputs/TextInput';
import InputError from '@/Components/elements/inputs/InputError';

export default function NameModal({
    show,
    onClose,
    user,
}: {
    show: boolean;
    onClose: () => void;
    user: User;
}) {
    const { data, setData, post, errors, reset, processing } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.updateNameInfo'), {
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <div className="flex justify-between">
                    <h2 className="flex justify-center text-xl font-bold">
                        Update Name
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-lg text-gray-500 hover:text-black"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* First Name */}
                <div className="mt-4">
                    <InputLabel required htmlFor="first_name" value="First Name" />
                    <TextInput
                        id="first_name"
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={data.first_name}
                        className="block w-full mt-1 rounded-xl"
                        isFocused={true}
                        onChange={(e) => setData('first_name', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.first_name} className="mt-2" />
                </div>

                {/* Last Name */}
                <div className="mt-4">
                    <InputLabel required htmlFor="last_name" value="Last Name" />
                    <TextInput
                        id="last_name"
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={data.last_name}
                        className="block w-full mt-1 rounded-xl"
                        onChange={(e) => setData('last_name', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.last_name} className="mt-2" />
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        disabled={processing}
                        type="submit"
                        className="px-6 py-2 text-white bg-blue-500 rounded-xl"
                    >
                        {processing ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
