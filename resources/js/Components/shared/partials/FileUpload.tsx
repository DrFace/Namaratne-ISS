import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const FileUpload = ({
    setData,
    attachmentFilePath,
    type,
}: {
    setData: any;
    attachmentFilePath: any;
    type: any;
}) => {
    const [fileArray, setFileArray] = useState<any[]>(attachmentFilePath?.length === 0 ? [] : attachmentFilePath);
    const [fileError, setFileError] = useState<string | null>(null);
    const MAX_FILE_SIZE_MB = 100;

    const handleFileChange = (files: File[]) => {
        const totalSize = ((files.reduce((acc, file) => acc + file?.size, 0) / (1024 * 1024)) + (fileArray?.reduce((acc, file) => acc + file?.size, 0) / (1024 * 1024)));
       // console.log("totalSize", totalSize);

        if (fileArray?.length + files?.length > 10) {
            setFileError('Maximum 10 files allowed.');
            return;
        }

        if (totalSize > MAX_FILE_SIZE_MB) {
            setFileError(`Maximum ${MAX_FILE_SIZE_MB}MB allowed for all files.`);
            return;
        }

        const newFiles = files.map(file =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
                originalName: file.name,
                newName: file.name,
            })
        );

        setFileArray(prevFiles => [...prevFiles, ...newFiles]);
        setData('attachments', [...fileArray, ...newFiles]);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFileChange(files);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleFileChange(files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
    };

    const removeFile = (index: number) => {
        const updatedFiles = fileArray.filter((_, i) => i !== index);
        setFileArray(updatedFiles);
        setData('attachments', updatedFiles.length ? updatedFiles : null);
    };

    const handleDownload = (file: any) => {
        const link = document.createElement('a');
        link.href = file.preview || file.path_url;
        link.download = file.file_name || file.newName || file.originalName;
        link.click();
    };

    return (
        <div className="mt-4">
            <div className="w-full text-center bg-gray-100 border-2 border-blue-500 border-dashed rounded-md">
                {fileArray.length > 0 ? (
                    <div className="flex flex-col items-center justify-center p-4">
                        <p className="text-blue-500">Files uploaded:</p>
                        <div className="flex flex-col gap-4 p-2 text-center">
                            <div className={`grid sm:grid-cols-2 gap-4`}>
                                {fileArray.map((file: any, index) => (
                                    <div key={index} className="relative">
                                        <div className="flex items-center justify-between p-2 bg-blue-200 rounded-lg">
                                            <div className="flex-1 text-left">
                                                <p className="text-sm text-gray-800">{file?.file_name || file.originalName}</p>
                                                <p className="text-xs text-gray-500">{(file?.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type='button'
                                                onClick={() => handleDownload(file)}
                                                className="p-1 ml-2 text-blue-500 bg-white rounded-full"
                                            >
                                                <ArrowDownTrayIcon className="w-6 h-6" />
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => removeFile(index)}
                                                className="p-1 ml-2 text-red-500 bg-white rounded-full"
                                            >
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {fileError && <p className="text-red-500">{fileError}</p>}
                            <div className="flex flex-col items-center justify-center w-full">
                                <input
                                    type="file"
                                    name="attachment"
                                    accept=".pdf,.txt,.png,.jpg,.jpeg,.ppt,.pptx"
                                    multiple
                                    className="hidden"
                                    id="file-input"
                                    onChange={handleFileUpload}
                                />
                                <label
                                    htmlFor="file-input"
                                    className="w-full"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <div className="flex flex-col items-center justify-center h-24 text-base font-medium">
                                        <p className="text-gray-600">
                                            Drag or <span className="text-blue-500 cursor-pointer">upload</span> project files
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-red-500">{fileError}</p>
                        <div className="flex flex-col items-center justify-center w-full">
                            <input
                                type="file"
                                name="attachment"
                                accept=".pdf,.txt,.png,.jpg,.jpeg,.ppt,.pptx"
                                multiple
                                className="hidden"
                                id="file-input"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="file-input"
                                className="w-full"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                <div className="flex flex-col items-center justify-center h-24 text-base font-medium">
                                    <p className="text-gray-600">
                                        Drag or <span className="text-blue-500 cursor-pointer">upload</span> project files
                                    </p>
                                </div>
                            </label>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
