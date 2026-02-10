import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Checkbox from '@/Components/elements/inputs/Checkbox';
import InputError from '@/Components/elements/inputs/InputError';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import TextInput from '@/Components/elements/inputs/TextInput';
import AppLayout from '@/Layouts/AppLayout';


export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

      return (
        <AppLayout isFooter={false} isHeader={false}>
            <Head title="Login" />
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
                    <h1 className="text-2xl font-semibold text-center text-gray-800">Welcome back 👋</h1>
                    <p className="mt-1 text-sm text-center text-gray-500">Log in to your account</p>

                    {status && (
                        <div className="mt-4 text-sm font-medium text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2 mt-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                        >
                            {processing ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don’t have an account?{' '}
                        <Link href={route('register')} className="text-blue-600 hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
