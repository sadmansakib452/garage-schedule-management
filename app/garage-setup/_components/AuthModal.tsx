"use client";

/**
 * Authentication Modal Component
 *
 * This modal handles API token collection from the user.
 * It's the first screen users see and is required to access
 * the garage scheduling functionality.
 */

import type React from "react";
import { Key, ArrowRight, Settings } from "lucide-react";
import { BRAND_COLOR } from "./types";

interface AuthModalProps {
  token: string;
  setToken: (token: string) => void;
  onProceed: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  token,
  setToken,
  onProceed,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4"
      suppressHydrationWarning
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        suppressHydrationWarning
      >
        <div className="text-center mb-8" suppressHydrationWarning>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: BRAND_COLOR }}
            suppressHydrationWarning
          >
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Garage Setup
          </h2>
          <p className="text-gray-600">
            Enter your API token to configure your garage scheduling system
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          suppressHydrationWarning
        >
          <div suppressHydrationWarning>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              API Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your API token"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Proceed
          </button>
        </form>

        <div className="mt-6 text-center" suppressHydrationWarning>
          <p className="text-sm text-gray-500">
            Don't have an API token? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
