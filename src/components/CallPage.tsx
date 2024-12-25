import {
  Call,
  StreamCall,
  SpeakerLayout,
  CallControls,
  CallingState,
  useCallStateHooks,
  useCall,
  StreamTheme,
} from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';

interface CallPageProps {
  call: Call;
  onLeave: () => void;
}

const ShareLinkButton = ({ callId }: { callId: string }) => {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const copyLink = async () => {
    try {
      // Create URL without userId parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('userId'); // Remove userId if present
      url.searchParams.set('callId', callId);
      await navigator.clipboard.writeText(url.toString());
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={copyLink}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share Link
      </button>
      {showCopiedToast && (
        <div className="absolute bottom-full right-0 mb-2 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
          Link copied!
        </div>
      )}
    </div>
  );
};

export const CallPage = ({ call, onLeave }: CallPageProps) => {
  // Handle call cleanup when leaving
  const handleLeave = async () => {
    try {
      // Only try to leave if the call is still active
      if (call.state.callingState !== CallingState.LEFT) {
        await call.leave();
      }
      onLeave();
    } catch (err) {
      console.error('Failed to leave call:', err);
      // Even if the leave call fails, we should still trigger onLeave
      onLeave();
    }
  };

  return (
    <StreamCall call={call}>
      <CallPageContent onLeave={handleLeave} />
    </StreamCall>
  );
};

const CallPageContent = ({ onLeave }: { onLeave: () => Promise<void> }) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // Automatically trigger leave when call state changes to LEFT
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onLeave();
    }
  }, [callingState, onLeave]);

  if (!call) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing call...</p>
        </div>
      </div>
    );
  }

  if (callingState === CallingState.LEFT) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 text-center">
          <p className="text-gray-300">Call ended</p>
        </div>
      </div>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="h-screen flex flex-col bg-gray-900">
        <div className="flex-1 relative">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>
        <div className="relative z-10">
          <CallControls onLeave={onLeave} />
        </div>
        <ShareLinkButton callId={call.id} />
      </div>
    </StreamTheme>
  );
};
