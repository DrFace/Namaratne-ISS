import { forwardRef, useEffect, useImperativeHandle, useRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export default forwardRef(function MessageArea(
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
                "border-white focus:border-white focus:ring-0.5 focus:ring-white rounded-md shadow-sm " +
                className
            }
        >{props.value}</textarea>
    );
});
