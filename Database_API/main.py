# Import required modules
import os
from hashlib import sha256

import dotenv
import jwt
import mysql.connector
import uvicorn
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector import errorcode
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

from models.login_req import LoginReq
from models.register_req import RegisterReq

# Loading the environment variables
dotenv.load_dotenv()

# Create a Limiter instance
limiter = Limiter(key_func=get_remote_address)

# Initialize the app
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# Define the allowed origins for CORS
origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to the MySQL database
try:
    cnx = mysql.connector.connect(
        user=os.environ['MYSQL_USER'],
        password=os.environ['MYSQL_PASSWORD'],
        host=os.environ['MYSQL_HOST'],
        database=os.environ['MYSQL_DB'],
    )
    cursor = cnx.cursor()
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)


# Define the POST endpoint for login
@app.post("/login")
@limiter.limit("50/minute")
async def login(request: Request, usr: LoginReq):
    role = await login_and_get_role(usr.username, usr.password)
    # Assuming authentication is successful, generate a token
    return create_token(usr.username, role)


def create_token(username: str, role: str):
    token = jwt.encode({'voter_id': username, 'role': role}, os.environ['SECRET_KEY'],
                       algorithm='HS256')
    return {'token': token, 'role': role}


@app.post("/register")
@limiter.limit("10/second")
async def register(request: Request, usr: RegisterReq):
    global cursor
    try:
        cursor = cnx.cursor()
        userName = usr.username
        cursor.execute("""
        select voter_id from voters where
        voter_id = %(voter_id)s
        """, {
            'voter_id': userName
        })
        user = cursor.fetchone()
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )
        else:
            password = sha256(usr.password.encode()).hexdigest()
            role = usr.role.value
            cursor.execute("""
            INSERT INTO voters (voter_id, role, password) values (%(voter_id)s, %(role)s, %(password)s)
            """, {
                'voter_id': userName,
                'role': role,
                'password': password
            })
            cnx.commit()
            return create_token(usr.username, role)
    except mysql.connector.Error as err:
        print(err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )
    finally:
        cursor.close()


async def login_and_get_role(voter_id, password):
    global cursor
    try:
        cursor = cnx.cursor();
        cursor.execute("""SELECT password, role FROM voters WHERE 
        voter_id = %(voter_id)s """, {
            'voter_id': voter_id
        })
        user = cursor.fetchone()
        if user:
            pw_hash = sha256(password.encode()).hexdigest()
            if pw_hash != user[0]: #check if stored hash and this has are same
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username/voterId or password"
                )
            return user[1]
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/voterId or password"
            )
    except mysql.connector.Error as err:
        print(err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error"
        )
    finally:
        cursor.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
