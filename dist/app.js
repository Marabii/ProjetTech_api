"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const port = process.env.PORT || 3001;
// Assume these are TypeScript modules as well. If not, you'd need to provide types or use `require` with a type assertion.
const getStudents_1 = __importDefault(require("./apis/getStudents"));
const changeDB_1 = __importDefault(require("./apis/changeDB"));
const getSuggestions_1 = __importDefault(require("./apis/getSuggestions"));
const database_1 = require("./config/database");
const app = (0, express_1.default)();
(0, database_1.connectDB)();
app.use((0, cors_1.default)({
    origin: process.env.FRONT_END,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(getStudents_1.default);
app.use(changeDB_1.default);
app.use(getSuggestions_1.default);
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
//# sourceMappingURL=app.js.map