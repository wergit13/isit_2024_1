import telebot
from telebot import types

from secret import botToken

bot = telebot.TeleBot(botToken)

like_count = 0
dislike_count = 0

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.InlineKeyboardMarkup()
    button_like = types.InlineKeyboardButton("I like", callback_data="like")
    button_dislike = types.InlineKeyboardButton("I don't like", callback_data="dislike")
    markup.add(button_like, button_dislike)

    bot.send_message(message.chat.id, "Do you like this?", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    if call.data == "like":
        global like_count
        like_count += 1
        bot.answer_callback_query(callback_query_id=call.id, text=f"Likes: {like_count}")
    elif call.data == "dislike":
        global dislike_count
        dislike_count += 1
        bot.answer_callback_query(callback_query_id=call.id, text=f"Dislikes: {dislike_count}")

bot.polling()