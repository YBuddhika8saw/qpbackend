import express from 'express';
import AWS from 'aws-sdk';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import multiparty from 'multiparty';

// configure the keys for accessing AWS


// create S3 instance
const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type) => {
  const params = {
    Body: buffer,
    Bucket: 'qpaper',
    ContentType: type.mime,
    Key: `${name}`,
  };

  return s3.upload(params).promise()
    .then((data) => {
      console.log('File uploaded successfully:');
      console.log('data', data);
      return data;
    })
    .catch((err) => {
      console.error('Error uploading file:', err);
      throw err;
    });
};

// Define POST route
const upFile = (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, async (error, fields, files) => {
    if (error) {
      console.error('Error parsing form:', error);
      return res.status(500).send(error);
    }
    try {
      const path = files.file[0].path;
      const upFileName = files.file[0].originalFilename;
      const buffer = fs.readFileSync(path);
      const type = await fileTypeFromBuffer(buffer);
      if (!type) {
        return res.status(400).send({ error: 'Unable to determine file type' });
      }
      const fileName = `bucketFolder/${upFileName}`;
    //   const fileName = `bucketFolder/${Date.now().toString()}`;
      const data = await uploadFile(buffer, fileName, type);
      return res.send(data);
    } catch (err) {
      console.error('Error in file upload process:', err);
      return res.status(500).send(err);
    }
  });
};


const showFile = (req, res) => {
  const resource_name = req.query.resource_name;

  console.log(typeof(resource_name));

  const params = {
    Bucket: 'qpaper',
    Key: resource_name,
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error('Error getting object:', err);
      return res.status(500).send(err);
    }
    res.set('Content-Type', data.ContentType);
    return res.send(data.Body);
  });
}; 



const getSignedUrl = (req,res) => {
  const key = req.query.key;
  const params = { Bucket: 'qpaper', Key: key, Expires: 600 }; // Expires in 60 seconds
  const url = s3.getSignedUrl('getObject', params);
  return res.send(url);
};



export { upFile ,showFile,getSignedUrl}
