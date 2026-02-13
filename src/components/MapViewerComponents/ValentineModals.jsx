import React from "react";
import { useModalStore } from "../stores/modalStore";
import { useProgressionStore } from "../stores/progressionStore";
import { playSound } from "../../utils/audioSystem";

export const SecretNoteOne = () => {
  const { closeModal } = useModalStore();

  const handleNext = () => {
    playSound("buttonClick");
    closeModal();
  };

  return (
    <div className="valentine-modal-content">
      <p style={{ fontStyle: "", marginBottom: "1rem" }}>
        "Jika dunia bertanya, apa satu hal yang ingin kamu rasakan setidaknya
        sekali dalam perjalanan hidupmu? Tentu jawabannya adalah kasih sayang."
        Sebuah keinginan untuk memiliki seseorang yang barangkali terasa
        mustahil ia yang terpisah oleh jarak, keadaan, atau tembok besar yang
        sulit diruntuhkan.
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
      <p>Bagiku, kamu adalah cermin dari segala kebaikan.</p>
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
        "Sosok yang merefleksikan cahaya, rahmat, dan cinta dengan cara yang
        begitu tenang, hingga mampu membangkitkan sisi terbaik dalam diriku.
        Seseorang yang benar-benar istimewa, lebih dari sekadar kata-kata"
      </div>
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
      <p>
        Namun, aku sadar bahwa hidup tak selalu berjalan di atas kendali kita,
        melainkan di bawah kendali Tuhan yang Maha Baik.
      </p>
      <p style={{ marginTop: "1rem" }}>
        Meski jalan tak selalu sesuai rencana, aku tetap bersyukur atas
        kehadiranmu. Maka dari itu, di Valentine ini, aku hanya ingin merayakan
        syukur karena pernah mengenal sosok sepertimu.
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

export const SecretNoteFour = () => {
  const { closeModal } = useModalStore();
  const { setGiftImage } = useProgressionStore();

  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState(null); 


  React.useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#ff4d6d";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
    }
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    if (statusMessage === "analyzing" || statusMessage === "success") return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (
      !isDrawing ||
      statusMessage === "analyzing" ||
      statusMessage === "success"
    )
      return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (statusMessage === "analyzing") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStatusMessage(null); 
  };

  const submitDrawing = async () => {
    if (statusMessage === "analyzing") return;

    setStatusMessage("analyzing");

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");

    try {
      const { classifyDrawing } = await import("../../utils/gemini.js");


      const [result] = await Promise.all([
        classifyDrawing(dataUrl),
        new Promise((r) => setTimeout(r, 800)),
      ]);

      console.log("AI Result:", result);

     
      let assetPath = "/gifts/heart.png";
      if (result === "flower") assetPath = "/gifts/flower.png";
      if (result === "chocolate") assetPath = "/gifts/chocolate.png";
      if (result === "star") assetPath = "/gifts/star.png";

      setGiftImage(assetPath);
      playSound("levelUp");

      setStatusMessage("success");

      
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error("Submission failed", error);
      setStatusMessage("error");
    } finally {
     
    }
  };

  return (
    <div className="valentine-modal-content" style={{ textAlign: "center" }}>
      <h2 style={{ color: "#ff4d6d", marginBottom: "0.5rem" }}>
        Misi Terakhir! 🎨
      </h2>
      <p style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>
        Sebelum aku kasih "hadiah"-nya, ada satu syarat nih!
        <br />
        Coba gambarkan sesuatu yang berhubungan dengan "Cinta/Valentine" di
        sini!
        <br />
        (Nanti gambarmu akan tersimpan di dalam Chest lho!)
      </p>

     
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
          touchAction: "none",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          style={{
            border: "4px solid #fff",
            background: "#111",
            cursor: statusMessage === "analyzing" ? "wait" : "crosshair",
            touchAction: "none",
            opacity:
              statusMessage === "analyzing" || statusMessage === "success"
                ? 0.5
                : 1,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {statusMessage === "analyzing" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            Sedang Menganalisis... 🤖✨
          </div>
        )}

        {statusMessage === "success" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#4ade80",
              fontWeight: "bold",
              fontSize: "1.2rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            ✨ Berhasil! ✨
          </div>
        )}

        {statusMessage === "error" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#ff4d4d",
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            Gagal :( <br /> Cek Internet/API Key!
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          className="mc-button"
          onClick={clearCanvas}
          disabled={
            statusMessage === "analyzing" || statusMessage === "success"
          }
          style={{
            background: "#d00000",
            fontSize: "0.9rem",
            padding: "8px 16px",
            opacity: statusMessage === "analyzing" ? 0.5 : 1,
          }}
        >
          Hapus 🗑️
        </button>
        <button
          className="mc-button"
          onClick={submitDrawing}
          disabled={
            statusMessage === "analyzing" || statusMessage === "success"
          }
          style={{
            background: "#38b000",
            fontSize: "0.9rem",
            padding: "8px 16px",
            opacity: statusMessage === "analyzing" ? 0.5 : 1,
          }}
        >
          {statusMessage === "analyzing"
            ? "Memproses..."
            : statusMessage === "success"
              ? "Disimpan!"
              : "Simpan & Lanjut ✨"}
        </button>
      </div>
    </div>
  );
};


export const ConfessionModal = () => {
  const { giftImage } = useProgressionStore();
  const [hearts, setHearts] = React.useState([]);

  // Heart rain effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const left = Math.random() * 90 + "%";
      setHearts((prev) => [...prev, { id, left }]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 3000);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="valentine-modal-content"
      style={{ textAlign: "center", position: "relative" }}
    >
   
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

      <h2 style={{ color: "#ff4d6d", marginBottom: "1rem" }}>
        Isi Chest Adalah... 🎁
      </h2>

      {giftImage ? (
        <>
          <p style={{ marginBottom: "1rem" }}>
            Tarrraaa! Ini adalah karya seni yang kamu buat tadi! <br />
            (Oke, mungkin hadiah aslinya adalah "kebersamaan" kita selama ini
            hihi 😝)
          </p>

  
          <div
            style={{
              width: "200px",
              height: "200px",
              background: "#333",
              border: "4px solid #8b4513", 
              boxShadow: "inset 0 0 20px #000",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            <img
              src={giftImage}
              alt="User Gift"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
            *Boleh screenshot buat kenang-kenangan!* 📸
          </p>
        </>
      ) : (
        <div style={{ padding: "2rem", border: "2px dashed #666" }}>
          <p>Yah.. Kamu belum menggambar apa-apa di pos sebelumnya 😢</p>
          <p style={{ fontSize: "0.8rem", color: "#888" }}>
            (Coba cari Villager ke-4 dulu deh!)
          </p>
        </div>
      )}

      <button
        className="mc-button"
        onClick={() => window.location.reload()} 
        style={{ marginTop: "1rem", background: "#ff4d6d" }}
      >
        Happy Valentine! ❤️
      </button>
    </div>
  );
};
