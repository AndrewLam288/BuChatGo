import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token and store it in a cookie
 * Expires in 10 days, user needs to login once again after 10 days
 */

export const generateToken = (userId, res) => {

    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "10d"
    });

    res.cookie("jwt", token, {
        maxAge: 10 * 24 * 60 * 60 * 1000, // For milliseconds for 10 day
        httpOnly: true, // Prevent XSS attacks more secure
        sameSize: true, // Prevent CSRF attacks more secure
        secure: process.env.NODE_ENV !== "development"
    })

    return token;
}