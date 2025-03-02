import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 10,
        },
        profilePic: {
            type: String,
            default: "/cat.png",
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
