export function successResponse(data, message) {
    return { success: true, data, message };
}
export function errorResponse(message, code) {
    return { success: false, message, code };
}
