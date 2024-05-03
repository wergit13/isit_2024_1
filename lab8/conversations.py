from telebot import types
from enum import Enum
import logging

from telegram.ext import ConversationHandler
from telegram import ReplyKeyboardMarkup, ReplyKeyboardRemove

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.DEBUG)

logger = logging.getLogger(__name__)

MENU_STING = "<- Back to menu"

class TestPart:
    def __init__(self, text, responces, end):
        self.text = text
        self.responces = responces
        self.end = end
        if end == True:
            self.stat = dict.fromkeys([resp for resp in responces], 0)

TEST_ROOT = TestPart("Choose category", {
        "Math" : TestPart("Choose question", {
            "Question 1": TestPart("What is the result of 5 + 3?", {"8": "You are right!!", "9": "Try again"}, True),
            "Question 2": TestPart("If you have 10 apples and give away 4, how many apples do you have left?", {"6": "You are right!!", "4":"Try again"}, True)
        }, False), 
        "History" : TestPart("Choose question",{
            "Question 1": TestPart("In what year did World War II end?", {"1939":"Try again", "1945":"You are right!!", "1946":"Try again"}, True),
            "Question 2": TestPart("Which ancient civilization built the pyramids?", {"Greek":"Try again", "Roman":"Try again", "Egyptian":"You are right!!"}, True)
        } , False) 
    } ,False)


class ConvStates(Enum):
    MENU = 1
    ANSWER = 2

class BotConversations:
    class Conversation:
        def __init__(self, userid):
            self._userid = userid
            self.reset()

        def reset(self):
            self.path = []

    def __init__(self):
        self._conversations = {}


    def _start_conv_for_user(self, userid):
        if userid not in self._conversations:
            self._conversations[userid] = self.Conversation(userid)
        self._conversations[userid].reset()

    async def _send_menu(self, update, context):
        await update.message.reply_text(TEST_ROOT.text, reply_markup=ReplyKeyboardMarkup([[resp for resp in TEST_ROOT.responces]], one_time_keyboard=True))

    async def handler_start(self, update, context):
        self._start_conv_for_user(update.message.from_user.id)
        await self._send_menu(update, context)
        return ConvStates.ANSWER

    async def handler_cancel(self, update, context):
        return ConversationHandler.END

    async def handler_answer(self, update, context):
        userid = update.message.from_user.id
        text = update.message.text

        if text == MENU_STING :
            self._conversations[userid].reset()
            await self._send_menu(update, context)
            return ConvStates.ANSWER
        
        path = self._conversations[userid].path
        answer = TEST_ROOT
        for ans in path:
            answer = answer.responces[ans]
        
        if answer.responces[text] == None:
            await update.message.reply_text(text="I didn't understand that.", reply_markup=ReplyKeyboardRemove())
            return ConversationHandler.END
        
        if answer.end == True :
            await update.message.reply_text(text=answer.responces[text], reply_markup=ReplyKeyboardRemove())
            answer.stat[text] += 1
            return ConversationHandler.END
        
        self._conversations[userid].path.append(text)
        
        buttons = [resp for resp in answer.responces[text].responces]
        buttons.append(MENU_STING)
        print(buttons)
        markup = ReplyKeyboardMarkup([buttons], one_time_keyboard=True)

        await update.message.reply_text(text=answer.responces[text].text, reply_markup=markup)

        return ConvStates.ANSWER
    
    def _make_stat_string(self):
        def dfs(list):
            if list[0].end == True:
                stat_string = ""
                for node in list:
                    stat_string += node.text + "\r\n"
                    for (k, v) in node.stat.items():
                        stat_string += '  ' + k + ' : ' + str(v) + "\r\n"
                return stat_string
            
            l2 = []
            for node in list:
                l2.extend([n for (_, n) in node.responces.items()])

            return dfs(l2)
        
        return dfs([n for (_, n) in TEST_ROOT.responces.items()])
          
    async def handler_stat(self, update, context):
        await update.message.reply_text(text=self._make_stat_string())
        return ConversationHandler.END
