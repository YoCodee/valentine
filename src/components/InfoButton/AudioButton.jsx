import { useAudioStore } from "../stores/audioStore";
import { playSound } from "../../utils/audioSystem";
import { useEffect, useState, useRef } from "react";

const AudioButton = ({ isCinematic }) => {
  const { isAudioEnabled, setIsAudioEnabled } = useAudioStore();
  const [isMuted, setIsMuted] = useState(!isAudioEnabled); // Fix initial state sync

  // Refs for audio objects
  const bgmRef = useRef(null);
  const cinematicRef = useRef(null);

  // Initialize Audio Objects
  useEffect(() => {
    // 1. Default BGM
    bgmRef.current = new Audio(
      "/audio/Ao Haru Ride-Ost-[Hajimari no Asa].mp3",
    );
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.1;

    // 2. Cinematic BGM
    cinematicRef.current = new Audio(
      "/audio/fff.MP3"
    );
    cinematicRef.current.loop = true;
    cinematicRef.current.volume = 0.2; // Slightly louder/emotional

    return () => {
      // Cleanup
      [bgmRef, cinematicRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, []);

  // Handle Playback Logic
  useEffect(() => {
    // Update local UI state
    setIsMuted(!isAudioEnabled);

    const bgm = bgmRef.current;
    const cin = cinematicRef.current;

    if (!bgm || !cin) return;

    if (!isAudioEnabled) {
      // Global Mute
      bgm.pause();
      cin.pause();
      return;
    }

    // Audio IS Enabled, check mode
    if (isCinematic) {
      // Cinematic Mode
      bgm.pause();
      cin.play().catch((e) => console.warn("Cinematic Audio play failed", e));
    } else {
      // Normal Mode
      cin.pause();
      cin.currentTime = 0; // Reset cinematic song
      bgm.play().catch((e) => console.warn("Default BGM play failed", e));
    }
  }, [isAudioEnabled, isCinematic]);

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    playSound("buttonClick");
  };

  return (
    <button
      onClick={toggleAudio}
      className="pointer-events-auto flex h-[48px] w-[48px] items-center justify-center border-2 border-b-4 border-[#1e1e1f] bg-[#c6c6c6] text-[#1e1e1f] shadow-[inset_2px_2px_#ffffff,inset_-2px_-2px_#555555] hover:cursor-pointer hover:bg-[#a0a0a0] active:translate-y-[2px] active:shadow-none"
      title={isMuted ? "Unmute BGM" : "Mute BGM"}
    >
      {isMuted ? (
        // Mute Icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      ) : (
        // Speaker Icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  );
};
export default AudioButton;
