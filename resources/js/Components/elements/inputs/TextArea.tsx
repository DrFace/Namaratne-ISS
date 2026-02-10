import { forwardRef, useEffect, useImperativeHandle, useRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export default forwardRef(function TextArea(
    {
        className = "",
        isFocused = false,
        ...props
    }: TextareaHTMLAttributes<HTMLTextAreaElement> & { isFocused?: boolean },
    ref
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, []);

    return (
        <textarea
            {...props}
            ref={localRef}
            className={
                "border-gray-300 focus:border-primary focus:ring-0.5 focus:ring-primary rounded-md shadow-sm " +
                className
            }
        >{props.value}</textarea>
    );
});
