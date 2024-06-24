import asyncHandler from "express-async-handler";

import { getSubjectsInfo as getSubjectsInfoFromModel } from "../models/paperModel.js";
import { addPaper as addPaperToModel } from "../models/paperModel.js";
import { addPaperQuestions as addPaperQuestionToModel } from "../models/paperModel.js";
import { getPaperBySubject as getPaperBySubjectFromModel } from "../models/paperModel.js";
import { getQuestionIdsByPaperId as getQuestionIdsByPaperIdFromModel } from "../models/paperModel.js";
import { getSelectedQuestionsSummery as getQuestionByIdFromModel } from "../models/paperModel.js";
import { getQuestionMarksBySubjectAreas as getQuestionMarksBySubjectAreasFromModel } from "../models/paperModel.js";
import { getQuestionMarksByDifficultyLevel as getQuestionMarksByDifficultyLevelFromModel } from "../models/paperModel.js";
import { getSubQuestionIdsByPaperId as getSubQuestionIdsByPaperIdFromModel } from "../models/paperModel.js";
import { getSubSubQuestionIdsByPaperId as getSubSubQuestionIdsByPaperIdFromModel } from "../models/paperModel.js";
import { getResourcesBySubject as getResourcesBySubjectFromModel } from "../models/paperModel.js";
import { addResourcesBySubject as addResourcesBySubjectToModel } from "../models/paperModel.js";
import { getDistinctResources as getDistinctResourcesFromModel } from "../models/paperModel.js";


//get Subjects Info
const getSubjectsInfo = asyncHandler(async (req, res) => {
  const subjectInfo = await getSubjectsInfoFromModel()
  res.status(200).json({
    subjectInfo
  })
});


//add Paper
const addPaper = async (paperName, paperSubject, paperExam) => {
  const paperId = await addPaperToModel(paperName, paperSubject, paperExam);
  if (paperId) {
    return paperId;
  } else {
    return null; // or false, indicating failure
  }
}


//add paper questions to paper_questions table
const addPaperQuestions = asyncHandler(async (req, res) => {
  const {
    paperName,
    paperSubject,
    paperExam,
    selectedIds,
    selectSubId,
    selectSubSubId
  } = req.body.paperData;


  const paperId = await addPaper(paperName, paperSubject, paperExam);
  const result = await passPaperQuestionsToModel(paperId, selectedIds, selectSubId, selectSubSubId);


  if (result) {
    res.status(200).json({
      message: "Paper questions added successfully"
    });
  } else {
    res.status(500).json({
      message: "Failed to add paper questions"
    });
  }

});

const passPaperQuestionsToModel = async (paperId, selectedId, selectSubId, selectSubSubId) => {
  const result = await addPaperQuestionToModel(paperId, selectedId, selectSubId, selectSubSubId);
  return result;
}


// get Papers by subject
const getPaperBySubject = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const paperBySubject = await getPaperBySubjectFromModel(subject);
  res.status(200).json({
    paperBySubject
  });
});

//get question ids by paper id
const getQuestionIdsByPaperId = asyncHandler(async (req, res) => {
  const { paperId } = req.query;
  const questionIds = await getQuestionIdsByPaperIdFromModel(paperId);
  const subQuestionIds = await getSubQuestionIdsByPaperIdFromModel(paperId);
  const subSubQuestionIds = await getSubSubQuestionIdsByPaperIdFromModel(paperId);
  res.status(200).json({
    questionIds,
    subQuestionIds,
    subSubQuestionIds
  });
});


//get selected question Summery for heat map
const getSelectedQuestionsSummery = asyncHandler(async (req, res) => {
  const selectedIds = req.query.selectedIds;

  const selectedQuestionsSummeryQuery = await getQuestionByIdFromModel(selectedIds);
  const transformToChartData = (result) => {
    const series = [];

    // Iterate over each row in the result
    result.forEach(row => {
      // Extract data from the row
      const subjectArea = row.distant_subject_area;
      const easyQuestions = row.easy_questions;
      const mediumQuestions = row.medium_questions;
      const hardQuestions = row.hard_questions;

      // Construct data points for each metric
      const metric1 = { x: 'Easy Questions', y: easyQuestions };
      const metric2 = { x: 'Medium Questions', y: mediumQuestions };
      const metric3 = { x: 'Hard Questions', y: hardQuestions };

      // Construct the series object for the subject area
      const seriesItem = {
        name: subjectArea,
        data: [metric1, metric2, metric3]
      };
      // Add the series object to the series array
      series.push(seriesItem);
    });
    return series;
  };
  // Assuming 'result' is the array of objects returned by your query
  const chartData = transformToChartData(selectedQuestionsSummeryQuery);
  res.status(200).json(chartData);
});


//get question marks by subject areas
const getQuestionMarksBySubjectAreas = asyncHandler(async (req, res) => {
  const selectedIds = req.query.selectedIds;
  const questionMarksBySubjectAreas = await getQuestionMarksBySubjectAreasFromModel(selectedIds);
  res.status(200).json({
    questionMarksBySubjectAreas
  });
});

//get question marks by Difficulty Level	
const getQuestionMarksByDifficultyLevel = asyncHandler(async (req, res) => {
  const selectedIds = req.query.selectedIds;
  const questionMarksByDifficultyLevel = await getQuestionMarksByDifficultyLevelFromModel(selectedIds);
  res.status(200).json({
    questionMarksByDifficultyLevel
  });
});

//get resources by subject
const getResourcesBySubject = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const resources = await getResourcesBySubjectFromModel(subject);
  res.status(200).json({
    resources
  });
});  

//add resources by subject
const addResourcesBySubject = asyncHandler(async (req, res) => {
  const formData  = req.body.formData; 

  
  
let finalLink;
const FileLink = formData.fileLink;
const link = formData.link;
const file = formData.file;

if (link === ''){
  finalLink=FileLink;
}else{
  finalLink=file;
}
  
const {subject, resourceTypeForModal,name} = formData;
  const result = addResourcesBySubjectToModel(subject, resourceTypeForModal,link,name,finalLink);
  if (result) {
    res.status(200).json({
      message: "Resource added successfully"
    });
  } else {
    res.status(500).json({
      message: "Failed to add resource"
    });
  }
});


// add resources file
const addResources = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  } else {
    res.status(200).json({ message: 'File uploaded successfully' });
  }
});

// get distinct resources type
const getDistinctResources = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const distinctResources = await getDistinctResourcesFromModel(subject);
  res.status(200).json({
    distinctResources
  });
});


export {
  getSubjectsInfo, addPaperQuestions, getPaperBySubject, getQuestionIdsByPaperId, getSelectedQuestionsSummery,
  getQuestionMarksBySubjectAreas, getQuestionMarksByDifficultyLevel,getResourcesBySubject,addResourcesBySubject,getDistinctResources,addResources
};