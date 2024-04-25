import datetime
import telebot
from telebot import types

from secret import botToken
import telegramcalendar
from valute import getCourse

bot = telebot.TeleBot(botToken)


@bot.message_handler(commands=['start'])
def get_calendar(message):
    now = datetime.datetime.now() #Текущая дата
    markup = telegramcalendar.create_calendar(now.year,now.month)
    bot.send_message(message.chat.id, "Choose date", reply_markup=markup)


@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    selected,date = telegramcalendar.process_calendar_selection(bot, call)
    if selected:
        try:
            bot.send_message(call.message.chat.id, f"GBP: {getCourse("GBP", date)}")
        except Exception:
            bot.answer_callback_query(callback_query_id=call.id, text=f"Error happened(")


bot.polling()