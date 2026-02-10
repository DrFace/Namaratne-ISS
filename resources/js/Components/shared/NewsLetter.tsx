import { Link, useForm } from "@inertiajs/react";
import { PrimaryButton } from "../elements/buttons/PrimaryButton";
import { FormEventHandler, useState } from "react";
import InputError from "../elements/inputs/InputError";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function NewsLetter() {
    const { data, setData, post, progress, errors, reset } = useForm({
        email: "",
    });

    const [isSuccess, setIsSuccess] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
       // console.log(data);
        post(route("subscriber.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsSuccess(true);
            },
        });
    };

    return (
        <div className="py-16 bg-white sm:py-24 lg:py-32">
            <div className="grid grid-cols-1 gap-10 px-6 mx-auto max-w-7xl lg:grid-cols-12 lg:gap-8 lg:px-8">
                <div className="max-w-xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:col-span-7">
                    <h2 className="inline sm:block lg:inline xl:block">
                        Want product news and updates?
                    </h2>{" "}
                    <p className="inline sm:block lg:inline xl:block">
                        Sign up for our newsletter.
                    </p>
                </div>
                <form
                    onSubmit={submit}
                    className="w-full max-w-md lg:col-span-5 lg:pt-2"
                >
                    <div className="flex gap-x-4">
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Enter your email"
                        />
                        <PrimaryButton
                            disabled={progress ? true : false}
                            type="submit"
                        >
                            Subscribe
                        </PrimaryButton>
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                    <p className="mt-4 text-sm leading-6 text-gray-900">
                        We care about your data. Read our{" "}
                        <Link
                            href="#"
                            className="font-semibold text-primary-600 hover:text-primary-500"
                        >
                            privacy&nbsp;policy
                        </Link>
                        .
                    </p>
                    {isSuccess && (
                        <p className="px-8 py-2 mt-2 text-green-800 bg-green-100 rounded-md">
                            Thank you for subscribing our News letter Service.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
