import { useState, useEffect } from 'react';
import { Call, StreamVideoClient, CallingState } from '@stream-io/video-react-sdk';
import { OutgoingCallUI } from './OutgoingCallUI';

interface RingUsersFormProps {
  client: StreamVideoClient;
  currentUserId: string;
  onCallStarted: (call: Call) => void;
  onBack: () => void;
}

export const RingUsersForm = ({ client, currentUserId, onCallStarted, onBack }: RingUsersFormProps) => {
  const [userIds, setUserIds] = useState<string[]>(['']);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [error, setError] = useState<string>();
  const [currentCall, setCurrentCall] = useState<Call>();

  // Monitor call state changes
  useEffect(() => {
    if (!currentCall) return;

    const checkCallState = () => {
      const state = currentCall.state.callingState;

      switch (state) {
        case CallingState.JOINED:
          onCallStarted(currentCall);
          break;
        case CallingState.LEFT:
          setError('Call ended');
          setCurrentCall(undefined);
          setIsInitiatingCall(false);
          break;
      }
    };

    // Initial check
    checkCallState();

    // Set up polling for state changes
    const interval = setInterval(() => {
      // Check if the call was ended by the other participant
      if (currentCall.state.endedAt) {
        setError('Call was ended by other participant');
        setCurrentCall(undefined);
        setIsInitiatingCall(false);
        clearInterval(interval);
        return;
      }
      checkCallState();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentCall, onCallStarted]);

  const handleAddUser = () => {
    setUserIds([...userIds, '']);
    setError(undefined);
  };

  const handleRemoveUser = (index: number) => {
    setUserIds(userIds.filter((_, i) => i !== index));
    setError(undefined);
  };

  const handleUserIdChange = (index: number, value: string) => {
    const newUserIds = [...userIds];
    newUserIds[index] = value;
    setUserIds(newUserIds);
    setError(undefined);
  };

  const handleCancelCall = async () => {
    if (currentCall) {
      try {
        await currentCall.leave();
        setCurrentCall(undefined);
        setIsInitiatingCall(false);
      } catch (err) {
        console.error('Failed to cancel call:', err);
      }
    }
  };

  const initiateRingCall = async () => {
    if (!client || userIds.every((id) => !id.trim())) return;

    // Get unique, non-empty user IDs (excluding current user)
    const uniqueUserIds = [...new Set(userIds.map((id) => id.trim()).filter((id) => id && id !== currentUserId))];

    if (uniqueUserIds.length === 0) {
      setError('Please enter at least one valid user ID');
      return;
    }

    setIsInitiatingCall(true);
    setError(undefined);

    try {
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const call = client.call('default', callId);

      // First create the call with unique members
      await call.getOrCreate({
        ring: true,
        data: {
          members: [{ user_id: currentUserId }, ...uniqueUserIds.map((id) => ({ user_id: id }))],
        },
      });

      setCurrentCall(call);
    } catch (err) {
      console.error('Failed to initiate call:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate call');
      setIsInitiatingCall(false);
    }
  };

  // Show outgoing call UI when call is ringing
  if (currentCall) {
    return <OutgoingCallUI call={currentCall} onCancel={handleCancelCall} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="mr-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Ring Users</h2>
      </div>

      <div className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg">{error}</div>}

        {userIds.map((userId, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => handleUserIdChange(index, e.target.value)}
              placeholder="Enter user ID"
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {userIds.length > 1 && (
              <button
                onClick={() => handleRemoveUser(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove user"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAddUser}
          className="w-full bg-gray-800 text-gray-400 border border-gray-700 rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors"
        >
          + Add Another User
        </button>

        <div className="flex gap-4 mt-8">
          <button
            onClick={initiateRingCall}
            disabled={isInitiatingCall || userIds.every((id) => !id.trim())}
            className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitiatingCall ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Initiating Call...
              </div>
            ) : (
              'Start Call'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
