import express, { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication Middleware
const auth = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

// Get All Reports for User
router.get('/', auth, async (req: any, res: Response) => {
    try {
        const reports = await Report.find({ user: req.user.id }).sort({ date: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create Report
router.post('/', auth, async (req: any, res: Response) => {
    try {
        const { name, category, date, fileData, fileName, analysis, summary, riskLevel, keyFindings } = req.body;

        const newReport = new Report({
            user: req.user.id,
            name,
            category,
            date,
            fileData,
            fileName,
            analysis,
            summary,
            riskLevel,
            keyFindings
        });

        const report = await newReport.save();
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
