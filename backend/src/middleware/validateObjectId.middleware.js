import mongoose from "mongoose";

// Reject malformed ids up front. Otherwise Mongoose throws a CastError
// inside the controller and the client gets a 500 for its own bad input.
export const validateObjectId = (paramName) => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[paramName])) {
        return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
};
