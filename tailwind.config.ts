import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
          'greenBG': "url('https://faucet.banoboto.repl.co/images/jungle.svg')"
      }
    },
  },
  plugins: [],
} satisfies Config;
