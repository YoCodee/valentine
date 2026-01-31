import React from "react";
import Button from "../Button/Button";

const infoMeData = {
  one: {
    content: [
      {
        header: "💌 About This World",
        paragraphs: [
          "Dunia Minecraft kecil ini dibuat khusus untuk menemani perjalanan Valentine tahun ini. Semoga kamu suka ya! ❤️",
          "Jangan lupa untuk berinteraksi dengan Villager dan temukan kejutan di puncaknya.",
        ],
      },
      {
        header: "🛠️ Credits & Tech",
        paragraphs: [
          " - Built with *React Three Fiber* & *Three.js*.",
          " - Models by the amazing *Minecraft Community*.",
          " - Inspired by our favorite sandbox game.",
          " - Special thanks to *You* for being the inspiration behind this code.",
        ],
      },
    ],
  },
};

const Info = () => {
  const data = infoMeData["one"];

  if (!data) {
    return <div>Data not found</div>;
  }

  const parseText = (text) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        const content = part.slice(1, -1);
        return (
          <span key={index} className="text-[#ffff55]">
            {content}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
      <div className="p-3">
        <Button href="https://youtu.be/lf9ZBsi24m4" type={"link"}>
          Learn how to create this portfolio!
        </Button>

        {data.content.map((section, index) => (
          <div key={index} className="mb-3">
            <h2 className="mb-4 bg-[#3c3c3c] p-2 text-white">
              {section.header}
            </h2>
            {section.paragraphs.map((paragraph, pIndex) => (
              <p
                key={`${index}-${pIndex}`}
                className="my-2 mb-6 mt-2 text-white"
              >
                {parseText(paragraph)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Info;
