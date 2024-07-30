import result from "./export/result.json" with { "type": "json" };
import nodecallspython from "node-calls-python";
import TelegramBot from "node-telegram-bot-api";
import SegfaultHandler from "segfault-handler";

SegfaultHandler.registerHandler("crash.log");

const { TOKEN, CHANNEL } = process.env;
const bot = new TelegramBot(TOKEN, { "polling": false });

const py = nodecallspython;

let { messages } = result;
messages = messages.map(x => typeof x.text === "string" ? x.text : x.text.reduce((a, b) => a + (typeof b === "string" ? b : b.text), ""));
messages = messages.slice(messages.length - 200);
messages = messages.map(x => `@@POST@@${(() => {
    x = x.slice(0, 200);
    x = x.slice(0, x.lastIndexOf(/ |\./g));
    return x;
})()}`).join("");
messages = messages.slice(0, 2000) + "@@POST@@";

const pymodule = py.importSync("gen/main.py");
const gensend = async () => {
    let generated = (await py.call(pymodule, "gen", messages));
    generated = generated.split("@@").sort((a, b) => b.length - a.length)[0];
    bot.sendMessage(parseInt(CHANNEL), generated);
};
gensend();
setInterval(gensend, 2 * 60 * 60 * 1000);