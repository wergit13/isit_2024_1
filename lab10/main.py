import telebot
from telebot import types

from secret import botToken
from vk import setStatus

bot = telebot.TeleBot(botToken)



@bot.message_handler(content_types=["text"])
def handler(message):
    resp = ""
    try:
        res = setStatus(message.text)
        resp = "Status set" if res else "Error happened"
    except:
        resp = "Error happened"
    bot.send_message(message.chat.id, resp)

bot.polling()
