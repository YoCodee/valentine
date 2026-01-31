export const playSound = (soundName = "buttonClick") => {
  // Simple mapping can be expanded later
  const sounds = {
    buttonClick: "/audio/sfx/ButtonClick.mp3",
    villager: "/audio/villager/Minecraft villager sound effect.mp3",
  };

  const soundPath = sounds[soundName] || sounds.buttonClick;

  console.log(`[AudioSystem] Playing sound: ${soundPath}`);

  const audio = new Audio(soundPath);
  audio.volume = 0.5; // Adjust volume as needed
  audio.play().catch((e) => console.warn("Audio play failed:", e));
};
