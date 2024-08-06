# Bill Splitter API Documentation

## Overview

This API provides image analysis for bill splitting purposes. It uses Google's Generative AI to process images of restaurant receipts and return structured data.
The service is currently avilable online. [Click here to visit](https://bill-processing-api.onrender.com/)

## Endpoint

Localy:

`POST /api/analyze-image`

Online on free Render hosting (might have initial delay):

`POST https://bill-processing-api.onrender.com/api/analyze-image`

## Request Format

Send a POST request with a JSON body containing a base64-encoded image:

```json
{
  "image": "base64_encoded_image_string"
}
```

## Response Format

The API returns a JSON object with the following structure:

```json
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
```

## How It Works

The API receives a base64-encoded image of a restaurant receipt.
It uses Google's Generative AI (Gemini 1.5 model) to analyze the image.
The AI extracts relevant information such as items, prices, taxes, and total.
The data is structured into a JSON format and returned to the client.
Error Handling
The API includes error handling for invalid inputs, parsing errors, and unexpected AI responses. Appropriate error messages are returned in case of issues.

`{
"image": "base64_encoded_image_string"
}`
