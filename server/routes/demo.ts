import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

/**
 * @swagger
 * /api/demo:
 *   get:
 *     summary: Demo endpoint
 *     description: Returns a simple demo message from the server
 *     tags:
 *       - Demo
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello from Express server
 */
export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};
