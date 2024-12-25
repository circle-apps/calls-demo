import { Call, CallControls, SpeakerLayout, StreamCall } from '@stream-io/video-react-sdk';

interface ActiveCallProps {
  call: Call;
}

export const ActiveCall = ({ call }: ActiveCallProps) => {
  return (
    <StreamCall call={call}>
      <div className="h-screen flex flex-col">
        <SpeakerLayout />
        <div className="mt-auto">
          <CallControls />
        </div>
      </div>
    </StreamCall>
  );
};
