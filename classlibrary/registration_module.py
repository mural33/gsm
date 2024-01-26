from datetime import datetime
import requests
from django.conf import settings

Subscription_URL = settings.SUBSCRIPTION_URL
api_url = settings.API_ENDPOINT


class Institute:
    Subscription_URL = f"{Subscription_URL}api/Subscribers"
    api_url = f"{api_url}/Institute/"

    def __init__(self, fasapi_url) -> None:
        self.api_url = fasapi_url

    def create_user(self, data={}, end_point=""):
        headers = {"accept": "application/json", "Content-Type": "application/json"}
        response = requests.post(self.api_url + end_point, json=data, headers=headers)

        if response.status_code == 200:
            return {"status": True, "data": response.json()}
        else:
            return {
                "status": False,
                "error": response.json(),
                "status_code": response.status_code,
            }

    def create_institute(self, end_point="", data={}):
        self.user = {
            "user_name": data.get("point_of_contact"),
            "user_password": data.get("password"),
            "user_email": data.get("institute_email"),
            "user_phone_number": data.get("institute_phone"),
            "is_deleted": False,
            "user_role": "Admin",
            "institute_id": data.get("id"),
            "user_photo_url": "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
        }
        self.headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
        }
        print("check data api",self.api_url + end_point)
        self.responce = requests.post(
            self.api_url + end_point, json=data, headers=self.headers
        )
        print("check response code",self.responce.status_code)
        if self.responce.status_code == 200:
            user = self.create_user(end_point="/Users/create_user/", data=self.user)
            if user["status"]:
                return {"status": True, "data": self.responce.json()}
            return {"status": False, "data": user["data"]}
        else:
            return {"status": False, "data": self.responce.json()}

    def create_institute_in_subscription(self, data={}, fast_api_end_point=""):
        self.subscription_data = {
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
            "pincode": "string",
        }

        try:
            self.responce = requests.post(
                self.Subscription_URL, data=self.subscription_data
            )
            self.responcce_data = self.responce.json()
            print("check responce data",self.responcce_data)
            if self.responcce_data["status"]:
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
                    "point_of_contact": data.get("full_name"),
                    "date_of_registration": datetime.today().date().isoformat(),
                    "is_deleted": False,
                }
                print("check fastapi data",self.fastapi_data)
                self.fastapi_data["password"] = data.get("institute_password")
                return {"status": True, "data": self.fastapi_data}
            else:
                return {"status": False, "error": self.responcce_data["message"]}
        except Exception as e:
            return {"error": str(e)}
