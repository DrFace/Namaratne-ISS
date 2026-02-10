import React, { useState } from 'react';

const SwitchButton = (
    { isChecked,
        onChange,
        className,
        tags= false,
    }:
        {
            isChecked: boolean;
            onChange: (value: boolean) => void;
            className?: string
            tags?: boolean

        }) => {
    const handleToggle = () => {
        onChange(!isChecked);
    };

    return (
        <label className={`flex items-center justify-center cursor-pointer ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={handleToggle}
                />
                <div className={`w-8 h-4 bg-gray-400 rounded-full shadow-inner toggle__line ${isChecked ? 'bg-green-500' : ''}`}>

                </div>
                <div className={`toggle__dot absolute w-4 h-4 bg-white rounded-full shadow top-0 left-0 transition ${isChecked ? 'transform translate-x-full' : ''}`}></div>
            </div>
            <div className={`ml-3 text-white ${tags === false ? 'hidden' : ''}`}
            >Active status</div>
        </label>
    );
};

export default SwitchButton;
