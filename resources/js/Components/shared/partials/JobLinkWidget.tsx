
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

export default function JobLinkWidget(
    {
        jobUrl,
    }: {
        jobUrl: string;
    }
) {
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (copied) {
            timeout = setTimeout(() => {
                setCopied(false);
            }, 1500);
        }
        return () => {
            clearTimeout(timeout);
        };
    },
        [copied]
    );

    return (
        <div className="flex flex-col gap-3 ">
            <h2 className="text-xl font-semibold text-start font-Inter ">Job Link</h2>
            <div className="flex flex-row gap-1 px-4 py-3 bg-gray-200 rounded-3xl">
                <p className="w-full overflow-hidden text-base font-normal text-blue-400 text-start font-Inter">{jobUrl}</p>
                <div className="flex flex-row justify-end gap-2">
                    <button className="flex flex-row items-center w-auto gap-2 pl-2 font-bold border-l-2 border-gray-400 cursor-pointer text-primary text-start font-Inter hover:underline"
                        onClick={() => navigator.clipboard.writeText(jobUrl)
                            .then(() => setCopied(true))}>
                        {copied ? (
                            <ClipboardDocumentCheckIcon className="w-6 h-6" />
                        ) : (
                            <ClipboardDocumentIcon className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}
