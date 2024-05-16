import { useState } from "react";
import axios from "axios";
import FormData from "form-data";

type Generation = {
  prompt: string;
  image: string;
};

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    const translatedPrompt = await translate();
    console.log(translatedPrompt);
    const formData = {
      prompt: translatedPrompt,
      output_format: "webp",
    };
    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/core`,
      axios.toFormData(formData, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer sk-lMQAxqaeoA3XUjYFRakTdGH3V1CYD7CbQZuMzfPNXNumjIeS`,
          Accept: "image/*",
        },
      }
    );
    setLoading(false);
    if (response.status === 200) {
      const arrayBuffer = response.data;
      const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      setGenerations([...generations, { prompt, image: url }]);
      //   URL.revokeObjectURL(url);
      setPrompt("");
    } else {
      throw new Error(`${response.status}: ${response.data.toString()}`);
    }
  };

  async function translate() {
    const response = await fetch(
      `https://translate.glosbe.com/fon-en/${prompt}`,
      {
        mode: "no-cors",
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
    const html = await response.text();
    const regex =
      /<app-page-translator-translation-output>(.*?)<\/app-page-translator-translation-output>/s;
    const match = html.match(regex);
    if (match) {
      const regex2 = /<div[^>]*>(.*?)<\/div>/;
      const match2 = match[1].match(regex2);
      if (match2) {
        return match2[1] as string;
      }
    }
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <h1 className="font-bold text-4xl">Benin AI Image Generator</h1>
      <div className="grow my-2 overflow-auto bg-[#0005] text-white px-4">
        {/* <p>generations</p> */}
        {generations.map((generation, index) => (
          <GenerationView
            key={index}
            prompt={generation.prompt}
            image={generation.image}
          />
        ))}
      </div>
      <div className="flex justify-between gap-2">
        <input
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          type="text"
          name="prompt"
          id="prompt"
          placeholder="Enter a prompt"
          className="grow px-4 rounded-lg text-black"
        />
        <button
          className="text-green-500"
          disabled={prompt === ""}
          onClick={() => generateImage()}
        >
          Generat{loading ? "ing..." : "e"}
        </button>
      </div>
    </div>
  );
}

interface GenerationProps {
  prompt: string;
  image: string;
}

function GenerationView({ prompt, image }: GenerationProps) {
  return (
    <div>
      <p className="font-bold text-lg text-left">{prompt}</p>
      <img src={image} alt="" width={400} height={400} className="mb-4" />
    </div>
  );
}
