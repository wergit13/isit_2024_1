import telebot
from telebot import types

from secret import botToken

bot = telebot.TeleBot(botToken)

from telegram.ext import (Updater, CommandHandler, MessageHandler,
                          filters, ConversationHandler)
from telegram.ext import CallbackQueryHandler, Application
from telegram import Bot, Update


from conversations import ConvStates, BotConversations
from asyncio import Queue

def main() -> None:
    conv = BotConversations()
    application = Application.builder().token(botToken).build()

    # Add conversation handler with the states GENDER, PHOTO, LOCATION and BIO
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('start', conv.handler_start)],
        states={
            ConvStates.ANSWER: [MessageHandler(filters.Text(), conv.handler_answer)]
        },
        fallbacks=[CommandHandler('cancel', conv.handler_cancel)]
    )

    application.add_handler(conv_handler)
    application.add_handler(CommandHandler('stat', conv.handler_stat))
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()