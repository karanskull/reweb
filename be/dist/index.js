"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const cors_1 = __importDefault(require("cors"));
// Initialize OpenAI client
const client = new openai_1.default({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = req.body.prompt;
    const response = yield client.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        model: "gpt-4o",
        temperature: 1,
        max_tokens: 200,
        top_p: 1
    });
    const answer = response.choices[0].message.content; // react or node
    if (answer == "react") {
        res.json({
            prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [react_1.basePrompt]
        });
        return;
    }
    if (answer === "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [node_1.basePrompt]
        });
        return;
    }
    res.status(403).json({ message: "You cant access this" });
    return;
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = req.body.messages;
    // Add system prompt to the beginning of messages array
    const messagesWithSystem = [
        {
            role: "system",
            content: (0, prompts_1.getSystemPrompt)()
        },
        ...messages
    ];
    const response = yield client.chat.completions.create({
        messages: messagesWithSystem,
        model: "gpt-4o",
        temperature: 1,
        max_tokens: 8000,
        top_p: 1
    });
    console.log(response);
    res.json({
        response: response.choices[0].message.content
    });
}));
app.listen(3000);
