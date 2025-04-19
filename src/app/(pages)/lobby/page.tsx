'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import io from 'socket.io-client'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, Trophy, Users, Wifi, WifiOff } from 'lucide-react';
import sampleParagraphs from '@/data/sampleParagraphs';
import { toast } from "react-hot-toast";

interface Player {
  wpm: number;
  accuracy: number;
  progress?: number;
}

interface Players {
  [key: string]: Player;
}

interface RoomEvent {
  roomId: string;
  isAdmin?: boolean;
  text?: string;
  players?: Players;
}

// Define a type for the socket instance
type SocketType = ReturnType<typeof io>;

// Component to show socket connection status
const ConnectionStatus = ({ connected }: { connected: boolean }) => (
  <div className={`flex items-center gap-2 text-sm ${connected ? 'text-green-500' : 'text-red-500'}`}>
    {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
    <span>{connected ? 'Connected to server' : 'Disconnected'}</span>
  </div>
);

export default function TypingTest() {
  const [roomId, setRoomId] = useState<string>('');
  const [inputRoomId, setInputRoomId] = useState<string>('');
  const [players, setPlayers] = useState<Players>({});
  const [text, setText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [resultsDisplayed, setResultsDisplayed] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketRef = useRef<SocketType | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Always use the Render-deployed server
    const SOCKET_SERVER = 'https://typeblaze-socket-server.onrender.com';

    // Clean up previous socket instance if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket instance
    const socket = io(SOCKET_SERVER, {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
      setSocketError(null);
      toast.success('Connected to typing server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
      setSocketError(`Connection error: ${err.message}`);
      toast.error('Failed to connect to typing server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
      toast.error('Disconnected from typing server');
    });

    // Assign socket to ref
    socketRef.current = socket;

    // Setup other socket events
    setupSocketEvents(socket);

    // Clean up on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Setup socket event handlers
  const setupSocketEvents = (socket) => {
    socket.on('roomCreated', ({ roomId, isAdmin: adminStatus }: RoomEvent) => {
      setIsAdmin(adminStatus || false);
      toast.success(`Room created: ${roomId}`);
    });

    socket.on('roomJoined', ({ text: roomText, isAdmin: adminStatus }: RoomEvent) => {
      setIsAdmin(adminStatus || false);
      toast.success(`Joined room: ${roomId}`);
    });

    socket.on('updateLeaderboard', ({ players }: RoomEvent) => {
      setPlayers(players || {});
    });

    socket.on('playerJoined', ({ players }: RoomEvent) => {
      setPlayers(players || {});
      toast.success('A new player has joined!');
    });

    socket.on('countdown', ({ count }: { count: number }) => {
      setShowCountdown(true);
      setCountdown(count);
    });

    socket.on('startTyping', () => {
      setShowCountdown(false);
      setIsTestRunning(true);
      setTimeLeft(60);
      setTypedText('');
      toast.success('Go! Start typing');
    });

    socket.on('finalResults', ({ players }: RoomEvent) => {
      setPlayers(players || {});
      setIsTestRunning(false);
      setResultsDisplayed(true);
      toast.success('Typing test completed!');
    });

    socket.on('error', ({ message }: { message: string }) => {
      toast.error(message);
      setIsJoining(false);
    });
  };

  const createRoom = (): void => {
    if (!socketRef.current || !connected) {
      toast.error('Not connected to server');
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 9);
    setRoomId(newRoomId);
    socketRef.current.emit('createRoom', { roomId: newRoomId });
    toast.success('Creating room...');
  };

  const joinRoom = (): void => {
    if (!socketRef.current || !connected) {
      toast.error('Not connected to server');
      return;
    }

    if (!inputRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    setRoomId(inputRoomId);
    socketRef.current.emit('joinRoom', { roomId: inputRoomId });
    toast.success('Joining room...');
    
    setTimeout(() => {
      setIsJoining(false);
    }, 2000);
  };

  useEffect(() => {
    const paragraphs = sampleParagraphs.paragraphs.map(p => p.text);
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setText(randomParagraph);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTestRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTestRunning(false);
      setResultsDisplayed(true);
      if (timer) {
        clearInterval(timer);
      }
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTestRunning, timeLeft]);

  const handleTyping = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (!isTestRunning || !socketRef.current) return;
    
    const input = e.target.value;
    setTypedText(input);

    const correctChars = [...input].filter((char, idx) => char === text[idx]).length;
    const newAccuracy = (correctChars / input.length) * 100 || 100;
    const wordsTyped = input.length / 5;
    const newWpm = parseFloat((wordsTyped / ((60 - timeLeft) / 60)).toFixed(2));

    setWpm(newWpm);
    setAccuracy(newAccuracy);

    socketRef.current.emit('updateProgress', {
      roomId,
      typedText: input
    });
  };

  const startTest = (): void => {
    if (isAdmin && socketRef.current) {
      socketRef.current.emit('startTest', { roomId });
      toast.success('Starting test...');
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Typing Test Room</h1>
      
      {/* Connection status indicator */}
      <div className="flex justify-end mb-4">
        <ConnectionStatus connected={connected} />
      </div>
      
      {socketError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-600">
          {socketError}. Make sure the server is running at https://typeblaze-socket-server.onrender.com
        </div>
      )}
      
      <div className="flex flex-col gap-10">
        <div className='flex flex-col md:flex-row justify-between gap-2'>
          {!isTestRunning && <Card className='w-full md:w-1/2'>
            <CardHeader>
              <CardTitle>Room Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={createRoom} 
                  className="text-white text-xl hover:bg-gray-900 bg-gray-700"
                  disabled={!connected}
                >
                  Create Room
                </Button>
                {roomId && (
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-sm">Share this room ID with others:</p>
                    <p className="font-mono text-lg select-all">{roomId}</p>
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter Room ID"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    className='text-xl' 
                    variant="outline" 
                    onClick={joinRoom}
                    disabled={!connected || isJoining}
                  >
                    {isJoining ? "Joining" : "Join"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>}
          
          {!isTestRunning && <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px]">
                {Object.keys(players).length > 0 && (
                  <div className='flex justify-between text-sm font-semibold mb-2'>
                    <span className='ml-3'>Player ID</span>
                    <span className='mr-4'>Speed (WPM)</span>
                  </div>
                )}
                {Object.entries(players).map(([playerId, player]) => (
                  <div key={playerId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black rounded-lg">
                    <span className="font-medium text-sm">{playerId.slice(0, 6).toLowerCase()}</span>
                    <span className="text-sm">{player.wpm}</span>
                  </div>
                ))}
                {Object.keys(players).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No players yet. Create or join a room to see players here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>}
        </div>

        <Card className='border-none'>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Typing Test</CardTitle>
          </CardHeader>
          <CardContent>
            {showCountdown && (
              <div className="text-center">
                <h2 className="text-7xl font-extrabold mb-4">{countdown}</h2>
                <p className="text-lg text-muted-foreground">Get ready...</p>
              </div>
            )}
            {(isTestRunning || resultsDisplayed) && (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-lg font-medium">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6" />
                    <span>{timeLeft}s</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6" />
                    <span>{accuracy.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6" />
                    <span>{wpm} WPM</span>
                  </div>
                </div>
                <Progress
                  value={(typedText.length / text.length) * 100}
                  className="w-full h-4 rounded-full"
                />
                <div className="relative min-h-[500px] w-full rounded-lg bg-background p-4 font-mono text-xl md:text-3xl">
                  {/* Background sample text with red highlight for incorrect input */}
                  <div
                    className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words leading-relaxed tracking-wide"
                    style={{ wordSpacing: '0.25em' }}
                    aria-hidden="true"
                  >
                    {text.split('').map((char, index) => (
                      <span
                        key={index}
                        className={
                          index < typedText.length
                            ? typedText[index] === char
                              ? "text-blue-600"
                              : "text-red-500"
                            : "text-gray-500"
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </div>

                  {/* Input textarea */}
                  <textarea
                    value={typedText}
                    onChange={handleTyping}
                    className="relative min-h-[500px] h-full w-full text-transparent caret-black dark:caret-white resize-none bg-transparent p-0 font-inherit leading-relaxed tracking-wide focus:outline-none focus:ring-0"
                    style={{ wordSpacing: '0.25em' }}
                    placeholder=""
                    disabled={!isTestRunning}
                    onPaste={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            )}
            {!isTestRunning && !showCountdown && !resultsDisplayed && roomId && (
              <div className="text-center py-8">
                {connected ? (
                  <>
                    {Object.keys(players).length <= 1 ? (
                      <p className="text-lg text-gray-500 mb-4">Waiting for other players to join...</p>
                    ) : null}
                    {isAdmin && Object.keys(players).length > 0 && (
                      <Button
                        onClick={startTest}
                        className="text-white text-lg py-3 bg-gray-700 hover:bg-gray-900"
                      >
                        Start Typing Test
                      </Button>
                    )}
                    {!isAdmin && (
                      <p className="text-lg text-gray-500">Waiting for admin to start the test...</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg text-red-500">Reconnecting to server...</p>
                )}
              </div>
            )}
            {resultsDisplayed && (
              <div className="space-y-4 mt-6">
                <h2 className="text-3xl font-bold">Final Results</h2>
                <p className="text-xl">
                  Your WPM: <span className="font-bold">{wpm}</span>
                </p>
                <p className="text-xl">
                  Your Accuracy: <span className="font-bold">{accuracy.toFixed(2)}%</span>
                </p>
                {Object.keys(players).length > 1 && (
                  <div className="mt-6">
                    <h3 className="text-2xl font-bold mb-4">All Players</h3>
                    <div className="space-y-2">
                      {Object.entries(players)
                        .sort(([, a], [, b]) => (b.wpm || 0) - (a.wpm || 0))
                        .map(([playerId, player], index) => (
                          <div key={playerId} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-bold">{index + 1}.</span>
                              <span className="font-medium">{playerId.slice(0, 6).toLowerCase()}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{player.wpm} WPM</div>
                              <div className="text-sm text-gray-500">{player.accuracy?.toFixed(2) || 0}% accuracy</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}