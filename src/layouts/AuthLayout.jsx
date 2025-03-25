import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl transform transition-all hover:scale-105">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}