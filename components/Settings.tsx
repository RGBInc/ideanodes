import React, { useState, useRef } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { User, Camera, Loader2, Lock } from "lucide-react";
import { SimpleHeader } from "./SimpleHeader";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.getProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const updateName = useMutation(api.users.updateName);
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [newName, setNewName] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize name once user data is loaded
  React.useEffect(() => {
    if (user && !hasInitialized) {
      setNewName(user.name || "");
      setHasInitialized(true);
    }
  }, [user, hasInitialized]);

  // Handle Auth & Loading States
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || user === undefined) {
    return (
      <>
        <SimpleHeader />
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      </>
    );
  }

  if (!user) return null; // Should be handled by redirect, but safe fallback

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateAvatar({ storageId });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
     if (newName && newName !== user.name) {
       await updateName({ name: newName });
     }
     // Show success feedback or redirect if needed
     alert("Settings saved successfully!");
  };

  return (
    <>
      <SimpleHeader />
      <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Settings</h1>
        
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 flex flex-col shrink-0">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Profile</h2>
              <p className="text-xs text-zinc-500 mb-6">Manage your public profile</p>
              
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white">
                  General
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8">
              <div className="space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-inner">
                      {user.image ? (
                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-zinc-400" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white backdrop-blur-sm"
                    >
                      {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-zinc-900 dark:text-white">Profile Photo</h3>
                    <p className="text-sm text-zinc-500 mt-1">Click the image to upload a new photo.</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={user.name || "Your Name"}
                    className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                  />
                </div>
                
                {/* Note about password */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex gap-3">
                  <Lock size={18} className="text-zinc-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    To change your password, please sign out and use the "Forgot Password" flow or sign up with a new method.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 font-medium shadow-sm transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
