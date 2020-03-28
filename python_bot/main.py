from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
import json
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio

messages = []

train_bot_file='data/franco/Franco.json'
bot_name='HassnianBot'

with open(train_bot_file) as json_file:
    data = json.load(json_file)
    for message in data:
        messages.append(message['text'])

chatbot = ChatBot(bot_name)

trainer = ListTrainer(chatbot)

trainer.train(messages)


async def get_msg_response(question):
    response = chatbot.get_response(question)
    return response

app = FastAPI()

class Question(BaseModel):
    sentence: str

@app.post("/question")
async def read_root(question: Question):
    response = await get_msg_response(question.sentence)
    return {'answer' : str(response) }