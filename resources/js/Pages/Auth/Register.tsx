import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import TextInput from '@/Components/elements/inputs/TextInput';
import InputError from '@/Components/elements/inputs/InputError';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <AppLayout isFooter={false} isHeader={false}>
            <Head title="Register" />

            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
                    {/* Logo + Title */}
                    <div className="flex flex-col items-center mb-6">
                        <img
                            src="/logo.png"
                            alt="Company Logo"
                            className="w-16 h-16 mb-2"
                        />
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Create an account 🚀
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Sign up to get started with us
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* First Name */}
                        <div>
                            <InputLabel htmlFor="first_name" value="First Name" />
                            <TextInput
                                id="first_name"
                                type="text"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>

                        {/* Last Name */}
                        <div>
                            <InputLabel htmlFor="last_name" value="Last Name" />
                            <TextInput
                                id="last_name"
                                type="text"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Contact Number */}
                        <div>
                            <InputLabel htmlFor="phone_number" value="Contact Number" />
                            <TextInput
                                id="phone_number"
                                type="text"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.phone_number} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                        >
                            {processing ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
