import { useState, useEffect } from "react";

import { useModalStore } from "../stores/modalStore";
import { playSound } from "../../utils/audioSystem";
import "./Modal.css";

const Modal = () => {
  const { isModalOpen, modalTitle, modalContent, closeModal } = useModalStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [cachedContent, setCachedContent] = useState(null);
  const [cachedTitle, setCachedTitle] = useState("");
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setIsAnimating(true);
      setCachedContent(modalContent);
      setCachedTitle(modalTitle);
      requestAnimationFrame(() => {
        setShouldAnimate(true);
      });
    } else {
      setShouldAnimate(false);
      const timer = setTimeout(() => {
        setCachedContent(null);
        setCachedTitle("");
        setIsAnimating(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isModalOpen, modalContent, modalTitle]);

  if (!isModalOpen && !isAnimating) return null;

  return (
    <>
      <div onClick={closeModal} className="overlay"></div>

      <div className={`modal ${shouldAnimate ? "modal-enter" : "modal-exit"}`}>
        <div className="modal-header">
          <div className="modal-header-wrapper">
            <h1 className="modal-title">{cachedTitle || modalTitle}</h1>
            <button
              onClick={() => {
                closeModal();
                playSound("buttonClick");
              }}
              className="modal-close-button"
            >
              x
            </button>
          </div>
        </div>
        <div className="modal-body"> {cachedContent || modalContent}</div>
      </div>
    </>
  );
};

export default Modal;
