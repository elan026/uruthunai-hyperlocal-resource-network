/**
 * Global error handler middleware
 * Catches all unhandled errors from controllers and returns a clean JSON response.
 */
const errorHandler = (err, req, res, next) => {
    console.error('--- Error ---');
    console.error(`${req.method} ${req.originalUrl}`);
    console.error(err.stack || err.message);
    console.error('-------------');

    // MySQL duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Duplicate entry',
            details: 'A record with this value already exists.'
        });
    }

    // MySQL foreign key constraint
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Invalid reference',
            details: 'The referenced record does not exist.'
        });
    }

    // Validation errors
    if (err.status === 400) {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.message
        });
    }

    // Default: Internal Server Error
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.'
    });
};

module.exports = errorHandler;
