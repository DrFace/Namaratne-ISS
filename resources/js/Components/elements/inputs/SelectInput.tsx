import Select from "react-select";
import makeAnimated from "react-select/animated";

interface SelectInputProps {
    options: { label: string; value: string }[];
    isFocused?: boolean;
    disabled?: boolean;
    className?: string;
    selectedOption?: any;
    setData?: any;
    placeholder?: string;
}

const SelectInput = ({
    options,
    selectedOption,
    className = "",
    isFocused = false,
    disabled = false,
    setData,
    placeholder = "Select an option",
    ...props
}: SelectInputProps) => {
    const animatedComponents = makeAnimated();

    const handleChange = (selectedOption: any) => {
        setData(selectedOption.value);
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
            styles={customStyles}
            className={
                'border-gray-300 placeholder:text-xs focus:border-indigo-500 focus:ring-indigo-500 rounded-md  ' +
                className
            }
            value={selectedOption}
            isDisabled={disabled}
            onChange={handleChange}
            options={options}
            components={animatedComponents}
            placeholder={placeholder}
        />
    );
};

export default SelectInput;
