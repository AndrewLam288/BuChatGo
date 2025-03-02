import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import { toast } from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [hideImageButton, setHideImageButton] = useState(false); // Controls Image button visibility
  const fileInputRef = useRef();
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {    
      toast.error("Please select an image file", { icon: "🚫" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) return;

    try {
      // If both image and text exist, send them as separate messages
      if (imagePreview) {
        await sendMessage({ text: "", image: imagePreview }); // Send image first
      }

      if (text.trim()) {
        await sendMessage({ text: text.trim(), image: "" }); // Send text separately
      }

      // Reset input & show Image button again
      setText("");
      setImagePreview(null);
      setHideImageButton(false); // Make Image button reappear smoothly
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
        {/* Image Upload Button with Smooth Slide-Out Effect */}
        <div
          className={`transition-all duration-300 transform ${
            hideImageButton ? "-translate-x-14 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <button
            type="button"
            className={`btn btn-circle 
                       ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        {/* Hidden file input for uploading images */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Chat Input Field - Expands to the left when Image Button disappears */}
        <input
          type="text"
          className={`input input-bordered rounded-lg input-sm sm:input-md transition-all duration-300 ${
            hideImageButton ? "ml-[-40px] w-full" : "ml-0 w-[85%]"
          }`}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setHideImageButton(e.target.value.length > 0); // Hide Image button when typing
          }}
        />

        {/* Send Button (Always on the Right) */}
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
