import requests
class ClassData:
    def __init__(self,api_url,class_slug,jwt):
        self.api_url = api_url
        self.class_slug = class_slug
        self.header = {
        "accept":'application/json',
        'Authorization':f"Bearer {jwt}"
    }
        
    def get_section(self,url:str = "",params:dict={}):
        self.sections_url=self.api_url + url
        self.response = requests.get(url=self.sections_url,params=params,headers=self.header)
        if self.response.status_code == 200:
            return self.response.json()
        else:
            return []
        
    def get_subject(self,url:str = "",params:dict={}):
        self.subject_url=self.api_url + url
        self.response = requests.get(url=self.subject_url,params=params,headers=self.header)
        if self.response.status_code == 200:
            return self.response.json()
        else:
            return []
    
    def get_students(self,url:str = "",params:dict={}):
        self.students_url=self.api_url + url
        self.response = requests.get(url=self.students_url,params=params,headers=self.header)
        if self.response.status_code == 200:
            return self.response.json()
        else:
            return []
                
    def get_class_data(self,url = "",params:dict={}):
        self.total_url = self.api_url + url
        self.response = requests.get(url=self.total_url,params=params,headers=self.header)
        if self.response.status_code == 200:
            return self.response.json()
        else:
            return []
    
        