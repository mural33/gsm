import requests
import asyncio


class Student:
    def __init__(self, api_url="", slug="", jwt=""):
        self.api_url = api_url
        self.slug = slug
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {jwt}",
        }

    async def get_student_data(self, url):
        self.total_url = self.api_url + url
        self.response = requests.get(url=self.total_url, headers=self.headers)
        if self.response.status_code == 200:
            data = self.response.json()
            return data[0]

    async def get_class_data(self, end_point="", params={}):
        self.total_url = f"{self.api_url}{end_point}"
        self.response = requests.get(
            url=self.total_url, params=params, headers=self.headers
        )
        if self.response.status_code == 200:
            return self.response.json()

    async def collect_datas(self, institute_id=0):
        self.student_data, self.class_data = await asyncio.gather(
            self.get_student_data(f"/Students/get_students_by_field/slug/{self.slug}/"),
            self.get_class_data(
                f"/Classes/get_classes_by_institute/?institite_id={int(institute_id)}"
            ),
        )
        return {"student_data": self.student_data, "class_data": self.class_data}


class StudentInfo:
    # student_parent_url = "/Parents/get_parents_data_by_student_id/"
    student_parent_url = "/Parents/get_parents_by_student_id/"
    student_transport_url = "student/transport/"
    student_attendance_url = "student/attendance/"
    student_academic_url = "student/academic/"
    student_transport_url = "/Transports/get_transport_data_by_id/"

    def __init__(self, api_url="", slug="", jwt=""):
        self.api_url = api_url
        self.slug = slug
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {jwt}",
        }

    async def get_student_data(self, student_slug):
        self.end_point = f"/Students/get_students_by_field/slug/{student_slug}/"
        self.total_url = self.api_url + self.end_point
        response = requests.get(url=self.total_url, headers=self.headers)
        print(response.json())
        if response.status_code == 200:
            data = response.json()
            return data[0]
        else:
            return []

    async def get_transport_data(self, transport_id):
        if transport_id == None:
            return []
        self.end_point = self.student_transport_url + f"?transport_id={transport_id}"
        self.total_url = self.api_url + self.end_point
        response = requests.get(url=self.total_url, headers=self.headers)
        print(response.json())
        if response.status_code == 200:
            data = response.json()["response"]
            return data
        else:
            return []

    async def get_student_parents_data(self, student_id=0):
        student_id = int(student_id)
        self.total_url = (
            self.api_url
            + self.student_parent_url
            + f"?student_id={student_id}"
        )
        response = requests.get(url=self.total_url, headers=self.headers)
        print(response.json())
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            return []

    async def get_all_data(self, student_slug):
        student_data = await asyncio.gather(self.get_student_data(student_slug))
        student_parents_data, transport_data = await asyncio.gather(
            self.get_student_parents_data(student_data[0]["student_id"]),
            self.get_transport_data(student_data[0]["transport_id"]),
        )
        return {
            "student_data": student_data[0],
            "parent_data": student_parents_data,
            "transport_data": transport_data,
        }
