import express from "express";
import {upload} from '../middleware/uploader.js';
const router = express.Router();
import {
    addQuestion, addImg, getSubjectList, getQuestions, getQuestionsById, getCountTotalQuestions,
    getTotalSubjectsCount, getTotalPaperCount, deleteQuestion, editQuestion
} from "../controllers/questionController.js";


// Route to handle adding a question
router.post('/addQuestion', addQuestion);

// Route to handle adding question image
router.post('/addImg', upload.single('image'), addImg);

//Route to get subjects in database
router.get('/getSubjects', getSubjectList);

//Route to get questions in database filtered by subject
router.get('/getQuestions', getQuestions);

//Route to get questions in database filtered by question id
router.get('/getQuestionsById', getQuestionsById);

//Route to get total question count in database
router.get('/getTotalQuestions', getCountTotalQuestions);

//Route to get total distinct subjects count in database
router.get('/getTotalSubjects', getTotalSubjectsCount);

//Route to get total paper count in database
router.get('/getTotalPapers', getTotalPaperCount);

//Route to delete question in database
router.delete('/deleteQuestion', deleteQuestion);

//Route to edite question in database
router.put('/editQuestion', editQuestion);


export default router;

