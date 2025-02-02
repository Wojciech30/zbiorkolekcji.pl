export const handleApiError = (error) => {
    const message = error.response?.data?.message || "Błąd serwera";
    console.error(`API Error: ${message}`, error);
    throw new Error(message);
};