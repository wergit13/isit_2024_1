import requests
import xml.dom.minidom as xml
import datetime

def getInnerText(node):
    rc = []
    for n in node.childNodes:
        if n.nodeType == n.TEXT_NODE:
            rc.append(n.data)
    return ''.join(rc)

def getCourse(currencyCode, date):
    r = requests.get(f"http://www.cbr.ru/scripts/XML_daily.asp?date_req={date.strftime("%d/%m/%Y")}")
    if r.status_code != 200:
        raise Exception("Can not fetch resourse")
    
    data = xml.parseString(r.text)
    data.normalize()
    for cur in data.getElementsByTagName("Valute"):
        if getInnerText(cur.getElementsByTagName("CharCode")[0]) == currencyCode:
            return float(getInnerText(cur.getElementsByTagName("Value")[0]).replace(',', '.'))
        
    raise Exception("No such currency")

def getAverageLastDays(currencyCode, days):
    date = datetime.datetime.now()
    delta = datetime.timedelta(days=1)
    s = float(0)
    for _ in range(days):
        s += getCourse(currencyCode, date)
        date -= delta
    return s/days

