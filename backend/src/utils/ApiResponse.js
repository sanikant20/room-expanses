class ApiResponse {
    constructor(statusCode, data = null, message = "Success", totalRecords = null) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
        if (totalRecords !== null && totalRecords !== undefined) {
            this.totalRecords = totalRecords;
        }
    }
}

export { ApiResponse };