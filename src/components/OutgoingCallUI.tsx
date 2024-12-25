import { useCallback } from 'react';
import { Call, CallingState, useCallStateHooks, StreamCall } from '@stream-io/video-react-sdk';

interface OutgoingCallUIProps {
  call: Call;
  onCancel: () => void;
}

const OutgoingCallContent = ({ onCancel }: { onCancel: () => void }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.RINGING) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Calling...</h3>
          <p className="text-gray-400 mb-6">Waiting for answer</p>

          <button onClick={onCancel} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Cancel Call
          </button>
        </div>
      </div>
    </div>
  );
};

export const OutgoingCallUI = ({ call, onCancel }: OutgoingCallUIProps) => {
  return (
    <StreamCall call={call}>
      <OutgoingCallContent onCancel={onCancel} />
    </StreamCall>
  );
};
