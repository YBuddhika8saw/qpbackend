import { query } from "../config/db.js";
import asyncHandler from 'express-async-handler';


// Function to get distinct subjects along with the number of questions and papers for each subject
const getSubjectsInfo = asyncHandler(async () => {
  const getSubjectsInfoQuery = `
        SELECT 
            subject,
            COUNT(*) AS total_questions,
            (SELECT COUNT(*) FROM paper WHERE paper.subject = questions.subject) AS total_papers
        FROM 
            questions
        GROUP BY 
            subject;
    `;
  try {
    const result = await query(getSubjectsInfoQuery);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get subjects info from database");
  }
});


// Add a paper to the database
const addPaper = async (pName, pSubject, pExam) => {
  const subjectUpperCase = pSubject.toUpperCase();
  const addPaperQuery = `
      INSERT INTO paper (paper_name, subject, exam_name)
      VALUES (?, ?, ?);`;
  try {
    const result = await query(addPaperQuery, [
      pName,
      subjectUpperCase,
      pExam
    ]);
    const paperId = result.insertId;

    return paperId;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to add paper to database");
  }
};

const addPaperQuestions = async (paperId, questionIds, subQuestionIds, subSubQuestionIds) => {
  const addPaperQuestionQuery = `
      INSERT INTO paper_questions (paper_id, question_id)
      VALUES (?, ?);`;

  const addPaperSubQuestionQuery = `
      INSERT INTO paper_sub_questions (paper_id, question_id, sub_question_id)
      VALUES (?, ?, ?);`;

  const addPaperSubSubQuestionQuery = `
      INSERT INTO paper_sub_sub_questions (paper_id, sub_question_id, sub_sub_question_id)
      VALUES (?, ?, ?);`;

  try {
    // Insert questions
    const questionPromises = questionIds.map(questionId => 
      query(addPaperQuestionQuery, [paperId, questionId])
    );

    // Insert sub-questions
    const subQuestionPromises = subQuestionIds.flatMap(subArray => {
      const [questionId, ...subQuestionIds] = subArray;  // Destructure to get questionId and subQuestionIds
      return subQuestionIds.map(subQuestionId => 
        query(addPaperSubQuestionQuery, [paperId, questionId, subQuestionId])
      );
    });

    // Insert sub-sub-questions
    const subSubQuestionPromises = subSubQuestionIds.flatMap(subArray => {
      const [subQuestionId, ...subSubQuestionIds] = subArray;  // Destructure to get subQuestionId and subSubQuestionIds
      return subSubQuestionIds.map(subSubQuestionId => 
        query(addPaperSubSubQuestionQuery, [paperId, subQuestionId, subSubQuestionId])
      );
    });

    // Await all promises
    await Promise.all([
      ...questionPromises,
      ...subQuestionPromises,
      ...subSubQuestionPromises
    ]);

    return true;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to add questions to paper");
  }
};




//get papers by subject
const getPaperBySubject = asyncHandler(async (subject) => {
  const getPapersQuery = `SELECT * FROM paper WHERE subject = ?;`;
  try {
    const result = await query(getPapersQuery, [subject]);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get subjects info from database");
  }
});

//get questionIds from paper_questions table filtered by paper_id
const getQuestionIdsByPaperId = asyncHandler(async (paperId) => {
  const getQuestionIdsQuery = `SELECT question_id FROM paper_questions WHERE paper_id = ?;`;
  try {
    const result = await query(getQuestionIdsQuery, [paperId]);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get question ids from database");
  }
});


const getSubQuestionIdsByPaperId = asyncHandler(async (paperId) => {
  const getQuestionIdsQuery = `SELECT question_id, sub_question_id FROM paper_sub_questions WHERE paper_id = ?;`;

  try {
    const result = await query(getQuestionIdsQuery, [paperId]);
    
    // Organize the result into the desired format
    const questionMap = new Map();

    result.forEach(row => {
      const { question_id, sub_question_id } = row;
      if (!questionMap.has(question_id)) {
        questionMap.set(question_id, [question_id]); // Initialize with question_id at the 0 index
      }
      questionMap.get(question_id).push(sub_question_id);
    });

    // Convert the map values to an array of sub-arrays
    const organizedResult = Array.from(questionMap.values());
    return organizedResult;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get question ids from database");
  }
});


const getSubSubQuestionIdsByPaperId = asyncHandler(async (paperId) => {
  const getQuestionIdsQuery = `SELECT sub_question_id, sub_sub_question_id FROM paper_sub_sub_questions WHERE paper_id = ?;`;
  
  try {
    const result = await query(getQuestionIdsQuery, [paperId]);
    
    // Organize the result into the desired format
    const questionMap = new Map();

    result.forEach(row => {
      const { sub_question_id, sub_sub_question_id } = row;
      if (!questionMap.has(sub_question_id)) {
        questionMap.set(sub_question_id, [sub_question_id]); // Initialize with question_id at the 0 index
      }
      questionMap.get(sub_question_id).push(sub_sub_question_id);
    });

    // Convert the map values to an array of sub-arrays
    const organizedResult = Array.from(questionMap.values());
    return organizedResult;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get question ids from database");
  }
});

//function to get selected question summery for heat map
const getSelectedQuestionsSummery = asyncHandler(async (selectedIds) => {

  if (selectedIds.length === 0) {
    return [];
  }else{

  // Convert selectedIds string to an array of integers
  const selectedIdsArray = selectedIds.split(',').map(id => parseInt(id.trim(), 10));

  // Generate placeholders for each ID in selectedIdsArray
  const placeholders = selectedIdsArray.map(() => '?').join(',');

  const getQuestionIdsQuery = `
    SELECT 
      DISTINCT(subject_area) AS distant_subject_area,
      COUNT(*) AS total_questions,
      SUM(CASE WHEN difficulty_level = 1 THEN 1 ELSE 0 END) AS easy_questions,
      SUM(CASE WHEN difficulty_level = 2 THEN 1 ELSE 0 END) AS medium_questions,
      SUM(CASE WHEN difficulty_level = 3 THEN 1 ELSE 0 END) AS hard_questions
    FROM 
      questions
    WHERE 
      question_id IN (${placeholders})
    GROUP BY 
      subject_area;
  `;
  try {
    const result = await query(getQuestionIdsQuery, selectedIdsArray);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get question ids from database");
  }
}
});

//function for get question marks by subject Areas
const getQuestionMarksBySubjectAreas = asyncHandler(async (selectedIds) => {

  // Convert selectedIds string to an array of integers
  const selectedIdsArray = selectedIds.split(',').map(id => parseInt(id.trim(), 10));

  // Generate placeholders for each ID in selectedIdsArray
  const placeholders = selectedIdsArray.map(() => '?').join(',');

  const getQuestionIdsQuery = `
  SELECT 
    subject_area AS distinct_subject_area,
    SUM(mark) AS total_marks,
    COUNT(question_id) AS question_count
  FROM 
    questions 
  WHERE 
    question_id IN (${placeholders}) 
  GROUP BY 
    subject_area;
`;


  try {
    const result = await query(getQuestionIdsQuery, selectedIdsArray);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get question ids from database");
  }
});

//function for get question marks by defuculty level
const getQuestionMarksByDifficultyLevel = asyncHandler(async (selectedIds) => {

  // Convert selectedIds string to an array of integers
  const selectedIdsArray = selectedIds.split(',').map(id => parseInt(id.trim(), 10));

  // Generate placeholders for each ID in selectedIdsArray
  const placeholders = selectedIdsArray.map(() => '?').join(',');

  const getQuestionIdsQuery = `
  SELECT 
    SUM(CASE WHEN difficulty_level = 1 THEN mark ELSE 0 END) AS easy_marks,
    SUM(CASE WHEN difficulty_level = 2 THEN mark ELSE 0 END) AS medium_marks,
    SUM(CASE WHEN difficulty_level = 3 THEN mark ELSE 0 END) AS hard_marks,
    COUNT(CASE WHEN difficulty_level = 1 THEN 1 ELSE NULL END) AS easy_count,
    COUNT(CASE WHEN difficulty_level = 2 THEN 1 ELSE NULL END) AS medium_count,
    COUNT(CASE WHEN difficulty_level = 3 THEN 1 ELSE NULL END) AS hard_count
  FROM 
    questions
  WHERE  
    question_id IN (${placeholders});
`;
  try {
    const result = await query(getQuestionIdsQuery, selectedIdsArray);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get question ids from database");
  }
});

//get resources by subject
const getResourcesBySubject = asyncHandler(async (subject) => {
  const getResourcesQuery = `SELECT * FROM resources WHERE subject = ?;`;
  try {
    const result = await query(getResourcesQuery, [subject]);
    return result;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get resources from database");
  }
});

//add resources by subject
const addResourcesBySubject = asyncHandler(async (subject, resource_type,resource_link,Name,resources_name) => {


  
  const addResourcesQuery = `
    INSERT INTO resources (subject, resource_type, resource_link, name,resource_name)
    VALUES (?, ?, ?, ?, ?);
  `;
  try {
    await query(addResourcesQuery, [subject, resource_type,resource_link,Name,resources_name]);
    return true;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to add resources to database");
  }
});

//get distinct resources
const getDistinctResources = asyncHandler(async (subject) => {
  const getDistinctResourcesQuery = `SELECT DISTINCT resource_type FROM resources WHERE subject = ?;`;

  try {
    const result = await query(getDistinctResourcesQuery, [subject]);

    // Map the result to extract resource_type into a single array
    const resourceTypes = result.map(row => row.resource_type);

    return resourceTypes;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw new Error("Failed to get distinct resources from database");
  }
});



export {
  getSubjectsInfo, addPaper, addPaperQuestions, getPaperBySubject, getQuestionIdsByPaperId,
  getSelectedQuestionsSummery, getQuestionMarksBySubjectAreas, getQuestionMarksByDifficultyLevel,getSubQuestionIdsByPaperId,
  getSubSubQuestionIdsByPaperId,getResourcesBySubject,addResourcesBySubject,getDistinctResources
};