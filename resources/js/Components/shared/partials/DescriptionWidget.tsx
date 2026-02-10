
import React, { useState } from 'react';

const MAX_DESCRIPTION_LENGTH = 300;
export default function DescriptionWidget(
    {
        description,
        attachments,
        id,
        title = 'Description'

    }: {
        description: string,
        attachments: any[],
        id: number,
        title: string
    }
) {

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const handleDownload = (file: any) => {
        const link = document.createElement('a');
        link.href = file.path_url;
        link.download = file.file_name;
        link.click();
    }

    // Toggle description
    const toggleDescription = (id: number) => {
        setExpandedIds(prev => {
            const newExpandedIds = new Set(prev);
            if (newExpandedIds.has(id)) {
                newExpandedIds.delete(id);
            } else {
                newExpandedIds.add(id);
            }
            return newExpandedIds;
        });
    };

    const renderDescription = (description: string, id: number) => {
        if (description?.length <= MAX_DESCRIPTION_LENGTH) {
            return <p>{description}</p>;
        }
        const isExpanded = expandedIds.has(id);
        const truncatedDescription = description?.slice(0, MAX_DESCRIPTION_LENGTH) + '...';
        return (
            <>
                <p>
                    {isExpanded ? description : truncatedDescription}
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleDescription(id);
                    }}
                    type='button'
                    className="font-semibold text-left text-blue-500 underline ">
                    {isExpanded ? 'less' : 'more'}
                </button>

            </>
        );
    };

    //console.log('description', description);

    return (
        <>
            {description != undefined ? (
                <div className='flex flex-col gap-4 '>
                    {title &&
                        <div className='flex flex-row items-center gap-2'>
                            <h1 className='text-xl font-medium font-Inter'>{title}</h1>
                        </div>
                    }
                    <div>
                        <p className="text-sm font-normal sm:text-base text-start font-Inter ">
                            {renderDescription(description, id)}
                        </p>
                    </div>
                    {attachments?.length > 0 && (
                        <div className='flex flex-col items-start justify-start w-full gap-4'>
                            {attachments?.map((attachment: any) => (
                                <button
                                    type='button'
                                    className="flex flex-row items-center justify-start gap-2 text-left j"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(attachment);
                                    }}
                                >
                                    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.44141 5.49958V11.1187C3.4479 11.5296 3.61568 11.9215 3.90855 12.2098C4.20142 12.498 4.59589 12.6596 5.00684 12.6596C5.41778 12.6596 5.81225 12.498 6.10512 12.2098C6.39799 11.9215 6.56578 11.5296 6.57227 11.1187L6.57734 3.75349C6.58161 3.40229 6.51611 3.05373 6.38466 2.72803C6.25321 2.40234 6.05842 2.10597 5.81158 1.85611C5.56474 1.60626 5.27075 1.40788 4.94667 1.27249C4.62259 1.1371 4.27486 1.06738 3.92363 1.06738C3.57241 1.06738 3.22468 1.1371 2.9006 1.27249C2.57651 1.40788 2.28253 1.60626 2.03569 1.85611C1.78885 2.10597 1.59405 2.40234 1.4626 2.72803C1.33115 3.05373 1.26566 3.40229 1.26992 3.75349V11.1683C1.26277 11.6628 1.35397 12.1537 1.53823 12.6126C1.7225 13.0714 1.99614 13.4891 2.34326 13.8413C2.69037 14.1934 3.10403 14.4731 3.56019 14.664C4.01635 14.8549 4.50591 14.9532 5.00039 14.9532C5.49488 14.9532 5.98443 14.8549 6.44059 14.664C6.89675 14.4731 7.31041 14.1934 7.65753 13.8413C8.00464 13.4891 8.27829 13.0714 8.46255 12.6126C8.64681 12.1537 8.73802 11.6628 8.73086 11.1683V4.23942" stroke="#004AAD" stroke-width="1.00189" stroke-miterlimit="10" stroke-linecap="round" />
                                    </svg>
                                    <span className="text-base font-semibold underline hover:text-primaryBtnColorHover text-primaryBtnColor">{attachment?.file_name}</span>
                                    <span className="text-xs font-semibold text-gray-500">({(attachment?.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            ) :
                <div className='flex flex-col gap-4 '>
                    <span>
                        <h1 className='text-base font-medium text-gray-400 font-Inter'>Description not available</h1>
                    </span>
                </div>
            }
        </>
    );
}
