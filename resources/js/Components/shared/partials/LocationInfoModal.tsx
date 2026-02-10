import { useForm } from '@inertiajs/react';
import Modal from '@/Components/elements/other/Modal';
import React from 'react';
import SelectInput from '@/Components/elements/inputs/SelectInput';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import InputError from '@/Components/elements/inputs/InputError';
import TextInput from '@/Components/elements/inputs/TextInput';

interface LocationFormData {
    country: string;
    time_zone: string;
    address_line1: string;
    address_line2: string;
    address_line3: string;
    phone: string;
}

interface UserMetaData {
    address_line1?: string;
    address_line2?: string;
    address_line3?: string;
    phone?: string;
}

interface User {
    country?: string;
    time_zone?: string;
    meta_data?: UserMetaData;
}

export default function LocationInfoModal({
    show,
    onClose,
    user,
    countryMap,
    timeZoneOptions,
}: {
    show: boolean;
    onClose: () => void;
    user: User;
    countryMap: { label: string; value: string }[];
    timeZoneOptions: { label: string; value: string }[];
}) {
    const { data, setData, post, reset, processing, errors } = useForm<LocationFormData>({
        country: user?.country || '',
        time_zone: user?.time_zone || '',
        address_line1: user?.meta_data?.address_line1 || '',
        address_line2: user?.meta_data?.address_line2 || '',
        address_line3: user?.meta_data?.address_line3 || '',
        phone: user?.meta_data?.phone || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.LocationUpdate'), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <form onSubmit={submit} className="p-6">
                <div className="flex justify-between">
                    <h2 className="flex justify-center text-xl font-bold">Edit Location Information</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-lg text-gray-500 hover:text-black"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Country & Time Zone */}
                <div className="grid grid-cols-1 mt-2 sm:gap-6 sm:grid-cols-2">
                    <div className="mt-4">
                        <InputLabel required htmlFor="country" value="Country" />
                        <SelectInput
                            className="block w-full mt-2 placeholder:text-sm font-Inter"
                            options={countryMap}
                            placeholder="Select a country"
                            selectedOption={data.country ? { value: data.country, label: data.country } : null}
                            setData={(value: any) => setData('country', value.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.country} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel required htmlFor="time_zone" value="Time Zone" />
                        <SelectInput
                            className="block w-full mt-2 placeholder:text-sm font-Inter"
                            options={timeZoneOptions}
                            placeholder="Select a time zone"
                            selectedOption={data.time_zone ? { value: data.time_zone, label: data.time_zone } : null}
                            setData={(value: any) => setData('time_zone', value.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.time_zone} className="mt-2" />
                    </div>
                </div>

                {/* Address Lines */}
                <div className="mt-2">
                    <InputLabel required htmlFor="address_line1" value="Address Line 1" />
                    <TextInput
                        type="text"
                        value={data.address_line1}
                        placeholder='Add address line 1'
                        onChange={(e) => setData('address_line1', e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={processing}
                    />
                    <InputError message={errors.address_line1} className="mt-2" />
                </div>

                <div className="mt-2">
                    <InputLabel htmlFor="address_line2" value="Address Line 2" />
                    <TextInput
                        type="text"
                        value={data.address_line2}
                        placeholder='Add address line 2'
                        onChange={(e) => setData('address_line2', e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={processing || !data.address_line1}
                    />
                    <InputError message={errors.address_line2} className="mt-2" />
                </div>

                <div className="mt-2">
                    <InputLabel htmlFor="address_line3" value="Address Line 3" />
                    <TextInput
                        type="text"
                        value={data.address_line3}
                        placeholder='Add address line 3'
                        onChange={(e) => setData('address_line3', e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={processing || !data.address_line2}
                    />
                    <InputError message={errors.address_line3} className="mt-2" />
                </div>

                {/* Phone */}
                <div className="mt-2">
                    <InputLabel htmlFor="phone" value="Phone" />
                    <TextInput
                        type="tel"
                        placeholder="Add phone number"
                        value={data.phone}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,15}$/.test(value)) setData('phone', value);
                        }}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={processing}
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="flex justify-end mt-6">
                    <button disabled={processing} type="submit" className="px-6 py-2 text-white bg-blue-500 rounded-xl">
                        {processing ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
