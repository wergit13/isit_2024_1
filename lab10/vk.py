import requests
from requests.models import PreparedRequest

from secret import vkToken

url = "https://api.vk.com/method/"
params = { "access_token": vkToken, "v": "5.81"}

def setStatus(status):
    params = {'lang':'en','tag':'python'}
    req = PreparedRequest()
    req.prepare_url(url + "set.status", params | {"text": status})
    resp = requests.get(req.url)
    if resp.status_code == 200:
        return True
    
    return False
