import telebot
from telebot import types

from secret import botToken

bot = telebot.TeleBot(botToken)

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    item1 = types.KeyboardButton("Question 1")
    item2 = types.KeyboardButton("Question 2")
    markup.add(item1, item2)

    bot.send_message(message.chat.id, "Choose a question:", reply_markup=markup)

@bot.message_handler(func=lambda message: True)
def echo_all(message):
    if message.text == "Question 1":
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        item3 = types.KeyboardButton("Spring")
        item4 = types.KeyboardButton("Summer")
        markup.add(item3, item4)

        bot.send_message(message.chat.id, "What do you prefer?", reply_markup=markup)

    elif message.text == "Question 2":
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        item5 = types.KeyboardButton("Vanilla")
        item6 = types.KeyboardButton("Chocolate")
        markup.add(item5, item6)

        bot.send_message(message.chat.id, "What kind of ice cream do you like?", reply_markup=markup)

    elif message.text in ["Spring", "Summer", "Vanilla", "Chocolate"]:
        bot.send_message(message.chat.id, f"You chose: {message.text}")

    else:
        bot.send_message(message.chat.id, "I didn't understand that.")

bot.polling()