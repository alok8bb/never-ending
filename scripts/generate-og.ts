import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const fontData = readFileSync(join(import.meta.dir, "instrument-serif.ttf"));

const svg = await satori(
  {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundColor: "#0c0a09",
        padding: "80px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontFamily: "Instrument Serif",
              fontSize: 96,
              color: "#e7e5e4",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            },
            children: "never ending.",
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: 22,
              color: "#78716c",
              marginTop: 16,
              letterSpacing: "0.1em",
            },
            children: "Things worth reading.",
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Instrument Serif",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  }
);

const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 3600 } });
const png = resvg.render().asPng();
writeFileSync("public/og.png", png);
console.log("Generated public/og.png");
