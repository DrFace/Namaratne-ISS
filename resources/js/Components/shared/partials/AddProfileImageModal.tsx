import InputError from '@/Components/elements/inputs/InputError';
import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const AddProfileImageModal = (
    {
        onClose,
    }: {
        onClose: () => void
    }) => {
    const [processing, setProcessing] = useState(false);

    const { data, setData, post, errors, progress, reset } = useForm({
        image: null,
    });

    const [canCleanImage, setCanCleanImage] = useState(false);
    const [images, setImages] = useState([]);
    const onDrop = useCallback(
        (acceptedFiles: any) => {
            setImages(
                acceptedFiles.map((file: any) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );
            setCanCleanImage(true);
            setData(
                "image",
                acceptedFiles.map((file: any) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )[0]
            );
        },
        [setImages, setData]
    );
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
    });
    const thumb = images.map((file: any) => (
        <div key={file.name}>
            <div>
                <img
                    alt={file.name}
                    src={file.preview}
                    width={300}
                    height={300}
                    className="h-[200px] w-full overflow-hidden object-contain rounded-xl bg-gray-700"
                    onLoad={() => {
                        URL.revokeObjectURL(file.preview);
                    }}
                />
            </div>
        </div>
    ));

    const remove = (file: any) => {
        const newImages = [...images];
        newImages.splice(file, 1);
        setData("image", null);
        setImages(newImages);
        setCanCleanImage(false);
    };

    useEffect(() => {
        return () =>
            images.forEach((file: any) => URL.revokeObjectURL(file.preview));
    }, [images]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        {
            setProcessing(true);
            post(route('profile.ImageUpdate'),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        onClose();
                    },
                    onError: (e) => {
                       // console.log(e);
                        setProcessing(false);
                    },
                }
            )
        };
    };

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-3/4 p-6 bg-white rounded-lg md:w-2/3 lg:w-1/2">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-semibold ">Add a new profile image</h2>
                    <button onClick={onClose} className="text-lg text-gray-500 hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col p-4 ">

                    <span className='text-xs text-gray-500'>To upload your profile picture, use a JPEG, PNG, GIF, SVG, or WEBP image under 2 MB and at least 100x100 pixels.</span>
                </div>
                <form onSubmit={submit} className='flex flex-col gap-2'>
                    <div className="flex flex-col w-full gap-4 sm:flex-row">
                        <div className='flex flex-col items-center justify-center w-full '>
                            {/* Image */}
                            <div className="grid justify-center grid-flow-row px-6 py-2 mt-2 border-2 border-dashed rounded-xl ">
                                <div className="relative flex items-center h-full ">
                                    <div
                                        {...getRootProps({
                                            className: "dropzone",
                                        })}
                                        className="min-h-[200px] object-cover h-full w-full cursor-pointer flex rounded-xl bg-slate-200"
                                    >
                                        <input
                                            type="file"
                                            {...getInputProps()}
                                        />
                                        {images.length > 0 ? (
                                            thumb
                                        ) : (
                                            <span className="absolute grid self-center mx-auto text-center text-gray-900 left-4 right-4">
                                                Upload Image
                                            </span>
                                        )}
                                    </div>

                                    {progress && (
                                        <progress
                                            value={progress.percentage}
                                            className="absolute top-0 left-0 h-2 bg-emerald-500"
                                            max="100"
                                        >
                                            {progress.percentage}%
                                        </progress>
                                    )}
                                </div>
                                {canCleanImage && (
                                    <button
                                        className="z-10 mx-auto mt-2 w-[70px] rounded bg-gray-300 py-1 px-2 text-sm text-gray-700 hover:bg-gray-500 hover:text-gray-900"
                                        type="button"
                                        onClick={() => remove(0)}
                                    >
                                        Clean
                                    </button>
                                )}
                                {canCleanImage ? null : (
                                    <div className="mt-1 ml-3 text-xs font-light text-center text-gray-500">
                                        {" "}
                                        Drag and drop or click to replace
                                    </div>
                                )}
                                   <div className="mt-1 text-center">
                                <InputError message={errors?.image} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end gap-1 sm:mt-10 sm:flex-row">
                        <button
                            type="submit"
                            className="px-16 py-1 text-white border bg-primaryBtnColor border-primaryBtnColor hover:bg-primaryBtnColorHover rounded-3xl"
                        >
                            {processing ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProfileImageModal;
