import telebot
import requests
import json
from secret import botToken
from telebot.types import MessageEntity

bot = telebot.TeleBot(botToken)

def send_quote(bot, id, author, quote) -> str:
    entity = MessageEntity("pre", offset=0, length=len(quote), language=author)
    bot.send_message(id, quote, entities=[entity])

@bot.message_handler(commands=['start'])
def start(message):
    resp = requests.get('https://api.breakingbadquotes.xyz/v1/quotes')
    if resp.status_code != 200:
        bot.send_message(message.chat.id, "Error happened")
        return
    
    data_json = resp.json()
    send_quote(bot, message.chat.id, data_json[0]['author'], data_json[0]['quote'])

bot.polling()