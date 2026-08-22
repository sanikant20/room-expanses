export const errorHandler = (err, req, res, next) => {
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${err.statusCode || 500}: ${err.message}`);
    // Stack traces only for server faults (4xx are expected client errors).
    if (!err.statusCode || err.statusCode >= 500) {
        console.error(err.stack);
    }
    return res.status(err.statusCode || 500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: err.message,
        errors: err.errors || [],
    });
};
