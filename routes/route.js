import express from 'express';
import bodyParser from 'body-parser';
import AnalyzeImage from '../controllers/image.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.route('/analyze-image').post(jsonParser, AnalyzeImage);

export default router;
