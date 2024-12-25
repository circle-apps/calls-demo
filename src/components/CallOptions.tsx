interface CallOptionsProps {
  onRingUsers: () => void;
  onCreateRoom: () => void;
}

export const CallOptions = ({ onRingUsers, onCreateRoom }: CallOptionsProps) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">Choose Call Type</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center hover:bg-gray-700 border border-gray-700"
            onClick={onRingUsers}
          >
            <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-white">Ring Users</h2>
            <p className="text-gray-400 text-center">Call specific users directly</p>
          </button>

          <button
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center hover:bg-gray-700 border border-gray-700"
            onClick={onCreateRoom}
          >
            <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-white">Create Room</h2>
            <p className="text-gray-400 text-center">Create a room with a shareable link</p>
          </button>
        </div>
      </div>
    </div>
  );
};
