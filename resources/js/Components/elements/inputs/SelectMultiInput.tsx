import React, { useEffect } from 'react';
import Select from "react-select";
import makeAnimated from "react-select/animated";

interface SelectMultiInputProps {
    options: { label: string; value: string }[];
    isFocused?: boolean;
    className?: string;
    disabled?: boolean;
    selectedOption?: any;
    setData?: any;
    placeholder?: string;
}

const SelectMultiInput = ({
    options,
    selectedOption,
    className = "",
    isFocused = false,
    disabled = false,
    setData,
    placeholder = "Select options",
    ...props
}: SelectMultiInputProps) => {
    const animatedComponents = makeAnimated();

    const handleChange = (selectedOption: any) => {
        const array: any = [];
        selectedOption.map((item: any) => {
            array.push(item.value);
        });

        setData(array);
    };

    const customStyles = {
        //rounded xl style
        control: (provided: any) => ({
            ...provided,
            borderRadius: "0.75rem",
        }),
        //placeholder:text-xs
        placeholder: (provided: any) => ({
            ...provided,
            fontSize: "0.75rem",
        }),

    };


    return (
        <Select
            {...props}
            className={
                'border-gray-300 placeholder:text-xs focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            styles={customStyles}
            value={selectedOption}
            onChange={handleChange}
            isDisabled={disabled}
            options={options}
            components={animatedComponents}
             placeholder={placeholder}
            isMulti
        />
    );
};

export default SelectMultiInput;
