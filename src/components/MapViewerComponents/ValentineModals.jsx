import React from "react";
import { useModalStore } from "../stores/modalStore";
import { playSound } from "../../utils/audioSystem";

// --- NOTE 1: INTRO ---
export const SecretNoteOne = () => {
  const { closeModal } = useModalStore();

  const handleNext = () => {
    playSound("buttonClick");
    closeModal();
  };

  return (
    <div className="valentine-modal-content">
      <h2 style={{ color: "#ff4d6d", marginBottom: "1rem" }}>
        Sebuah Pesan... 📩
      </h2>
      <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
        "Hai! 👋 Sebenarnya aku udah lama pengen ngomong ini, tapi rasanya lebih
        gampang kalau lewat sini..."
      </p>
      <p>
        Ada beberapa hal yang pengen aku sampein ke kamu. Coba jalan lagi ke
        depan ya?
      </p>
      <button
        className="mc-button"
        onClick={handleNext}
        style={{ marginTop: "1.5rem" }}
      >
        Baca Selanjutnya
      </button>
    </div>
  );
};

// --- NOTE 2: PUJIAN (THE COMPLIMENT) ---
export const SecretNoteTwo = () => {
  const { closeModal } = useModalStore();

  const handleNext = () => {
    playSound("buttonClick");
    closeModal();
  };

  return (
    <div className="valentine-modal-content">
      <h2 style={{ color: "#ff4d6d", marginBottom: "1rem" }}>
        Hal Tentang Kamu ✨
      </h2>
      <p>Jujur, ada satu hal dari kamu yang selalu bikin aku kagum.</p>
      <div
        style={{
          background: "#ffe5ec",
          color: "#c9184a",
          padding: "15px",
          borderRadius: "8px",
          margin: "15px 0",
          border: "2px dashed #ff4d6d",
          fontStyle: "italic",
        }}
      >
        "Senyum dan energi positif kamu itu lho... nular banget! Bikin
        hari-hariku jadi beda."
      </div>
      <p>Beneran deh, gak bohong. ✌️</p>
      <button
        className="mc-button"
        onClick={handleNext}
        style={{ marginTop: "1.5rem" }}
      >
        Lanjut Jalan
      </button>
    </div>
  );
};

// --- NOTE 3: HARAPAN (THE WISH) ---
export const SecretNoteThree = () => {
  const { closeModal } = useModalStore();

  const handleNext = () => {
    playSound("buttonClick");
    closeModal();
  };

  return (
    <div className="valentine-modal-content">
      <h2 style={{ color: "#ff4d6d", marginBottom: "1rem" }}>
        Harapanku... 🌤️
      </h2>
      <p>Aku gak minta yang muluk-muluk kok.</p>
      <p style={{ marginTop: "1rem" }}>
        Aku cuma berharap kita bisa lebih sering ngobrol, jalan bareng, dan
        ketawa-ketawa kayak gini. Rasanya nyaman aja kalau ada kamu.
      </p>
      <button
        className="mc-button"
        onClick={handleNext}
        style={{ marginTop: "1.5rem" }}
      >
        Ke Puncak &rarr;
      </button>
    </div>
  );
};

// --- FINAL CHEST: CONFESSION ---
export const ConfessionModal = () => {
  const [hearts, setHearts] = React.useState([]);

  const spawnHeart = () => {
    const id = Date.now();
    const left = Math.random() * 90 + "%";
    setHearts((prev) => [...prev, { id, left }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 3000);
  };

  React.useEffect(() => {
    const interval = setInterval(spawnHeart, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="valentine-modal-content"
      style={{ textAlign: "center", position: "relative" }}
    >
      {/* Visual Effect: Floating Hearts */}
      <div className="confetti-overlay">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="heart-particle"
            style={{ left: h.left, bottom: "0" }}
          >
            ❤️
          </div>
        ))}
      </div>

      <h1 style={{ color: "#ff4d6d", fontSize: "2rem", marginBottom: "1rem" }}>
        Mau Gak? 🌹
      </h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
        Mumpung lagi momen Valentine nih... <br />
        Aku mau nanya sesuatu yang agak serius dikit.
      </p>

      <div
        style={{
          background: "#222",
          border: "2px solid #fff",
          padding: "15px",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold" }}>
          "Will you be my Valentine?"
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "1rem",
        }}
      >
        <button
          className="mc-button"
          style={{ background: "#38b000" }}
          onClick={() => alert("Yeay! See you soon! ❤️")}
        >
          Boleh Banget! 🚀
        </button>
        <button
          className="mc-button"
          style={{ background: "#ff9e00" }}
          onClick={() => alert("Asik! Makasih yaa! 🥰")}
        >
          Mau Dong! 😳
        </button>
      </div>
    </div>
  );
};
