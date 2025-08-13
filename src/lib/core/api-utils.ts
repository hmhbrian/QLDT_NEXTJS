
/**
 * Extracts a user-friendly error message from various error types.
 * @param error The error object, which can be of any type.
 * @returns A user-friendly error string.
 */
export function extractErrorMessage(error: unknown): string {
    // If the error is already a string, return it directly
    if (typeof error === 'string') {
        return error;
    }

    // Check if it's a standard Error object
    if (error instanceof Error) {
        // Look for a 'cause' property which might contain the original error
        if (error.cause && typeof error.cause === 'object') {
            const cause = error.cause as any;
            if (cause.response?.data) {
                return extractApiError(cause.response.data);
            }
        }
        return error.message;
    }

    // Check for API-like error structures
    if (error && typeof error === 'object') {
        const apiError = error as any;

        // Check for axios-like error structure
        if (apiError.response?.data) {
            return extractApiError(apiError.response.data);
        }

        // Check for direct API response structure
        if ('success' in apiError && 'message' in apiError) {
            return extractApiError(apiError);
        }
    }

    // Fallback for unknown error types
    try {
        const stringifiedError = JSON.stringify(error);
        return stringifiedError !== '{}' ? stringifiedError : "An unknown error occurred.";
    } catch {
        return "An unknown, non-serializable error occurred.";
    }
}

/**
 * Helper function to parse structured API error responses.
 * @param responseData The data object from the API response.
 * @returns A formatted error message string.
 */
function extractApiError(responseData: any): string {
    // Prioritize the `detail` field, often used for business logic errors
    if (responseData.detail && typeof responseData.detail === 'string') {
        return responseData.detail;
    }

    // For .NET validation errors with a structured 'errors' object
    if (responseData.errors && typeof responseData.errors === 'object') {
        const validationErrors = Object.entries(responseData.errors)
            .map(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                    // Capitalize field and join messages
                    const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
                    return `${capitalizedField}: ${messages.join(", ")}`;
                }
                return null;
            })
            .filter(Boolean); // Remove null entries

        if (validationErrors.length > 0) {
            return validationErrors.join("\n");
        }
    }

    // Use title or message as fallback
    if (responseData.title && typeof responseData.title === 'string') {
        return responseData.title;
    }
    if (responseData.message && typeof responseData.message === 'string') {
        return responseData.message;
    }

    // Fallback for string errors
    if (typeof responseData === 'string') {
        return responseData;
    }

    return "Có lỗi xảy ra khi xử lý yêu cầu.";
}
