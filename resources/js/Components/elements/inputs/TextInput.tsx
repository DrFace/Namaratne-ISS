import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, InputHTMLAttributes } from 'react';


interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isFocused?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { type = 'text', className = '', isFocused = false, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={type === 'password' && showPassword ? 'text' : type}
        className={
          'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-3xl shadow-sm ' +
          className
        }
        ref={localRef}
      />
      {type === 'password' && (
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 cursor-pointer"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeIcon className="w-8 h-5 text-gray-500 bg-white" />
          ) : (
            <EyeSlashIcon className="w-8 h-5 text-gray-500 bg-white" />
          )}
        </div>
      )}
    </div>
  );
});

export default TextInput;
