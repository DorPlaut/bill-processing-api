import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Convert buffer to a format compatible with Google's Generative AI
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

const AnalyzeImage = async (req, res) => {
  console.log('start');
  try {
    // Extract the image data from the request body
    const { image } = req.body;
    // Input validation
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    // Create buffer from base64 string
    const imageBuffer = Buffer.from(image, 'base64');

    // Process image with Google Gemini 1.5 model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI for a bill-splitting app. Your task is to process an image of a restaurant receipt and return the information in a specific JSON format. Follow these instructions carefully:

1. Return only a valid JSON object with no additional text.
2. Format the JSON object as follows:

{
  "items": [
    {
      "id": "unique_id_string",
      "name": "item name",
      "quantity": number,
      "price": number,
      "assignTo": []
    }
  ],
  "currency": "currency_symbol",
  "taxes": number,
  "discount": number,
  "tip": 0,
  "total": number
}

3. Ensure strict adherence to these rules:
   - All numeric fields (quantity, price, taxes, discount, tip, total) must be numbers without quotation marks or text.
   - The "id" field should be a unique string for each item.
   - The "assignTo" array should always be empty.
   - If no currency symbol is present, infer it from the language (default to "$" for English).
   - Combine all taxes and fees into a single "taxes" value.
   - Always set "tip" to 0.

4. Price calculation:
   - Verify that item prices, taxes, and discounts match the total when calculated.
   - For items with quantity > 1, ensure the "price" field reflects the per-unit price.

5. If the total is unclear, calculate it from item prices, taxes, and discounts.

6. Ensure the JSON is correctly formatted for parsing (use double quotes for strings, no trailing commas).

7. Do not include any explanations or additional text outside the JSON object.

8. If certain information is missing or unclear, use reasonable defaults or estimates based on the available data.

9. If taxes and fees included in the item prices, don't include it and return 0

10. Round all numeric values to two decimal places for consistency.

Provide only the JSON object in your response, with no other text.`;

    const imageParts = [bufferToGenerativePart(imageBuffer, 'image/jpeg')];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;

    // Parse response
    const text = response.text();
    const jsonObject = JSON.parse(text);
    console.log(jsonObject);

    // Validate jsonObject structure
    if (
      !jsonObject.items ||
      !Array.isArray(jsonObject.items) ||
      typeof jsonObject.total !== 'number'
    ) {
      throw new Error('Invalid response structure from AI');
    }

    // Send response back to client
    res.json({ jsonObject });
  } catch (error) {
    console.error('Error analyzing image:', error);

    if (error instanceof SyntaxError) {
      res.status(500).json({ error: 'Failed to parse AI response' });
    } else if (error.message === 'Invalid response structure from AI') {
      res
        .status(500)
        .json({ error: 'AI response did not match expected format' });
    } else {
      res
        .status(500)
        .json({ error: 'An error occurred while analyzing the image' });
    }
  }
};

export default AnalyzeImage;
