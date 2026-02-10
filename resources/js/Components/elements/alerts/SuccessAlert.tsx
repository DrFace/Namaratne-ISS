import { Fragment, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function SuccessAlert({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    const [timeLeft, setTimeLeft] = useState(5000);
    const [show, setShow] = useState(true); // Control the visibility of the alert

    useEffect(() => {
        if (timeLeft > 0) {
            const intervalId = setInterval(() => {
                setTimeLeft((prevTimeLeft) => prevTimeLeft - 10);
            }, 10);

            return () => clearInterval(intervalId);
        } else {
            setShow(false); // Hide alert when timeLeft is 0
        }
    }, [timeLeft]);

    const closeNotification = () => {
        setTimeLeft(0); // This will set timeLeft to 0 and hide the alert
        setShow(false);  // Explicitly hide the alert
    };

    return (
        <>
            {/* Global notification live region, render this permanently at the end of the document */}
            <div
                aria-live="assertive"
                className="z-[100001] pointer-events-none fixed inset-2 top-16 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
                <div className="flex flex-col items-center w-full space-y-4 sm:items-end">
                    {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                    <Transition
                        show={show} // Now controls visibility of the notification
                        as={Fragment}
                        enter="transform ease-out duration-300 transition"
                        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="relative w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg pointer-events-auto isolate ring-1 ring-black ring-opacity-5">
                            <div
                                className="absolute top-0 bottom-0 left-0 bg-green-100 -z-10"
                                style={{ width: `${100 - timeLeft / 50}%` }}
                            />
                            <div className="z-10 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon
                                            className="w-6 h-6 text-green-600"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-green-800">
                                            {title}
                                        </p>
                                        <p className="mt-1 text-sm text-green-600">
                                            {message}
                                        </p>
                                    </div>
                                    <div className="flex flex-shrink-0 ml-4">
                                        <button
                                            type="button"
                                            className="inline-flex text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={closeNotification} // Now correctly closes the notification
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </>
    );
}
