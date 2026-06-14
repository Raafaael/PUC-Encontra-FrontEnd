import { PucEncontraApp } from "./app/PucEncontraApp.js";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Elemento #app nao encontrado.");
}

new PucEncontraApp(root).start();
