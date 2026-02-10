import React, { useState } from 'react';
import Modal from '@/Components/elements/other/Modal';
import InputLabel from '@/Components/elements/inputs/InputLabel';
import TextInput from '@/Components/elements/inputs/TextInput';
import InputError from '@/Components/elements/inputs/InputError';
import { Link, useForm } from '@inertiajs/react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { User } from '@/types';


export default function PasswordChangeModal({
    show,
    onClose,
    user,
}: {
    show: boolean;
    onClose: () => void;
    user: User;
}) {
    const [otpSent, setOtpSent] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const { data, setData, post, errors, reset } = useForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
        otp: '',
        email: user.email || '',
    });

    const canSendOtp = () => {
        return (
            data.current_password &&
            data.new_password &&
            data.confirm_password &&
            data.new_password === data.confirm_password &&
            passwordStrength === 'Strong'
        );
    };

    const sendOtp = () => {
        post(route('profile.sendOtpCode', { type: 'password_change' }), {
            onSuccess: () => {
                setOtpSent(true);
            },
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.new_password !== data.confirm_password) {
            return;
        }
        post(route('profile.updatePasswordInfo'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setData('new_password', password);
        evaluatePasswordStrength(password);
    };

    const evaluatePasswordStrength = (password: string) => {
        let strength = 'Weak';
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (strongPasswordRegex.test(password)) {
            strength = 'Strong';
        } else if (password.length >= 6) {
            strength = 'Medium';
        }
        setPasswordStrength(strength);
    };

    return (
        <>
            <Modal show={show} onClose={onClose} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <div className="flex justify-between">
                        <h2 className="flex justify-center text-xl font-bold">Change Password</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-lg text-gray-500 hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-4">
                        <InputLabel required htmlFor="current_password" value="Current Password" />
                        <TextInput
                            id="current_password"
                            type="password"
                            name="current_password"
                            maxLength={64}
                            placeholder='Current Password'
                            value={data.current_password}
                            className="block w-full mt-1 rounded-xl"
                            onChange={(e) => setData('current_password', e.target.value)}
                            required
                        />
                        <InputError message={errors.current_password} className="mt-2" />
                    </div>
                    <div className="mt-4">
                        <InputLabel htmlFor="new_password" value="New Password" required />
                        <TextInput
                            id="new_password"
                            type="password"
                            maxLength={64}
                            name="new_password"
                            placeholder='New Password'
                            value={data.new_password}
                            className="block w-full mt-1 rounded-xl"
                            onChange={handlePasswordChange}
                            required
                        />
                        <InputError message={errors.new_password} className="mt-2" />
                    </div>
                    <div className={`mt-2 bg-gray-200 rounded-lg ${passwordStrength === '' ? 'hidden' : 'block'}`}>
                        <div
                            className={`h-2 rounded-full ${passwordStrength === 'Strong' ? 'bg-green-600' :
                                passwordStrength === 'Medium' ? 'bg-yellow-600' :
                                    'bg-red-600'
                                }`}
                            style={{
                                width: passwordStrength === 'Strong' ? '100%' :
                                    passwordStrength === 'Medium' ? '66%' :
                                        passwordStrength === 'Weak' ? '33%' : '0%',
                                transition: 'width 0.3s ease'
                            }}
                        />
                    </div>
                    <div className={`mt-2 text-sm ${passwordStrength === 'Strong' ? 'text-green-600 ' : passwordStrength === 'Medium' ? 'text-yellow-600 ' : passwordStrength === 'Weak' ? 'text-red-600 ' : 'hidden'}`}>
                        Password Strength: {passwordStrength}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                        Password must be at least 8 characters long, include uppercase and lowercase letters, numbers, and special characters ( @$!%*?& ).
                    </p>

                    <div className="mt-4">
                        <InputLabel htmlFor="confirm_password" value="Confirm New Password" required />
                        <TextInput
                            id="confirm_password"
                            type="password"
                            name="confirm_password"
                            maxLength={64}
                            placeholder='Confirm New Password'
                            value={data.confirm_password}
                            className="block w-full mt-1 rounded-xl"
                            onChange={(e) => setData('confirm_password', e.target.value)}
                            required
                        />
                        <InputError message={errors.confirm_password} className="mt-2" />
                    </div>

                    {otpSent && (
                        <div className="mt-4">
                            <InputLabel htmlFor="otp" value="OTP" required />
                            <TextInput
                                id="otp"
                                type="text"
                                name="otp"
                                maxLength={6}
                                placeholder='One Time Password'
                                value={data.otp}
                                className="block w-full mt-1 rounded-xl"
                                onChange={(e) => setData('otp', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                                        e.preventDefault(); // Prevents entering non-numeric characters like 'e'
                                    }
                                }}
                            />
                            <InputError message={errors.otp} className="mt-2" />
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        {!forgotPassword && (
                            <div className="px-4 mt-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => { setForgotPassword(true); onClose(); }}
                                    className="font-medium text-md text-primary hover:text-primary-500"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {!otpSent ? (
                            <button type="button" onClick={sendOtp} className={`px-4 py-2 rounded-lg text-white ${canSendOtp() ? 'bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}`} disabled={!canSendOtp()}> Send OTP </button>
                        ) : (
                            <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-lg">Save</button>
                        )}
                    </div>
                </form>
            </Modal>

            <ForgotPasswordModal
                show={forgotPassword}
                onClose={() => setForgotPassword(false)}
            />
        </>
    );
}
