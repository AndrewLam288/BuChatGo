import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const{fullName, email, password} = req.body;
    try {
        // Signup with invalid password 400 error
        if (password.length < 8) {
            return res.status(400).json({message: "Account password must be at least 8 characters long"});
        }

        // Signup with already exits email 400 error
        const user = await User.findOne({email});
        if (user) {
            return res.status(400).json({message: "Account with this email already exists"}); 
        }
        
        // Hash the user password, don't want to display their password for secure
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User ({
            fullName,
            email,
            password: hashedPassword,
            profilePicture: "/cat.png"
        });

        if(newUser) {
            // res response to send cookies in the response
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePicture: newUser.profilePic,
            });

        } else {
            return res.status(400).json({message: "Invalid user data"});
        }
        
        // catch error for debugging, this should be server side error
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      generateToken(user._id, res);
  
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const logout = (req, res) => {
    try {
        // successfully logout
        res.cookie("jwt","", {maxAge: 0});
        res.status(200).json({message: "Logout successful"});

        // catch error for debugging, this should be server
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body; // Ensure this matches the frontend
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Must upload profile picture" });
        }

        let updatedProfilePic;

        // If the image is a Base64-encoded image, upload to Cloudinary
        if (profilePic.startsWith("data:image")) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updatedProfilePic = uploadResponse.secure_url;
        } 
        // If the image is a predefined default image (URL), save it directly
        else if (profilePic.startsWith("http") || profilePic.startsWith("/")) {
            updatedProfilePic = profilePic; 
        } 
        else {
            return res.status(400).json({ message: "Invalid image format" });
        }

        // Update user profile picture in database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: updatedProfilePic }, // Ensure this matches the User model
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);

        // catch error for debugging, this should be server
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};