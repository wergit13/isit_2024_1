import datetime
import telebot
from telebot import types

from secret import botToken
import telegramcalendar
import valute

bot = telebot.TeleBot(botToken)


@bot.message_handler(commands=['start'])
def get_calendar(message):
    now = datetime.datetime.now() #Текущая дата
    markup = telegramcalendar.create_calendar(now.year,now.month)
    bot.send_message(message.chat.id, "Choose date", reply_markup=markup)


@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    if call.data == "average week":
        bot.edit_message_text(f"GBP: {round(valute.getAverageLastDays("GBP", 7), 2)}", chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=None)
        return
    elif call.data == "average mounth":
        bot.edit_message_text(f"GBP: {round(valute.getAverageLastDays("GBP", 30), 2)}", chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=None)
        return
    elif call.data == "average 3 mounth":
        bot.edit_message_text(f"GBP: {round(valute.getAverageLastDays("GBP", 91), 2)}", chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=None)
        return


    selected,date = telegramcalendar.process_calendar_selection(bot, call)
    if selected:
        try:
            bot.send_message(call.message.chat.id, f"GBP: {getCourse("GBP", date)}")
        except Exception:
            bot.answer_callback_query(callback_query_id=call.id, text=f"Error happened(")

@bot.message_handler(commands=['average'])
def average(message):
    markup = types.InlineKeyboardMarkup()
    button_like = types.InlineKeyboardButton("last week", callback_data="average week")
    button_dislike = types.InlineKeyboardButton("last mounth", callback_data="average mounth")
    button_dislike2 = types.InlineKeyboardButton("last 3 mounths", callback_data="average 3 mounth")
    markup.add(button_like, button_dislike, button_dislike2,row_width=1)

    bot.send_message(message.chat.id, "Choose period", reply_markup=markup)

bot.polling()