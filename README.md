# Organization Relationships

Back-end development skill assessment task

## Getting Started

### Prerequisites
* [Git](https://git-scm.com/docs)
* [Docker](https://docs.docker.com/install/)

### Preparing the application
1. Clone this repository to your machine. Navigate to root folder `pd-backend/`.
2. Open the `.env` file and configure the environment variables and credentials for the database.
3. Run `docker-compose up --build --detach` to install the application.
4. Verify that the containers were built and are running by typing `docker ps -a` on the terminal. The containers for the application and the database must be listed.
5. Run the database script __1-create-database__ _(found in /database folder)_ against the database instance to create the required tables. The last script should display an empty table named __org_tree__.

### Running the API
From a Request client, the endpoints can be accessed through:
1. __POST__  to **__http://${SERVER_HOST}:${SERVER_PORT}/__** with request body of `application/json` type
2. __GET__ to **__http://${SERVER_HOST}:${SERVER_PORT}/organisation/:pageNumber/:itemsPerPage__**

## Built With

* [Node.js](https://nodejs.org/en/about/)
* [NPM](https://docs.npmjs.com/)
* [Express](https://expressjs.com/)
* [Sequelize](https://sequelize.org/master/)
* [MySQL](https://dev.mysql.com/doc/)

## Authors

* **J. Cabuyadao** - [GitHub](https://github.com/jmjcabuyadao) | [LinkedIn](https://www.linkedin.com/in/jmjcabuyadao)