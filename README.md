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
3. pnpm
4. Python, pip, & the required dependencies (listed inside of the requirements.txt)
5. mySQL Server
6. git, random-seedable, sqids, @react-pdf/renderer

Also, ensure that you have a .env file with credentials for the database as well. The flask application in the backend will search for the proper info
in order to connect to the database instance which you create, which can be done through a tool like MySQL Workbench.

######                                  ######
######          RUNNING LOCALLY         ######
######                                  ######

1. Clone the depository in a terminal by doing the following:

'''git clone https://github.com/csolis-97/japanese-placement-test.git'''

2. In your terminal, install the dependencies for TypeScript:
'''pnpm install random-seedable
pnpm install sqids
pnpm add @react-pdf/renderer'''

3. In your terminal, install the dependencies for Python by doing the following (if the file cannot be found, make sure you did "cd testrepo" first):
'''pip install -r requirements.txt'''

4. In order to run the front end, open a new terminal and enter the following:

'''cd testrepo
pnpm dev
'''

5. Create a database using the seeding files provided under testrepo/api/seed, namely local_test_database.sql and test_data, using a tool like MySQLWorkbench. If you would like to make your own data, you are welcome to do so.

6. In index.py, Uncomment the local import statements and database creation function alongside the objects created by calling the function, and the last two lines for running in debug. Comment out the ones used by Vercel as well.

7. In order to run the back end, open another new terminal and enter the following:

'''cd testrepo/api
python index.py
'''


######                                  ######
######              NOTES               ######
######                                  ######

This is not a placement test application with extensive features such as sending the results via email address or handling a user leaving the test halfway through it. Also, there is a bug with the furigana sometimes for some words not being displayed despite the kanji not yet being learned at the current difficulty level.
