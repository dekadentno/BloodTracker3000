# BloodTracker3000

BloodTracker3000 is a Node.js application that fetches and tracks blood donation statistics for Osječko-Baranjska county. It sends email notifications when your blood type falls below a user-defined threshold.

## Prerequisites

Before running BloodTracker3000, ensure you have the following prerequisites installed:

* Node.js 12 or higher
* npm 6 or higher

## Running locally

```
# install requirements
npm i

# generate an [App Password](https://myaccount.google.com/apppasswords) on your Gmail account

# rename the .env.example file to .env and populate it with your Gmail address and the generated App Password.
mv .env.example .env

# start the app
npm run start
```

This will fetch the blood donation statistics and send email notifications if your blood type falls below the specified threshold.

## Using it in a cron job
To schedule BloodTracker3000 as a cron job, follow these steps:

```
# open the crontab editor
crontab -e

# add the following line to the end of the file, with the real path
59 23 * * * $(which npm) run start --prefix /path/to/your/project
```