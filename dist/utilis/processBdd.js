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
exports.default = processBddFile;
const students_1 = __importDefault(require("../models/students"));
const parseExcelDate_1 = require("./parseExcelDate");
const requiredSheets = [
    {
        name: "Entité principale",
        requiredColumns: [
            "Identifiant OP",
            "Etablissement d'origine",
            "Filière",
            "Nationalité",
            "Nom",
            "Prénom",
        ],
    },
    {
        name: "CONVENTION DE STAGE",
        requiredColumns: [
            "Entité principale - Identifiant OP",
            "Entité liée - Identifiant OP",
            "Entité liée - Date de début du stage",
            "Entité liée - Date de fin du stage",
            "Entité liée - Fonction occupée",
            "Entité liée - Nom",
        ],
    },
    {
        name: "UNIVERSITE visitant",
        requiredColumns: [
            "Entité principale - Identifiant OP",
            "Date de début",
            "Date de fin",
            "Type Mobilité",
            "Entité liée - Nom",
        ],
    },
];
function processBddFile(bdd) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        const sheetDataMap = {};
        // Step 1: Organize sheets by name
        bdd.forEach((sheetObj, index) => {
            const sheetNames = Object.keys(sheetObj);
            if (sheetNames.length !== 1) {
                errors.push(`Sheet at index ${index} should have exactly one sheet name.`);
                return;
            }
            const sheetName = sheetNames[0];
            if (!requiredSheets.some((s) => s.name === sheetName)) {
                errors.push(`Unexpected sheet name "${sheetName}" at index ${index}.`);
                return;
            }
            if (sheetDataMap[sheetName]) {
                errors.push(`Duplicate sheet name "${sheetName}" found.`);
                return;
            }
            sheetDataMap[sheetName] = sheetObj[sheetName];
        });
        // Step 2: Validate required sheets are present
        requiredSheets.forEach((requiredSheet) => {
            if (!sheetDataMap[requiredSheet.name]) {
                errors.push(`Missing required sheet "${requiredSheet.name}".`);
            }
        });
        // Step 3: Validate columns in each sheet
        requiredSheets.forEach((sheet) => {
            const data = sheetDataMap[sheet.name];
            if (!data)
                return; // Skip if sheet is missing
            data.forEach((row, rowIndex) => {
                sheet.requiredColumns.forEach((col) => {
                    if (!(col in row)) {
                        errors.push(`Missing column "${col}" in sheet "${sheet.name}" at row ${rowIndex + 1}.`);
                    }
                });
            });
        });
        // Step 4: Index "Entité principale" by "Identifiant OP"
        const entitePrincipaleData = sheetDataMap["Entité principale"] || [];
        const entitePrincipaleMap = {};
        entitePrincipaleData.forEach((row, index) => {
            const identifiantOP = row["Identifiant OP"];
            if (!identifiantOP) {
                errors.push(`Missing "Identifiant OP" in "Entité principale" at row ${index + 1}.`);
                return;
            }
            if (entitePrincipaleMap[identifiantOP]) {
                errors.push(`Duplicate "Identifiant OP" "${identifiantOP}" in "Entité principale" at row ${index + 1}.`);
                return;
            }
            // Initialize the IEtudiant object
            entitePrincipaleMap[identifiantOP] = {
                "Identifiant OP": identifiantOP,
                "Etablissement d'origine": row["Etablissement d'origine"],
                Filière: row["Filière"],
                Nationalité: row["Nationalité"],
                Nom: row["Nom"],
                Prénom: row["Prénom"],
            };
        });
        // Step 5: Process "CONVENTION DE STAGE"
        const conventionDeStage = sheetDataMap["CONVENTION DE STAGE"] || [];
        conventionDeStage.forEach((row, index) => {
            const identifiantOP = row["Entité principale - Identifiant OP"];
            if (!identifiantOP) {
                errors.push(`Missing "Entité principale - Identifiant OP" in "CONVENTION DE STAGE" at row ${index + 1}.`);
                return;
            }
            const entite = entitePrincipaleMap[identifiantOP];
            if (!entite) {
                errors.push(`No matching "Entité principale" for "Identifiant OP" "${identifiantOP}" in "CONVENTION DE STAGE" at row ${index + 1}.`);
                return;
            }
            // Apply parseExcelDate to date fields
            const dateDebutSerial = row["Entité liée - Date de début du stage"];
            const dateFinSerial = row["Entité liée - Date de fin du stage"];
            const dateDebut = (0, parseExcelDate_1.parseExcelDate)(dateDebutSerial);
            const dateFin = (0, parseExcelDate_1.parseExcelDate)(dateFinSerial);
            // Rename keys as specified and ensure type conformity
            const renamedRow = {
                "Entité principale - Identifiant OP": identifiantOP,
                "Date de début du stage": dateDebut,
                "Date de fin du stage": dateFin,
                "Stage Fonction occupée": row["Entité liée - Fonction occupée"],
                "Entité liée - Identifiant OP": row["Entité liée - Identifiant OP"],
                "Nom Stage": row["Entité liée - Nom"],
            };
            // Attach to the entite
            if (!entite["CONVENTION DE STAGE"]) {
                entite["CONVENTION DE STAGE"] = [];
            }
            entite["CONVENTION DE STAGE"].push(renamedRow);
        });
        // Step 6: Process "UNIVERSITE visitant"
        const universiteVisitant = sheetDataMap["UNIVERSITE visitant"] || [];
        universiteVisitant.forEach((row, index) => {
            const identifiantOP = row["Entité principale - Identifiant OP"];
            if (!identifiantOP) {
                errors.push(`Missing "Entité principale - Identifiant OP" in "UNIVERSITE visitant" at row ${index + 1}.`);
                return;
            }
            const entite = entitePrincipaleMap[identifiantOP];
            if (!entite) {
                errors.push(`No matching "Entité principale" for "Identifiant OP" "${identifiantOP}" in "UNIVERSITE visitant" at row ${index + 1}.`);
                return;
            }
            // Apply parseExcelDate to date fields
            const dateDebutMobilitySerial = row["Date de début"];
            const dateFinMobilitySerial = row["Date de fin"];
            const dateDebutMobility = (0, parseExcelDate_1.parseExcelDate)(dateDebutMobilitySerial);
            const dateFinMobility = (0, parseExcelDate_1.parseExcelDate)(dateFinMobilitySerial);
            // Rename keys as specified and ensure type conformity
            const renamedRow = {
                "Entité principale - Identifiant OP": identifiantOP,
                "Date de début mobilité": dateDebutMobility,
                "Date de fin mobilité": dateFinMobility,
                "Type Mobilité": row["Type Mobilité"],
                "Nom mobilité": row["Entité liée - Nom"],
            };
            // Attach to the entite
            if (!entite["UNIVERSITE visitant"]) {
                entite["UNIVERSITE visitant"] = [];
            }
            entite["UNIVERSITE visitant"].push(renamedRow);
        });
        // Step 7: Prepare the combined data
        const combinedData = Object.values(entitePrincipaleMap);
        // If there are processing errors, return them
        if (errors.length > 0) {
            return { message: "something went wrong", errors };
        }
        if (combinedData.length === 0) {
            return {
                message: "No student data to process.",
                errors: [],
            };
        }
        // Prepare bulk operations
        const bulkOperations = combinedData.map((student) => ({
            updateOne: {
                filter: { "Identifiant OP": student["Identifiant OP"] },
                update: { $set: student },
                upsert: true,
            },
        }));
        // Execute bulkWrite for efficient upsert operations
        const result = yield students_1.default.bulkWrite(bulkOperations, {
            ordered: true, // Continue processing even if some operations fail
        });
        return {
            message: `Bulk write summary: Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}, Total Successful Writes: ${result.modifiedCount + result.upsertedCount}`,
            errors,
        };
    });
}
//# sourceMappingURL=processBdd.js.map