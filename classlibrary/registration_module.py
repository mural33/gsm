from django.conf import settings
SWAGGER_URL = settings.SWAGGER_URL
import requests

class Institute:
    swagger_url = f'{SWAGGER_URL}api/Subscribers'
    # api_url = f'{api_url}/Institute/create_institute/'
    def __init__(self,fasapi_url) -> None:
        self.api_url = fasapi_url

    def  create_institute(self,end_point="",data={}):
        print("inside fast api function")
        print("api_url",self.api_url+end_point)
        self.responce = requests.post(self.api_url + end_point,json=data)
       
        print("self.responce",self.responce.json())
        if self.responce.status_code == 200:
            return self.responce.json()
        else:
            raise Exception("Error in creating institute")
        
    def create_institute_in_swagger(self,data = {},fast_api_end_point=""):
        self.swagger_data = {
            "subscribers_id": 0,
            "product_id": 2,
            "plan_id": 6,
            "organization_name": data.get("institution_name"),
            "contact_name": data.get("full_name"),
            "mobile_number": data.get("institute_phone"),
            "email": data.get("institute_email"),
            "address": "gachibowli",
            "date": "2023-12-19T11:03:17.108Z",
            "subcrption_name": "string",
            "plan_name": "string",
            "payment_details": "string",
            "payment_status": "string",
            "remarks": "string",
            "amount_paid": 0,
            "currency": "string",
            "is_active": True,
            "city": "string",
            "state": "string",
            "country": "string",
            "pincode": "string"
        }
        

        print("swagger_data",self.swagger_data)
        try:
            self.responce = requests.post(self.swagger_url,data=self.swagger_data)
            print("self.responce",self.responce.json())
            if self.responce.status_code == 200:
                self.fastapi_data = {
                    "id": data.get("institution_id"),
                    "subscribers_id": self.responce.json()["id"],
                    "institute_name": data.get("institution_name"),
                    "institute_address": "string",
                    "institute_city": "string",
                    "institute_state": "string",
                    "institute_country": "string",
                    "institute_pincode": "string",
                    "institute_phone": data.get("institute_phone"),
                    "institute_email": data.get("institute_email"),
                    "institute_logo": "string",
                    "institute_fav_icon": "string",
                    "institute_tag_line": "string",
                    "institute_website": "string",
                    "point_of_contact": "string",
                    "date_of_registration": "2023-12-20",
                    "is_deleted": False
                }
                          
                print("fastapi_data",self.fastapi_data) 

                    
                return self.create_institute("Institute/create_institute/",data=self.fastapi_data)
            else:
                raise Exception("Error in creating institute")
        except Exception as e:
            return {"error":str(e)}


