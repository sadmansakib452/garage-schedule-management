"use client"

/**
 * Authentication Modal Component
 *
 * This modal handles API token collection from the user.
 * It's the first screen users see and is required to access
 * the garage scheduling functionality.
 */

import type React from "react"
import { Key, ArrowRight } from "lucide-react"
import { BRAND_COLOR } from "./types"

interface AuthModalProps {
  token: string
  setToken: (token: string) => void
  onProceed: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ token, setToken, onProceed }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onProceed()
  }

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Garage Schedule Manager</h1>
          <p className="text-gray-600">Enter your API token to access the scheduling system</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              API Token
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your JWT token"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: BRAND_COLOR }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Your token is stored locally and used only for API authentication</p>
        </div>
      </div>
    </div>
  )
}
