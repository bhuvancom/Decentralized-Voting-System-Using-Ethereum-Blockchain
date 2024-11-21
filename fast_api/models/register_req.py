from pydantic import BaseModel

from models.role import Role


class RegisterReq(BaseModel):
    username:str
    password:str
    role:Role