import { LabelHTMLAttributes } from "react";

export default function InputLabel({
    value,
    className = "",
    children,
    required = false,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & {
    value?: string;
    required?: boolean;
}) {
    return (
        <label
            {...props}
            className={`block font-[700] text-sm text-gray-800 ` + className}
        >
            {value ? value : children}
            {required && <span className="text-red-500">*</span>}
        </label>
    );
}
