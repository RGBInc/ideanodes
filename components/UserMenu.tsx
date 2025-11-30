import React, { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getProfile);

  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative z-50 shrink-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-full transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {user.image ? (
            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-zinc-400" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50 ring-1 ring-black/5">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user.name || "User"}</p>
              <p className="text-xs text-zinc-500 truncate font-medium">{user.email}</p>
            </div>
            
            <Link 
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-3 transition-colors"
            >
              <SettingsIcon size={16} className="text-zinc-400" /> Settings
            </Link>
            
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
            
            <button 
              onClick={() => signOut()}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
