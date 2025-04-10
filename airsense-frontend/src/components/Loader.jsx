import { Settings } from 'lucide-react';

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <Settings className="w-12 h-12 text-blue-500 animate-spin" />
    <span className="ml-3 text-lg font-medium text-gray-700">Loading...</span>
  </div>
);