import { Call, CallingState, StreamCall, RingingCall, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useCalls } from '@stream-io/video-react-bindings';
import { useEffect } from 'react';

interface IncomingCallsProps {
  onCallAccepted: (call: Call) => void;
}

const IncomingCallUI = ({ onAccepted }: { onAccepted: () => void }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // Monitor call state for when it's joined
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      onAccepted();
    }
  }, [callingState, onAccepted]);

  if (callingState === CallingState.RINGING) {
    return <RingingCall />;
  }

  return null;
};

export const IncomingCalls = ({ onCallAccepted }: IncomingCallsProps) => {
  const calls = useCalls();
  const incomingCalls = calls.filter((call) => call.isCreatedByMe === false && call.state.callingState === CallingState.RINGING);

  if (incomingCalls.length === 0) {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">Waiting for incoming calls...</div>
    );
  }

  return incomingCalls.map((call) => (
    <StreamCall call={call} key={call.cid}>
      <IncomingCallUI onAccepted={() => onCallAccepted(call)} />
    </StreamCall>
  ));
};
