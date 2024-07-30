import result from "./export/result.json" with { "type": "json" };
import nodecallspython from "node-calls-python";
import TelegramBot from "node-telegram-bot-api";
import SegfaultHandler from "segfault-handler";
console.log("node: import modules");

SegfaultHandler.registerHandler("crash.log");

const { TOKEN, CHANNEL } = process.env;
const bot = new TelegramBot(TOKEN, { "polling": false });
console.log("node: create bot");

const py = nodecallspython;

const pymodule = py.importSync("gen/main.py");
console.log("node: import python");
const gensend = async () => {
    let { messages } = result;
    messages = messages.map(x => typeof x.text === "string" ? x.text : x.text.reduce((a, b) => a + (typeof b === "string" ? b : b.text), ""));
    const start = Math.floor(Math.random() * (messages.length - 200));
    messages = messages.slice(start, start + 200);
    messages = messages.map(x => `[${(() => {
        x = x.slice(0, 200);
        x = x.slice(0, x.lastIndexOf(/ |\./g));
        return x;
    })()}]`);
    const msgInit = messages.map(x => x.trim());
    messages = messages.join("");
    messages = messages.slice(0, 2000) + "][";
    console.log(messages)
    console.log("node: load data");

    let generated = (await py.call(pymodule, "gen", messages)).replace("]", "").replace(/[^^\.]+\. /, "");

    bot.sendMessage(parseInt(CHANNEL), generated);
    console.log("node: parsed & sent response");
};
gensend();
setInterval(gensend, 2 * 60 * 60 * 1000);