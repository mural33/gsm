import requests
from django.shortcuts import render

LA_ENDPOINT = f"https://prod-04.southindia.logic.azure.com:443/workflows/0dc7048d54d549179a5b2202e23ba02e/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZtFHfQPDXDmJGwqQp09wpM9HUzM3HdO9AdJiaTWVbno"

class SendNotification:
    def __init__(self):
        self.lg_endpoint = LA_ENDPOINT

    def global_requests(self, payload):
        try:
            response = requests.post(self.lg_endpoint, json=payload)
            response.raise_for_status()
            return {"message": "Notification sent successfully", "response": response}
        except requests.exceptions.RequestException as e:
            return {"message": "Failed to send notification", "error": str(e)}

    def renew_product(self, to_email=None, plan_data=None):
        subject_msg = "Unlock the Power of Gurukul: Your School Management Journey Begins"
        html_content = render(
            None,
            "renew_subscription.html",
            {"plan_data": plan_data}  # Pass plan_data to the template
        ).content.decode('utf-8')
        payload = {
            "to_email": to_email,
            "email_subject": subject_msg,
            "email_body": html_content,
        }
        return self.global_requests(payload)
