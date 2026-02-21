# Japanese Placement Test
## Author
### Christopher Solis

Hello, and thank you for taking a look at my Japanese Placement Test project! This web application aims to provide users with a quick and easy-to-use tool
that assists them with determining their Japanese proficiency level. The test contains five stages covering material from the Minna no Nihongo Beginner I
book, alongside some of the material from the Minna no Nihongo Beginner II book: Beginner I, Beginner I, Intermediate I, Intermediate II, and Advanced. 
If the user scores a total of 80% or more on each stage (starting from Beginner I), then they will move onto the next difficulty level. Otherwise, they
will place at the stage where they failed. The test will always pick random questions from a pool of questions from each stage, so ideally each user and
each attempt will not ask the same, repeated questions. If you are interested in using this project but would like to add questions or change the material
covered entirely, then feel free to do so while crediting the original author.


######                                  ######
######          TECHNOLOGIES USED       ######
######                                  ###### 

-***React.js***-: For building the front-end UI with components
-***Next.js***-: For all server-side rendering, alongside for the generation of the static pages
-***TailwindCSS***-: For the majority of the CSS styling within the application
-***TypeScript***-: A type-checking, safer alternative to JavaScript which communicates with the back-end, alongside handling display
logic on the front-end
-***HTML & CSS***-: The main foundation behind the pages of the web application
-***SQL***-: Used for all database management and querying within the application
-***MySQL Server***-: Used locally for managing the database
-***Python***-: Used in the backend for handling all calls from the front-end, alongside communicating with the database


######                                  ######
######          REQUIREMENTS            ######
######                                  ###### 

If you are interested in running this program locally, please ensure that the following are installed:

1. Node.js
2. Next.js & React
3. npm or yarn
4. Python, pip, & the required dependencies (listed inside of the requirements.txt within the backend directory)
5. mySQL Server
6. git

Also, ensure that you have a .env file with credentials for the database as well. The flask application in the backend will search for the proper info
in order to connect to the database instance which you create, which can be done through a tool like mySQL Workbench.

######                                  ######
######          RUNNING LOCALLY         ######
######                                  ######

1. Clone the depository in a terminal by doing the following:

'''git clone https://github.com/HansyToadsworth/TestRepo-Update.git'''

2. In your terminal, install the dependencies for Python by doing the following (if the file cannot be found, make sure you did "cd backend" first):
'''pip install -r requirements.txt'''

3. In order to run the front end, open a new terminal and enter the following:

'''cd testrepo
npm run dev
'''

4. In order to run the back end, open another new terminal and enter the following:

'''cd backend
python app.py
'''


######                                  ######
######              NOTES               ######
######                                  ######

This is not a fully complete placement test application. It is currently missing a method of properly creating a document that displays all of the
results, alongside sending said results to the relevant email addresses. Furthermore, some things like verifying that emails are in proper format
using Regex, dealing with what happens when users leaving/refreshing the page, or random question order have not been implemented. 
