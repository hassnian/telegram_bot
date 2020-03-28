# This Python file uses the following encoding: utf-8
from bs4 import BeautifulSoup, NavigableString, Tag
import json
import csv


html_doc="<div class='history'></div>"

soup = BeautifulSoup(html_doc, 'html.parser')

history = soup.findAll('div', {'class': 'history'})

actual_date = ''
last_from_name = ''
messages = []

main_user = " Hassnian Idrees "

for message in history[0].children:
    if isinstance(message, NavigableString):
        continue
    if isinstance(message, Tag):
        if message.find('div', {'class': 'media_photo'}):
            continue
        if message.find('div', {'class': 'media_voice_message'}):
            continue
        if message.find('div', {'class': 'media_call'}):
            continue
        if message.find('div', {'class': 'media_video'}):
            continue
        if message.find('div', {'class': 'media_file'}):
            continue
        if 'service' in message['class']:
            actual_date = message.text
            continue
        if not hasattr(message.find('div', {'class': 'text'}), 'text'):
            continue
        if 'joined' not in message['class']:
            hour = message.find('div', {'class': 'date'}).text
            text = message.find('div', {'class': 'text'}).text
            from_name = message.find('div', {'class': 'from_name'}).text
            last_from_name = from_name
            messages.append({
                'hour': hour,
                'date': actual_date ,
                'text': text,
                'from_name': from_name,
                'user': 0 if from_name == main_user else 1  ,
            })
            continue
        if 'joined' in message['class']:
            hour = message.find('div', {'class': 'date'}).text
            text = message.find('div', {'class': 'text'}).text
            from_name = last_from_name
            messages.append({
                'hour': hour,
                'date': actual_date,
                'text': text,
                'from_name': from_name,
                'user': 0 if from_name == main_user else 1 ,
            })


file_output_name="Example.json"


with open(file_output_name, 'w') as json_file:
    json.dump(messages, json_file)


header = ['hour', 'date', 'text', 'from_name', 'user']


with open(file_output_name , 'w') as csv_file:
    csv_writer = csv.writer(csv_file, delimiter=',')
    csv_writer.writerow(header)
    for message in messages:
        csv_writer.writerow([
            message['hour'],
            message['date'],
            message['text'],
            message['from_name'],
            message['user'],
        ])




