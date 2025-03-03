
import { create } from "zustand";
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useChatStore } from './useChatStore';
import { io } from 'socket.io-client';

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success("Account Created Successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
      // Set selectedUser to null after successful login
      useChatStore.getState().setSelectedUser(null);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data }); // update the authUser state with the new data
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    let socket = get().socket;
  
    if (!authUser || (socket && socket.connected)) return;
  
    socket = io(BASE_URL, {
      query: {
        userId: authUser._id
      },
    });
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    
    set({ socket: socket });

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    })
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); 
    
  }

  
}));