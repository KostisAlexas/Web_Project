# Web_Project
Run in terminal:
1) Navigate to the directory you want to clone repo
2) git clone https://github.com/KostisAlexas/Web_Project.git
3) npm install && (cd backend && npm install) && (cd frontend && npm install)
4) npm start

 You may also have to import postgres database to your postgress database and modify the env files with your passwords

All communication with database is done asyncronously and is protected by middleware
All authentications via middleware are done with JWT tokens ( you can modify secret key in backend/.env )

Examples:
Professor_id = 333, password=pass
