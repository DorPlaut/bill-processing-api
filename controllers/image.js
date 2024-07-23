import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

const AnalyzeImage = async (req, res) => {
  try {
    // Input validation
    if (!req.body.image || typeof req.body.image !== 'string') {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const { image } = req.body;
    const imageBuffer = Buffer.from(image, 'base64');

    // Process image with Google Gemini 1.5 model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI for a bill-splitting app. Your task is to process image of a restaurant receipt and return it in a specific JSON format. Follow these instructions:

    // 1. Return only a JSON object with no additional text.
    // 2. The JSON object should be formatted as follows:

    // {
    //   "items": [
    //     {
    //       "id":"unique id key"
    //       "name": "item name",
    //       "quantity": "item quantity" - MUST BE A NUMBER WITH NO TEXT
    //       "price": "item price per unit" - MUST BE A NUMBER WITH NO TEXT
    //       "assignTo": [] - Empty array
    //     }
    //   ],
    //   "taxes": "total taxes" - MUST BE A NUMBER WITH NO TEXT
    //   "tip": "tip amount" - SET TO 0 - MUST BE A NUMBER WITH NO TEXT
    //   "total": "total amount" - MUST BE A NUMBER WITH NO TEXT
    // }

    // 3. Ensure the "quantity," "price," "taxes," and "total" fields contain only numbers with no text.
    // 4. Compare the sum of the items' total prices (quantity * price per unit) plus taxes to the total amount extracted from the receipt.
    // 5. Determine if the price for items with a quantity greater than 1 is for a single item or the total for all units of that item. Adjust the price to reflect the price per single item.
    // 6. If the total amount is unclear from the extracted text, calculate it from the item prices and taxes.
    // 7. Do not return any text other than the JSON object.
    // 8. The JSON must be correctly formatted so the app can run JSON.parse on it.

    // Remember, the response should include only the JSON object and no other text.`;

    const imageParts = [bufferToGenerativePart(imageBuffer, 'image/jpeg')];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;

    // Parse response
    const text = response.text();
    const jsonObject = JSON.parse(text);

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
