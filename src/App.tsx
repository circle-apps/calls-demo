import { useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo, User, StreamTheme, Call } from '@stream-io/video-react-sdk';
import { v4 as uuidv4 } from 'uuid';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import './style.css';

import { UserIdButton } from './components/UserIdButton';
import { CallOptions } from './components/CallOptions';
import { IncomingCalls } from './components/IncomingCalls';
import { RingUsersForm } from './components/RingUsersForm';
import { CreateRoom } from './components/CreateRoom';
import { CallPage } from './components/CallPage';

const API_KEY = 'hd8szvscpxvd';

// Generate a new user ID for each session/tab
const generateUserId = () => {
  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const userIdFromUrl = urlParams.get('userId');
  if (userIdFromUrl) {
    return userIdFromUrl;
  }

  // Generate a new ID if not in URL
  const newUserId = uuidv4();

  // Update URL with the new ID
  const url = new URL(window.location.href);
  url.searchParams.set('userId', newUserId);
  window.history.replaceState({}, '', url.toString());

  return newUserId;
};

type AppView = 'options' | 'ring-users' | 'create-room' | 'in-call';

export default function App() {
  // Move userId into state to ensure it's stable across renders
  const [userId] = useState(generateUserId);
  const [client, setClient] = useState<StreamVideoClient>();
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('options');
  const [activeCall, setActiveCall] = useState<Call>();

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Check for callId in URL and join the call if present
  useEffect(() => {
    if (!client) return;

    const urlParams = new URLSearchParams(window.location.search);
    const callId = urlParams.get('callId');

    if (callId) {
      const joinCall = async () => {
        try {
          const call = client.call('default', callId);
          await call.join({ create: true });
          setActiveCall(call);
          setCurrentView('in-call');
        } catch (err) {
          console.error('Failed to join call from URL:', err);
        }
      };
      joinCall();
    }
  }, [client]);

  useEffect(() => {
    const tokenProvider = async () => {
      const { token } = await fetch(
        'https://pronto.getstream.io/api/auth/create-token?' +
          new URLSearchParams({
            api_key: API_KEY,
            user_id: userId,
          }),
      ).then((res) => res.json());
      return token as string;
    };

    const user: User = {
      id: userId,
      name: `User-${userId.slice(0, 6)}`,
      image: `https://getstream.io/random_svg/?id=${userId}`,
    };

    const myClient = new StreamVideoClient({
      apiKey: API_KEY,
      user,
      tokenProvider,
    });

    setClient(myClient);

    return () => {
      myClient.disconnectUser();
      setClient(undefined);
    };
  }, [userId]);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Connecting to Stream...</p>
        </div>
      </div>
    );
  }

  const handleCallStarted = (call: Call) => {
    setActiveCall(call);
    setCurrentView('in-call');
  };

  const handleCallEnded = () => {
    // Clean up the call state
    setActiveCall(undefined);
    setCurrentView('options');

    // Remove callId from URL if present
    const url = new URL(window.location.href);
    url.searchParams.delete('callId');
    window.history.replaceState({}, '', url.toString());

    // Force a re-render of the main UI
    setTimeout(() => {
      setCurrentView('options');
    }, 0);
  };

  // If we're in a call, show only the call UI
  if (currentView === 'in-call' && activeCall) {
    return (
      <StreamVideo client={client}>
        <StreamTheme>
          <CallPage call={activeCall} onLeave={handleCallEnded} />
        </StreamTheme>
      </StreamVideo>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <div className="min-h-screen bg-gray-900">
          {currentView === 'ring-users' ? (
            <RingUsersForm
              client={client}
              currentUserId={userId}
              onCallStarted={handleCallStarted}
              onBack={() => setCurrentView('options')}
            />
          ) : currentView === 'create-room' ? (
            <CreateRoom
              client={client}
              currentUserId={userId}
              onCallStarted={handleCallStarted}
              onBack={() => setCurrentView('options')}
            />
          ) : (
            <>
              <CallOptions onRingUsers={() => setCurrentView('ring-users')} onCreateRoom={() => setCurrentView('create-room')} />
              <IncomingCalls onCallAccepted={handleCallStarted} />
            </>
          )}

          <UserIdButton userId={userId} onCopy={copyUserId} />

          {showCopiedToast && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
              ID copied to clipboard!
            </div>
          )}
        </div>
      </StreamTheme>
    </StreamVideo>
  );
}
