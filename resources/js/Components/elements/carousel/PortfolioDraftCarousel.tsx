import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import ConfirmationModal from './Partials/ConfirmationModal';

interface Resource {
    link: string;
    id: number;
    image_url: string;
    title: string;
}


const PortfolioDraftCarousel = (
    {
        draftPortfolios,
        deleteOption,
        onSelect,
    }: {
        draftPortfolios: any;
        deleteOption: boolean;
        onSelect: (resource: Resource) => void;
    }) => {
    const maxScrollWidth = useRef<number>(0);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(3); // Default to 3
    const carousel = useRef<HTMLDivElement | null>(null);
    const totalPages = Math.ceil(draftPortfolios.length / itemsPerPage);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { post } = useForm({});

    const movePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevState) => prevState - 1);
        }
    };

    const moveNext = () => {
        if (carousel.current !== null && currentIndex < totalPages - 1) {
            setCurrentIndex((prevState) => prevState + 1);
        }
    };

    const isDisabled = (direction: 'prev' | 'next'): boolean => {
        return direction === 'prev' ? currentIndex <= 0 : currentIndex >= totalPages - 1;
    };

    const confirmDelete = (id: number) => {
        setSelectedId(id);
        setShowConfirmation(true);
    };

    const handleDelete = () => {
        if (selectedId !== null) {
        post(route('freelancer.portfolio.delete', {
            id: selectedId
        }),
            {
                onSuccess: () => {
                    if (draftPortfolios.length % itemsPerPage === 1 && currentIndex > 0) {
                        setCurrentIndex((prevState) => Math.max(prevState - 1, 0));
                    }
                }
            }
        );

    }
    setShowConfirmation(false);
};

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 800) {
                setItemsPerPage(1); // Mobile
            } else if (window.innerWidth < 1400) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3); // Desktop
            }
        };

        handleResize(); // Set initial items per page

        window.addEventListener('resize', handleResize); // Update on resize

        return () => {
            window.removeEventListener('resize', handleResize); // Cleanup
        };
    }, []);

    useEffect(() => {
        if (carousel.current !== null) {
            carousel.current.scrollLeft = carousel.current.offsetWidth * currentIndex;
        }
    }, [currentIndex]);

    useEffect(() => {
        maxScrollWidth.current = carousel.current
            ? carousel.current.scrollWidth - carousel.current.offsetWidth
            : 0;
    }, []);

    // console.log('draftPortfolios', draftPortfolios);

    return (
        <div className=" carousel">
            <div className="relative overflow-hidden">
            {draftPortfolios.length === 0 ?
                    <div className="flex items-center justify-center h-96">
                        <p className='text-lg text-gray-500'>No portfolios items found.</p>

                        </div>
                    :
                <div className="relative z-0 flex items-center gap-8 overflow-hidden lg:justify-center justify-left scroll-smooth snap-x snap-mandatory touch-pan-x" ref={carousel}>
                    {draftPortfolios.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage).map((resource: Resource, index: number) => (
                        <div className="flex flex-col gap-2" key={index}>
                            <div className="relative text-center bg-gray-400 rounded-2xl h-52 w-72 carousel-item snap-start">
                                <a
                                    href={resource.link}
                                    className="z-0 block w-full h-full bg-left-top bg-no-repeat bg-cover rounded-2xl aspect-square bg-origin-padding"
                                >
                                    <img
                                        src={resource.image_url}
                                        alt={resource.title}
                                        className="object-cover w-full h-full rounded-2xl"
                                    />
                                </a>
                                <button
                                    hidden={!deleteOption}
                                    onClick={() => confirmDelete(resource.id)}
                                    className="absolute p-2 text-white bg-red-500 rounded-full hover:bg-red-700 top-2 right-2"
                                >
                                   <TrashIcon className="w-5 h-5" />
                                </button>
                                <button
                                    hidden={!deleteOption}
                                    onClick={() => onSelect(resource)}
                                    className="absolute p-2 text-white bg-green-500 rounded-full hover:bg-green-700 top-12 right-2"
                                >
                                   <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-4 text-start w-60 ">
                                <a href={resource.link} className="block w-full h-full">
                                    <h3 className="overflow-hidden text-xl whitespace-nowrap text-ellipsis">
                                        {resource.title}
                                    </h3>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
    }
                <div className="flex items-center justify-end mt-4">
                    <button
                        onClick={movePrev}
                        className="px-4 py-2 text-base font-bold rounded text-primaryBtnColor disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDisabled('prev')}
                    >
                        <span className='text-lg'>{"<"}</span> Previous
                    </button>
                    <div className="hidden sm:block">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                className={`mx-1 px-3 py-1 rounded-full ${index === currentIndex ? 'bg-primaryBtnColor font-bold text-white' : 'bg-white font-bold hover:bg-blue-100 text-primaryBtnColor'}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={moveNext}
                        className="px-4 py-2 text-base font-bold rounded text-primaryBtnColor disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDisabled('next')}
                    >
                        Next <span className='text-lg'>{">"}</span>
                    </button>
                </div>
            </div>
            <ConfirmationModal
                show={showConfirmation}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirmation(false)}
                message="Are you sure you want to delete this portfolio item?"
            />
        </div>
    );
};

export default PortfolioDraftCarousel;
