import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUsersForSidebar = async (req, res) => {

    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUser}}).select("-password");
        
        res.status(200).json(filteredUsers);

        // For debugging purpose, on the sever side
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }

};

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ]
        })
        
        res.status(200).json(messages);

        // For debugging purpose, on the sever side
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const sendMessage = async (req, res) => { 
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message ({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })
        
        await newMessage.save();    

        // real time functionality here
        res.status(201).json(newMessage);
        
        // For debugging purpose, on the sever side
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};