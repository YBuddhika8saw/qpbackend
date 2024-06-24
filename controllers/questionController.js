import asyncHandler from "express-async-handler";
import { addQuestion as addQuestionToModel } from "../models/questionModel.js";
import { getSubjects as getSubjectsFromModel } from "../models/questionModel.js";
import { getQuestions as getQuestionsFromModel } from "../models/questionModel.js";
import { getQuestionById as getQuestionByIdFromModel } from "../models/questionModel.js";
import { getTotalQuestionCount as getTotalQuestionCountFromModel } from "../models/questionModel.js";
import { getTotalDistinctSubjectsCount as getTotalDistinctSubjectsCountFromModel } from "../models/questionModel.js";
import { getTotalPaperCount as getTotalPaperCountFromModel } from "../models/questionModel.js";
import { deleteQuestion as deleteQuestionFromModel } from "../models/questionModel.js";
import { editQuestion as editQuestionFromModel } from "../models/questionModel.js";
import path from 'path';

//add question
const addQuestion = asyncHandler(async (req, res) => {
  // Check if req.body exists before destructure
  if (!req.body) {
    res.status(400).send("Bad request: Request body is missing.");
    return;
  }

  const {
    qText,
    qTime,
    qType,
    qSubject,
    qSubjectArea,
    qDifficulty,
    qSpace,
    qMarks,
    qImage
  } = req.body.formData;

  const question = await addQuestionToModel(
    qText,
    qTime,
    qType,
    qSubject,
    qSubjectArea,
    qDifficulty,
    qSpace,
    qMarks,
    qImage
  );

  if (question) {
    res.status(201).json({
      'key': 'success',
    });
    console.log("Question added successfully");
  } else {
    res.status(400);
    throw new Error("Invalid question data");
  }
});

//Upload image file
const addImg = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  res.status(200).json({
    filename: file.filename,
    path: path.join('frontend/src/assets/images/uploads', file.filename),
  });
});

//get subjects in database question table
const getSubjectList = asyncHandler(async (req, res) => {
  const subjects = await getSubjectsFromModel()
  if (subjects) {
    res.status(200).json({
      subjects
    })
  } else {
    res.status(400).json({
      message: 'Invalid verification token or token expired',
    })
  }
});

//get all questions in database question table filtered by subject
const getQuestions = asyncHandler(async (req, res) => {
  const subject = req.query.subject;
  const questions = await getQuestionsFromModel(subject)
  if (questions) {
    res.status(200).json({
      questions
    })
  } else {
    res.status(400).json({
      message: 'Invalid verification token or token expired',
    })
  }
});


//get question in database question table filtered by Question id
const getQuestionsById = asyncHandler(async (req, res) => {
  const qId = req.query.qId;
  const questions = await getQuestionByIdFromModel(qId)
  if (questions) {
    res.status(200).json({
      questions
    })
  } else {
    res.status(400).json({
      message: 'Invalid verification token or token expired',
    })
  }
});

//get question count
const getCountTotalQuestions = asyncHandler(async (req, res) => {
  const questionsCount = await getTotalQuestionCountFromModel()
  res.status(200).json({
    questionsCount
  })
});

//get subject count
const getTotalSubjectsCount = asyncHandler(async (req, res) => {
  const subjectCount = await getTotalDistinctSubjectsCountFromModel()
  res.status(200).json({
    subjectCount
  })
});

//get paper count
const getTotalPaperCount = asyncHandler(async (req, res) => {
  const paperCount = await getTotalPaperCountFromModel()
  res.status(200).json({
    paperCount
  })
});


//delete question
const deleteQuestion = asyncHandler(async (req, res) => {
  const qId = req.query.qId;
  const result = await deleteQuestionFromModel(qId)
  if (result) {
    res.status(200).json({
      result
    })
  } else {
    res.status(400).json({
      message: 'Invalid verification token or token expired',
    })
  }
});

//edite question
const editQuestion = asyncHandler(async (req, res) => {
  
  const {
    qText,
    qTime,
    qType,
    qSubject,
    qSubjectArea,
    qDifficulty,
    qSpace,
    qMarks,
    qId
  } = req.body.formData;

  const result = await editQuestionFromModel(
    qId,
    qText,
    qTime,
    qType,
    qSubject,
    qSubjectArea,
    qDifficulty,
    qSpace,
    qMarks
  )

  if (result) {
    res.status(200).json({
      result
    })
  } else {
    res.status(400).json({
      message: 'Invalid verification token or token expired',
    })
  }
});



export {
  addQuestion, addImg, getSubjectList, getQuestions, getQuestionsById,
  getCountTotalQuestions, getTotalSubjectsCount, getTotalPaperCount, deleteQuestion, editQuestion
};
