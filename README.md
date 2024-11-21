# Decentralized-Voting-System-Using-Ethereum-Blockchain

#### The Decentralized Voting System using Ethereum Blockchain is a secure and transparent solution for conducting elections. Leveraging Ethereum's blockchain technology, this system ensures tamper-proof voting records, enabling users to cast their votes remotely while maintaining anonymity and preventing fraud. Explore this innovative project for trustworthy and decentralized voting processes.

## Features

- Implements JWT for secure voter authentication and authorization.
- Utilizes Ethereum blockchain for tamper-proof and transparent voting records.
- Removes the need for intermediaries, ensuring a trustless voting process.
- Admin panel to manage candidates, set voting dates, and monitor results.
- Intuitive UI for voters to cast votes and view candidate information.

## Security

- DDOS prevention by restricting request/second.
- SQL injection prevention.
- Cross Site scripting prevention.

## Requirements

- Node.js (version – 18.14.0)
- Metamask
- Python (version – 3.9)
- FastAPI
- MySQL Database (port – 3306)

## Screenshots

![Login Page](./public/login%20ss.png)

![Admin Page](./public/admin%20ss.png)

![Voter Page](./public/index%20ss.png)

## Installation

1.  Open a terminal.

2.  Clone the repository by using the command

        git clone url

3.  Download and install [Ganache](https://trufflesuite.com/ganache/).

4.  Create a workspace named <b>developement</b>, in the truffle projects section add `truffle-config.js` by clicking `ADD PROJECT` button.

5.  Download [Metamask](https://metamask.io/download/) extension for the browser.

6.  Open metamask extention, Now create wallet (if you don't have one), then import accounts from ganache.

7.  Add network to the metamask. ( Network name - Localhost 7575, RPC URl - http://localhost:7545, Chain ID - 1337, Currency symbol - ETH)

8.  Open MySQL and create database named <b>voter_db</b>.

9.  In the database created, create new table named <b>voters</b> in the given format and add some values.

            CREATE TABLE voters (
            voter_id VARCHAR(36) PRIMARY KEY NOT NULL,
            role ENUM('admin', 'user') NOT NULL,
            password VARCHAR(255) NOT NULL
            );

    <br>

         +--------------------------------------+-------+-----------+
         | voter_id                             | role  | password  |
         +--------------------------------------+-------+-----------+
         |                                      |       |           |
         +--------------------------------------+-------+-----------+

10. Install truffle and browserify globally

        npm i -g truffle
        npm i -g browserify

11. Go to the root directory of repo and install node modules

        npm install

12. Install python dependencies

        pip install fastapi mysql-connector-python pydantic python-dotenv uvicorn uvicorn[standard] PyJWT

## Usage

#### Note: Update the database credentials in the `./fast_api/.env` file.

1.  Open terminal at the project directory

2.  Open Ganache and it's <b>development</b> workspace.

3.  open terminal in project's root directory and run the command

         truffle console

    then compile the smart contracts with command

         compile

    exit the truffle console

4.  Bundle app.js with browserify

        browserify ./src/js/app.js -o ./src/dist/app.bundle.js

5.  Start the node server server

        node index.js

6.  Navigate to `Database_API` folder in another terminal

        cd Database_API

    then start the database server by following command

        uvicorn main:app --reload --host 127.0.0.1

7.  In a new terminal migrate the truffle contract to local blockchain

        truffle migrate

You're all set! The Voting app should be up and running now at http://localhost:8080/.<br>

## Code Structure

<pre>
├── LICENSE
├── README.md
├── build
│   └── contracts
│       ├── Migrations.json
│       └── Voting.json
├── contracts
│   ├── 2_deploy_contracts.js
│   ├── Migrations.sol
│   └── Voting.sol
├── fast_api
│   ├── __pycache__
│   │   └── main.cpython-313.pyc
│   ├── main.py
│   ├── models
│   │   ├── __pycache__
│   │   │   ├── login_req.cpython-313.pyc
│   │   │   ├── register_req.cpython-313.pyc
│   │   │   └── role.cpython-313.pyc
│   │   ├── login_req.py
│   │   ├── register_req.py
│   │   └── role.py
│   └── requirements.txt
├── index.js
├── migrations
│   └── 1_initial_migration.js
├── package-lock.json
├── package.json
├── public
│   ├── admin ss.png
│   ├── favicon.ico
│   ├── index ss.png
│   └── login ss.png
├── src
│   ├── assets
│   │   └── eth5.jpg
│   ├── css
│   │   ├── admin.css
│   │   ├── index.css
│   │   ├── loader.css
│   │   ├── login.css
│   │   ├── popup.css
│   │   └── register.css
│   ├── html
│   │   ├── admin.html
│   │   ├── index.html
│   │   ├── login.html
│   │   └── register.html
│   └── js
│       ├── app.js
│       ├── auth-interceptor.js
│       ├── login.js
│       └── register.js
└── truffle-config.js
</pre>

## Thank you 😊
