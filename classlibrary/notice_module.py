import requests
import asyncio
class Notice:
    def __init__(self, api_url="", id="", jwt=""):
        self.api_url = api_url
        self.id = id
        self.jwt = jwt
        self.headers = {
                "Authorization": f"Bearer {jwt}",
                "Content-Type": "application/json",
        }

    def get_notice_data(self, url):
        self.total_url = self.api_url + url
        response = requests.get(url = self.total_url, headers=self.headers)
        if response.status_code == 200:
            return {"status": True, "data": response.json()}
        else:
            return {"status": False, "error": response.json(), "status_code": response.status_code}