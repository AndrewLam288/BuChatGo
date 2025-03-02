import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, X } from "lucide-react";
import { useState } from "react";

export const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(authUser.profilePic || "/cat.png");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal

  // Predefined default images
  const defaultImages = [
    "/cat.png", // This should be the default profile pic when account is created
    "/bear.png",
    "/cow.png",
    "/duck.png",
    "/giraffe.png",
    "/hen.png",
    "/koala.png",
    "/panda.png",
    "/penguin.png",
    "/pig.png",
    "/puffer-fish.png",
    "/rabbit.png",
    "/shark.png",
  ];

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
      setIsModalOpen(false); // Close modal after selecting
    };
  };

  // Select a predefined avatar
  const handleSelectDefaultImage = async (image) => {
    const fullImageUrl = `${window.location.origin}${image}`; // Convert to full URL

    try {
      setSelectedImg(fullImageUrl); // Update frontend instantly
      await updateProfile({ profilePic: fullImageUrl }); // Send full URL instead of relative path
      setIsModalOpen(false); // Close modal after selecting
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Your Profile</h1>
            <p className="mt-2">Your Private Hideout</p>
          </div>

          {/* Uploading Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Picture Profile Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Profile Info Section */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Joined Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Selecting Profile Picture */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Profile Picture</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Default images selection */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-3">Choose Your Identity</h3>
              <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-40 p-2">
                {defaultImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Default ${index + 1}`}
                    className={`w-16 h-16 rounded-full cursor-pointer border-2 transition 
          ${selectedImg === img ? "border-green-500" : "border-transparent"}`}
                    onClick={() => handleSelectDefaultImage(img)}
                  />
                ))}
              </div>
            </div>

            {/* File Upload Option */}
            <label className="block text-center cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Upload from Device
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;