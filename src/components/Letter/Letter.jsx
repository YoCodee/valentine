import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/dancing-script/400.css";
import "@fontsource/dancing-script/700.css";
import "./Letter.css";

const Letter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulledOut, setIsPulledOut] = useState(false);

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="letter-wrapper">
      <div
        className={`envelope-container ${isOpen ? "open" : ""}`}
        onClick={handleOpen}
      >
        {/* Top Flap */}
        <motion.div
          className="envelope-flap"
          initial={false}
          animate={{ rotateX: isOpen ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />

        {/* Letter Inside */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={`letter-paper ${isPulledOut ? "free-drag" : ""}`}
              drag={isPulledOut ? true : "y"}
              dragConstraints={
                isPulledOut
                  ? false // No constraints when freed
                  : { top: -700, bottom: 0 }
              }
              onDragEnd={(event, info) => {
                if (!isPulledOut && info.offset.y < -200) {
                  setIsPulledOut(true);
                }
              }}
              initial={{ y: 0, zIndex: 1 }}
              animate={
                isPulledOut
                  ? { zIndex: 1000 } 
                  : { y: 0, zIndex: 1 }
              }
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              style={{
                top: "20px",
                cursor: isPulledOut ? "grab" : "ns-resize",
              }}
              whileDrag={{
                cursor: "grabbing",
                scale: 1.02,
                zIndex: 9999, // Highest during drag
              }}
            >
              <div className="letter-content">
                <span className="heart-icon">❤️</span>
                <p>Dear You,</p>
                <p>
                  Setiap langkah dalam perjalanan ini, <br />
                  tiap rintangan yang kita lalui di dunia kotak-kotak ini,{" "}
                  <br />
                  hanyalah sebagian kecil dari betapa berartinya kamu bagiku.
                </p>
                <p>
                  Terima kasih sudah menjadi bagian dari <br />
                  cerita indahku.
                </p>
                <p className="signature">
                  With Love, <br /> Yohanes
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Envelope Front Body */}
        <div className="envelope-body" />

        {/* Seal */}
        <div className="envelope-seal">
          <span style={{ transform: "scale(1.2)" }}>❤️</span>
        </div>

        {/* Decorative Hearts (from image) */}
        <div className="envelope-hearts">
          <div className="small-heart">❤️</div>
          <div className="small-heart">❤️</div>
        </div>
      </div>

      {!isOpen && <div className="click-hint">Click to Open</div>}
      {isOpen && !isPulledOut && (
        <div className="drag-hint">Drag Letter Upward ⬆️</div>
      )}
      {isPulledOut && (
        <div className="drag-hint-free">
          You can now move the letter anywhere! ✨
        </div>
      )}
    </div>
  );
};

export default Letter;
