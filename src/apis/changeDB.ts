// routes/postStudentData.ts

import { Router, Request, Response } from "express";
import {
  ApiResponse,
  SheetData,
  FileProcessorResult,
} from "../Interfaces/Interface";
import { Status } from "../Interfaces/enums";
import processBddFile from "../utilis/processBdd";
import { processInternships } from "../utilis/processInterships";
import processDefis from "../utilis/processDefis";
import processMajeure from "../utilis/processMajeure";

const router = Router();

/**
 * Utility function to handle error responses
 */
const handleErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors: string[] = []
) => {
  res.status(statusCode).json({
    status: Status.failure,
    message,
    errors,
  } as ApiResponse);
};

/**
 * Handler for processing 'bdd' type data
 */
const handleBdd = async (
  data: SheetData,
  graduationYear: number,
  res: Response
) => {
  try {
    const result: FileProcessorResult = await processBddFile(
      data,
      graduationYear
    );
    res.status(200).json({
      status: Status.success,
      message: result.message,
      errors: result.errors,
    } as ApiResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      handleErrorResponse(res, 400, "", [error.message]);
    } else {
      handleErrorResponse(res, 500, "", ["An unknown error occurred."]);
    }
  }
};

/**
 * Handler for processing 'stages' type data
 */
const handleInternships = async (data: SheetData, res: Response) => {
  try {
    const result: FileProcessorResult = await processInternships(data);
    res.status(200).json({
      status: Status.success,
      message: result.message,
      errors: result.errors,
    } as ApiResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      handleErrorResponse(res, 400, "", [error.message]);
    } else {
      handleErrorResponse(res, 500, "", ["An unknown error occurred."]);
    }
  }
};

/**
 * Handler for processing 'defis' type data
 */
const handleDefis = async (data: SheetData, res: Response) => {
  try {
    const result: FileProcessorResult = await processDefis(data);
    res.status(200).json({
      status: Status.success,
      message: result.message,
      errors: result.errors,
    } as ApiResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      handleErrorResponse(res, 400, "", [error.message]);
    } else {
      handleErrorResponse(res, 500, "", ["An unknown error occurred."]);
    }
  }
};

/**
 * Handler for processing 'Majeure' type data
 */
const handleMajeure = async (data: SheetData, res: Response) => {
  try {
    const result: FileProcessorResult = await processMajeure(data);
    res.status(200).json({
      status: Status.success,
      message: result.message,
      errors: result.errors,
    } as ApiResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      handleErrorResponse(res, 400, "", [error.message]);
    } else {
      handleErrorResponse(res, 500, "", ["An unknown error occurred."]);
    }
  }
};

/**
 * Main route handler for posting student data
 */
router.post(
  "/api/server/postStudentData",
  async (req: Request, res: Response) => {
    const { type, graduationYearQuery } = req.query;
    const data = req.body as SheetData;
    let graduationYear: number | null;
    // Validate `type`
    if (!type || typeof type !== "string") {
      return handleErrorResponse(res, 400, "Type parameter is required.");
    }

    // Validate `graduationYearQuery` if type is bdd
    if (type.toLocaleLowerCase() === "bdd") {
      if (!graduationYearQuery)
        return handleErrorResponse(res, 400, "Graduation year is missing");

      const currentYear = new Date().getFullYear();
      const yearAsNumber = Number(graduationYearQuery);

      if (
        isNaN(yearAsNumber) || // Graduation year must be a number
        yearAsNumber < currentYear - 30 || // Cannot be earlier than 30 years ago
        yearAsNumber > currentYear // Cannot be later than the current year
      ) {
        return handleErrorResponse(
          res,
          400,
          `GraduationYearQuery must be a number between ${
            currentYear - 30
          } and ${currentYear} if provided.`
        );
      }

      graduationYear = yearAsNumber;
    }

    // Handle different types
    switch (type.toLowerCase()) {
      case "bdd":
        await handleBdd(data, graduationYear, res);
        return;
      case "stages":
        await handleInternships(data, res);
        return;
      case "defis":
        await handleDefis(data, res);
        return;
      case "majeure":
        await handleMajeure(data, res);
        return;
      default:
        handleErrorResponse(res, 400, "Unsupported type parameter.", [
          "Supported types are 'bdd', 'stages', 'defis', and 'majeure'.",
        ]);
        return;
    }
  }
);

export default router;
