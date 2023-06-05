const axios = require('axios');
const nodemailer = require('nodemailer');

require('dotenv').config({
  path: `${__dirname}/.env`
});

// global variables
const threshold = parseInt(process.env.TRESHOLD) / 100;
const user = process.env.EMAIL_USERNAME;
const pass = process.env.EMAIL_PASSWORD;
const to = process.env.RECIPIENT_EMAIL;
const myBloodType = process.env.BLOOD_TYPE;

var bloodTypeMetadata = {
  'O+': {
    full: 500,
  },
  'O-': {
    full: 86,
  },
  'A+': {
    full: 457,
  },
  'A-': {
    full: 86,
  },
  'B+': {
    full: 229,
  },
  'B-': {
    full: 43,
  },
  'AB+': {
    full: 114,
  },
  'AB-': {
    full: 43,
  }
}

async function getBloodDonationData() {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    const url = `https://www.kbco.hr/wp-content/krvstats/${formattedDate}.html`;
    const response = await axios.get(url);
    const data = response.data;
    const parsedData = parseData(data);

    processBloodDonationData(parsedData);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function parseData(data) {
  const lines = data.split('\n');
  const headers = lines[0].split('|');
  const dataArray = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('|');
    const obj = {};

    for (let j = 0; j < headers.length; j++) {
      let propertyName = headers[j];
      propertyName = propertyName.replace('\r', ''); // remove carriage return characters
      if (propertyName === 'POSTOTAK') continue; // we don't need it, it's junk data

      let value = values[j];
      if (value !== undefined) {
        value = value.replace('\r', ''); // remove carriage return characters
      }

      if (propertyName === 'GRUPA') propertyName = 'bloodType';
      if (propertyName === 'BROJ') propertyName = 'number';

      obj[propertyName] = value;
    }

    if (bloodTypeMetadata[obj.bloodType]) {
      dataArray.push(obj);
    }
  }

  for (let bloodObj of dataArray) {
    // loop once again because it's too late to optimize anything
    bloodObj['percentage'] = parseInt(bloodObj.number) / (bloodTypeMetadata[bloodObj.bloodType].full / 100) > 100 ? 100 : parseInt(bloodObj.number) / bloodTypeMetadata[bloodObj.bloodType].full
  }

  return dataArray;
}


function processBloodDonationData(data) {
  let formattedString = '';
  let isLowerThanTreshold = false;
  for (let i = 0; i < data.length; i++) {
    const { bloodType, percentage } = data[i];

    const formattedPercentage = (percentage * 100).toFixed(2);
    const line = `${bloodType}: ${formattedPercentage}%\n`;

    formattedString += line;

    if (bloodType === myBloodType && percentage < threshold) {
      isLowerThanTreshold = true;
    }
  }

  if (isLowerThanTreshold) sendEmail(formattedString)
}

function sendEmail(formattedString) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  const message = {
    from: user,
    to: to,
    subject: `Blood levels in OBŽ - your blood level is critically low`,
    text: `Your blood level (${myBloodType} is low.\n\n${formattedString})`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

getBloodDonationData();
