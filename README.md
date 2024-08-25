# Northcoders News API

Create Environment Files

You'll need to create two environment files in the root directory: .env.development and .env.test.

.env.development
PGDATABASE=nc_news_test

.env.test
PGDATABASE=nc_news
Ensure these files are NOT tracked by git. They should already be listed in the .gitignore file.

Set Up Databases

Create the development and test databases by running the SQL scripts provided in /db/setup.sql

Project Structure
db/: Contains database setup scripts, seed data, and SQL files.
data/: Contains mock data used for seeding the development database.
index.js: Exports all the data from the data folder for easy access.

--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
