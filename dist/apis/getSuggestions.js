"use strict";
// routes/suggestions.ts
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
const express_1 = require("express");
const students_1 = __importDefault(require("../models/students"));
const router = (0, express_1.Router)();
// Fields that correspond to arrays in the schema (used to determine where to $unwind)
const arrayFields = [
    "CONVENTION DE STAGE",
    "UNIVERSITE visitant",
    "DéfiEtMajeure.majeures",
];
// GET /api/suggestions?field=FIELD_NAME&query=QUERY_STRING
router.get("/api/suggestions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { field, query } = req.query;
    if (!field) {
        res.status(400).json({ error: "Field parameter is required" });
        return;
    }
    const decodedField = decodeURIComponent(field);
    // Build the MongoDB regex query
    const regex = query ? new RegExp("^" + query, "i") : new RegExp("^", "i");
    try {
        let suggestions = [];
        // Check if field is nested
        const pathSegments = decodedField.split(".");
        // Example: "DéfiEtMajeure.majeures.nom" => ["DéfiEtMajeure", "majeures", "nom"]
        if (pathSegments.length > 1) {
            // Handle nested fields
            const pipeline = [];
            // For each level of nesting that corresponds to an array, we must unwind
            // We'll build partial paths and check if they match known arrays
            for (let i = 0; i < pathSegments.length - 1; i++) {
                const partialPath = pathSegments.slice(0, i + 1).join(".");
                if (arrayFields.includes(partialPath)) {
                    pipeline.push({ $unwind: `$${partialPath}` });
                }
            }
            // Build the final match stage
            const finalField = pathSegments.join(".");
            pipeline.push({ $match: { [finalField]: { $regex: regex } } });
            pipeline.push({
                $group: {
                    _id: null,
                    values: { $addToSet: `$${finalField}` },
                },
            });
            pipeline.push({
                $project: {
                    _id: 0,
                    values: { $slice: ["$values", 5] },
                },
            });
            const results = yield students_1.default.aggregate(pipeline);
            if (results.length > 0) {
                suggestions = results[0].values;
            }
        }
        else {
            // For non-nested fields, use aggregation to get distinct values with limit
            const results = yield students_1.default.aggregate([
                { $match: { [decodedField]: { $regex: regex } } },
                { $group: { _id: `$${decodedField}` } },
                { $limit: 5 },
            ]);
            suggestions = results.map((item) => item._id).filter(Boolean);
        }
        res.json({ suggestions });
        return;
    }
    catch (error) {
        console.error("Error fetching suggestions:", error);
        res.status(500).json({ error: "Server error" });
        return;
    }
}));
exports.default = router;
//# sourceMappingURL=getSuggestions.js.map