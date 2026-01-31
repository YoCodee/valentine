import { playSound } from "../../utils/audioSystem";

const Button = ({ children, type, href, onClick }) => {
  const handleClick = () => {
    playSound("buttonClick");
    if (onClick) {
      onClick();
    }
  };

  const buttonClass =
    "flex items-center justify-center p-2.5 text-lg mt-2 mb-4 no-underline text-[#1e1e1f] bg-[#8d8d8d] border-2 border-[#1e1e1f] shadow-[inset_2px_2px_#ffffffc0,inset_-2px_-2px_#323232c0] hover:text-white hover:border-white hover:bg-[#38b000] hover:cursor-pointer hover:shadow-[inset_2px_2px_#53d95ac0,inset_-2px_-2px_#118316c0]";

  return (
    <>
      {type === "link" ? (
        <a
          className={buttonClass}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {children}
        </a>
      ) : (
        <button onClick={handleClick} className={buttonClass}>
          {children}
        </button>
      )}
    </>
  );
};

export default Button;
