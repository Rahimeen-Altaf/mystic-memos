type JsonResponseOptions = {
    success: boolean;
    message: string;
    status: number;
    data?: object;
};

export const sendJsonResponse = (
    { success, message, status, data }: JsonResponseOptions
) => {
    return Response.json({
        success,
        message,
        ...(data && { data }),
    },
        {
            status,
        });
};
