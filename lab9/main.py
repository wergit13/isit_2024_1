import telebot
from telebot import types

from secret import botToken

bot = telebot.TeleBot(botToken)

like_count = 0
dislike_count = 0

def create_likes_keyboard():
    global like_count
    global dislike_count
    markup = types.InlineKeyboardMarkup()
    button_like = types.InlineKeyboardButton(f"I like({like_count})", callback_data="like")
    button_dislike = types.InlineKeyboardButton(f"I don't like({dislike_count})", callback_data="dislike")
    markup.add(button_like, button_dislike)

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
    elif call.data == "dislike":
        global dislike_count
        dislike_count += 1
    bot.edit_message_text(text=call.message.text,
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            reply_markup=create_likes_keyboard())

bot.polling()