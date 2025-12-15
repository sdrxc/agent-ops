import localFont from "next/font/local";

export const bayerSans = localFont({
  src: [
    {
      path: "../../public/fonts/BayerSansWeb-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/BayerSansWeb-ExtraLightItalic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/BayerSansWeb-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/BayerSansWeb-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/BayerSansWeb-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/BayerSansWeb-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/BayerSansWeb-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/BayerSansWeb-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/BayerSansWeb-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/BayerSansWeb-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-bayer-sans",
  display: "swap",
});

export const notoSansMono = localFont({
  src: "../../public/fonts/NotoSansMono[wdth,wght].ttf",
  variable: "--font-noto-sans-mono",
  display: "swap",
});
