import { useState, useEffect } from 'react';
import { Call, StreamVideoClient } from '@stream-io/video-react-sdk';

interface CreateRoomProps {
  client: StreamVideoClient;
  currentUserId: string;
  onCallStarted: (call: Call) => void;
  onBack: () => void;
}

export const CreateRoom = ({ client, onCallStarted, onBack }: CreateRoomProps) => {
  const [isCreating, setIsCreating] = useState(true);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [error, setError] = useState<string>();
  const [currentCall, setCurrentCall] = useState<Call>();
  const [roomLink, setRoomLink] = useState<string>();

  const createRoom = async () => {
    if (!client) return;

    setIsCreating(true);
    setError(undefined);

    try {
      const callId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const call = client.call('default', callId);

      await call.getOrCreate();
      setCurrentCall(call);

      // Create shareable link without userId
      const url = new URL(window.location.href);
      url.searchParams.delete('userId'); // Remove userId if present
      url.searchParams.set('callId', callId);
      setRoomLink(url.toString());

      // Copy link automatically
      await navigator.clipboard.writeText(url.toString());
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
    setIsCreating(false);
  };

  // Create room automatically when component mounts
  useEffect(() => {
    createRoom();
  }, []);

  const copyLink = async () => {
    if (!roomLink) return;
    try {
      await navigator.clipboard.writeText(roomLink);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const joinRoom = async () => {
    if (!currentCall) return;
    try {
      await currentCall.join({ create: true });
      onCallStarted(currentCall);
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="mr-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Create Room</h2>
      </div>

      <div className="space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg">{error}</div>}

        {isCreating ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Creating Room...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Room Link:</p>
                <button
                  onClick={copyLink}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-300 rounded p-3 break-all font-mono text-sm">{roomLink}</div>
            </div>

            <div className="text-center">
              <button
                onClick={joinRoom}
                className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors w-full"
              >
                Join Room Now
              </button>
              <p className="mt-2 text-sm text-gray-400">Share this link with others to invite them to the room</p>
            </div>
          </div>
        )}

        {showCopiedToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
            Link copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};
