import DangerAlert from "@/Components/elements/alerts/DangerAlert";
import SuccessAlert from "@/Components/elements/alerts/SuccessAlert";

type FlashMessages = {
    success?: string | [string, string];
    error?: string | [string, string];
};

export default function FlashAlerts({ flash }: { flash: FlashMessages }) {
    const isSuccessArray = Array.isArray(flash?.success);
    const isErrorArray = Array.isArray(flash?.error);

    const successMessage: string | undefined = isSuccessArray
        ? flash.success?.[0]
        : (flash?.success as string | undefined);

    const successKey: string | number | undefined = isSuccessArray
        ? flash.success?.[1]
        : undefined; // don't reuse the message as key

    const errorMessage: string | undefined = isErrorArray
        ? flash.error?.[0]
        : (flash?.error as string | undefined);

    const errorKey: string | number | undefined = isErrorArray
        ? flash.error?.[1]
        : undefined;

    return (
        <>
            {successMessage && (
                <SuccessAlert
                    key={successKey ?? "success-alert"}
                    title="Success"
                    message={successMessage}
                />
            )}

            {errorMessage && (
                <DangerAlert
                    key={errorKey ?? "error-alert"}
                    title="Error"
                    message={errorMessage}
                />
            )}
        </>
    );
}
