import { FC } from 'react';

interface CustomRadioButtonProps {
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  label: string;
  labelClassName?: string;
  buttonClassName?: string;
}

const CustomRadioButton: FC<CustomRadioButtonProps> = ({
  value,
  selectedValue,
  onChange,
  label,
  labelClassName = '',
  buttonClassName = ''
}) => {
  return (
    <label className={`flex items-center ${labelClassName}`}>
      <button
        type="button"
        onClick={() => onChange(value)}
        className={`flex items-center justify-center w-5 h-5  border-2   rounded-full ${selectedValue === value ? "border-primary" : "border-gray-300"} ${buttonClassName}`}
      >
        {selectedValue === value && (
          <div className="w-1.5 h-1.5 rounded-xs bg-primary "></div>
        )}
      </button>
      <span className="ml-2 font-medium font-Inter">{label}</span>
    </label>
  );
}

export default CustomRadioButton;
