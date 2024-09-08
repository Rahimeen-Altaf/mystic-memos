type JsonResponseOptions = {
    success: boolean;
    message?: string;
    status: number;
    dataName?: string; // Name of the key
    dataValue?: any; // Value for that key
};

export const sendJsonResponse = (
    { success, message, status, dataName, dataValue }: JsonResponseOptions
) => {
    return Response.json({
        success,
        ...(message && { message }),
        ...(dataName && dataValue && { [dataName]: dataValue }), // Dynamic key
    },
        {
            status,
        });
};
