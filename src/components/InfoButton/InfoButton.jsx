import { playSound } from "../../utils/audioSystem";
import { useModalStore } from "../stores/modalStore";

import Info from "../Info/Info";

const InfoButton = () => {
  const { openModal } = useModalStore();

  return (
    <>
      <button
        onClick={() => {
          playSound("buttonClick");
          openModal("Information", <Info />, "info");
        }}
        className="pointer-events-auto flex h-[48px] w-[48px] items-center justify-center border-2 border-b-4 border-[#1e1e1f] bg-[#c6c6c6] text-[#1e1e1f] shadow-[inset_2px_2px_#ffffff,inset_-2px_-2px_#555555] hover:cursor-pointer hover:bg-[#a0a0a0] active:translate-y-[2px] active:shadow-none"
        title="Info / Help"
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "monospace",
          }}
        >
          ?
        </span>
      </button>
    </>
  );
};

export default InfoButton;
