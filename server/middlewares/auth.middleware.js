import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';
import { config } from "dotenv"
config();

const isLoggedIn =async (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return next(new AppError('Unauthenticated, please login again',401));
    }
    try{
    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();

    }catch (err) {
        // Handle token decoding errors
        return next(new AppError('Invalid token, please login again', 401));
    }
}

const authorizedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = await req.user.role;
    if (!roles.includes(currentUserRoles)) {
        return next(
            new AppError('You do not have permission to access this route', 403)
        )
    }
    next();
}

const authorizeSubscriber = async(req, res, next) => {
    const user = await User.findById(req.user.id);
    // const subscription = req.user.subscripiton;
    // const currentUserRole = req.user.role;
    if(user.role !== 'ADMIN' && user.subscription.status !== 'active'){
        return AppError('Please subscribe to access this route!', 403)
    }

    next();
}

export {
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}