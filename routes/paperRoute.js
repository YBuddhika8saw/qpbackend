import express from "express";
const router = express.Router();

import {
    getSubjectsInfo, addPaperQuestions, getPaperBySubject, getQuestionIdsByPaperId,
    getSelectedQuestionsSummery, getQuestionMarksBySubjectAreas, getQuestionMarksByDifficultyLevel,getResourcesBySubject,
    addResourcesBySubject,getDistinctResources,addResources
} from "../controllers/paperController.js";
import { upFile, showFile } from "../controllers/refUpoad.js";

// Route to get subjects info
router.get('/getSubjectsInfo', getSubjectsInfo);

// Route to add a paper
router.post('/addPaper', addPaperQuestions);

// Route to get papers by subject
router.get('/getPaperBySubject', getPaperBySubject);

//Rout to get qiestionIds by paper id
router.get('/getQuestionIdsByPaperId', getQuestionIdsByPaperId);

//Route to get selected question summery for heat map
router.get('/getSelectedQuestionsSummery', getSelectedQuestionsSummery);

//Route to get marks by subject areas
router.get('/getQuestionMarksBySubjectAreas', getQuestionMarksBySubjectAreas);

//Route to get marks by Difficulty Level	
router.get('/getQuestionMarksByDifficultyLevel', getQuestionMarksByDifficultyLevel);

//Route to get resoureces by subject
router.get('/getResourcesBySubject', getResourcesBySubject);

//Route to add resoureces by subject
router.post('/addResourcesBySubject', addResourcesBySubject);

//Route to get distinct resoureces type
router.get('/getDistinctResources', getDistinctResources);

//Route to ge resource file
router.get('/getResourceFile', showFile);

//Route to add resoureces file
// router.post('/addResources', uploadResource.single('file') , addResources);

router.post('/addResources', upFile);




export default router;