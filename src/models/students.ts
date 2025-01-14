// models/Etudiant.ts

import mongoose, { Schema, Model } from "mongoose";
import { IEtudiant } from "../Interfaces/Interface";

// Define the ConventionDeStage schema
// models/Etudiant.ts

const ConventionDeStageSchema: Schema = new Schema(
  {
    "Entité liée - Identifiant OP": { type: String, required: true },
    "Date de début du stage": { type: Date, required: false },
    "Date de fin du stage": { type: Date, required: false },
    "Stage Fonction occupée": { type: String, required: false },
    "Nom Stage": { type: String, required: false },
    "Indemnités du stage": { type: String, required: false },
    Durée: { type: String, required: false },
    // Fields from 'ENTREPRISE D'ACCUEIL' without 'Entité liée - ' prefix
    "Code SIRET": { type: String, required: false },
    Pays: { type: String, required: false },
    Ville: { type: String, required: false },
    "Ville (Hors France)": { type: String, required: false },
    "ENTREPRISE DE STAGE": { type: String, required: false },
  },
  { _id: false }
);

// Define the UniversiteVisitant schema
const UniversiteVisitantSchema: Schema = new Schema(
  {
    "Entité principale - Identifiant OP": {
      type: String,
      required: true,
    },
    "Date de début mobilité": {
      type: Date,
      required: false,
    },
    "Date de fin mobilité": {
      type: Date,
      required: false,
    },
    "Type Mobilité": {
      type: String,
      required: false,
    },
    "Nom mobilité": {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

const MajeureSchema: Schema = new Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    promo: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const DéfiEtMajeureSchema: Schema = new Schema(
  {
    défi: {
      type: String,
      required: true,
    },
    majeures: {
      type: [MajeureSchema],
      default: [],
    },
  },
  { _id: false }
);

// Define the IEtudiant schema
const EtudiantSchema: Schema = new Schema(
  {
    "Identifiant OP": {
      type: String,
      required: true,
      unique: true,
    },
    "Etablissement d'origine": {
      type: String,
      required: false,
    },
    Filière: {
      type: String,
      required: true,
      default: "AST",
    },
    Nationalité: {
      type: String,
      required: false,
    },
    Nom: {
      type: String,
      required: false,
    },
    Prénom: {
      type: String,
      required: false,
    },
    "ANNÉE DE DIPLOMATION": {
      type: String,
      required: true,
    },
    "CONVENTION DE STAGE": {
      type: [ConventionDeStageSchema],
      default: undefined, // Makes the array optional
    },
    "UNIVERSITE visitant": {
      type: [UniversiteVisitantSchema],
      default: undefined, // Makes the array optional
    },
    DéfiEtMajeure: {
      type: DéfiEtMajeureSchema,
      default: undefined,
    },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt fields
  }
);

// Create an index on "Identifiant OP" for faster queries
EtudiantSchema.index({ "Identifiant OP": 1 });

const Etudiant: Model<IEtudiant> = mongoose.model<IEtudiant>(
  "Etudiant",
  EtudiantSchema
);

export default Etudiant;
