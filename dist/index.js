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
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const DBConnection_1 = require("./db/DBConnection");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log(" socket connected:", socket.id);
    socket.on("disconnect", () => console.log(" socket disconnected:", socket.id));
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, DBConnection_1.DBConnection)();
            console.log(result);
            const db = mongoose_1.default.connection.db;
            console.log("Connected to MongoDB DB:", db.databaseName);
            const pipeline = [
                {
                    $match: {
                        operationType: { $in: ["insert", "update", "replace", "delete"] },
                    },
                },
            ];
            const changeStream = db.watch(pipeline, { fullDocument: "updateLookup" });
            changeStream.on("change", (change) => {
                var _a, _b;
                if (!change.ns || !change.documentKey)
                    return;
                const coll = change.ns.coll;
                const id = (_b = (_a = change.documentKey._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a);
                console.log(` Change in ${coll}:`, change.operationType, id);
                io.emit(`mongo-change:${coll}`, change);
            });
            server.listen(port, () => {
                console.log(`Server is running at http://localhost:${port}`);
            });
        }
        catch (err) {
            console.error(" Failed to start server:", err);
            process.exit(1);
        }
    });
}
start();
