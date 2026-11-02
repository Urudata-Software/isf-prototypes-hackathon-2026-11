// Arma la carpeta dist/ que publica Vercel: la demo como index.html y un config.js
// generado con las claves de EmailJS que se cargan en Settings → Environment Variables.
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";

const env = process.env;
const config = {
  emailjs: {
    publicKey: env.EMAILJS_PUBLIC_KEY || "TU_PUBLIC_KEY",
    serviceId: env.EMAILJS_SERVICE_ID || "TU_SERVICE_ID",
    templateId: env.EMAILJS_TEMPLATE_ID || "TU_TEMPLATE_ID",
  },
  recipients: env.DEMO_RECIPIENTS || "",
};

mkdirSync("dist", { recursive: true });
copyFileSync("lote360.html", "dist/index.html");
writeFileSync("dist/config.js", `window.LOTE360_CONFIG = ${JSON.stringify(config, null, 2)};\n`);

const missing = ["EMAILJS_PUBLIC_KEY", "EMAILJS_SERVICE_ID", "EMAILJS_TEMPLATE_ID", "DEMO_RECIPIENTS"].filter(k => !env[k]);
console.log(missing.length ? `Demo armada sin mail real; faltan: ${missing.join(", ")}` : "Demo armada con mail real");
