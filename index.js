import result from "./result.json" with { "type": "json" };
// import nodecallspython from "node-calls-python";
import TelegramBot from "node-telegram-bot-api";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import SegfaultHandler from "segfault-handler";
console.log("node: import modules");
import http from "http";

// SegfaultHandler.registerHandler("crash.log");

const { TOKEN, CHANNEL, KEY } = process.env;
const bot = new TelegramBot(TOKEN, { "polling": false });
console.log("node: create bot");

const genAI = new GoogleGenerativeAI(KEY);
const model = genAI.getGenerativeModel({ "model": "gemini-1.5-pro-latest", "generationConfig": {
    "temperature": 2.0
} });
console.log("node: create model");

// const py = nodecallspython;

// const pymodule = py.importSync("gen/main.py");
// console.log("node: import python");
const gensend = async () => {
    let { messages } = result;
    messages = messages.map(x => typeof x.text === "string" ? x.text : x.text.reduce((a, b) => a + (typeof b === "string" ? b : b.text), ""));
    const start = Math.floor(Math.random() * (messages.length - 200));
    messages = messages.slice(start, start + 200);
    messages = messages.map(x => `[${(() => {
        x = x.slice(0, 500);
        x = x.slice(0, x.lastIndexOf(/ |\./g));
        return x;
    })()}]`);
    messages = messages.join("");
    messages = messages.slice(0, 7000) + `]\nСегодняшняя дата: ${(new Date()).toDateString()}\nСгенерируй новый пост в квадратных скобках. Не пиши ничего лишнего.`;
    console.log(messages)
    console.log("node: load data");

    let generated = await model.generateContent(messages);
    generated = generated.response.text();
    const open = generated.indexOf("[");
    const close = generated.lastIndexOf("]");
    generated = generated.slice(open == -1 ? 0 : open + 1, close == -1 ? generated.length : close);

    bot.sendMessage(parseInt(CHANNEL), generated);
    console.log("node: parsed & sent response");
};
gensend();
setInterval(gensend, 2 * 60 * 60 * 1000);

http.createServer((_req, res) => res.end("ok")).listen(7852);