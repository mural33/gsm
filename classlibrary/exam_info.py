import requests
import asyncio
import pandas as pd
class ExamInfo:
    def __init__(self,base_url="",jwt="",exam_id=""):
        self.exam_id = exam_id
        self.base_url = base_url
        self.jwt = jwt
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.jwt}",
        }
    async def get_parent_exam(self):
        self.end_point = f"/ParentExams/get_parent_exam_by_parent_exam_id?parent_exam_id={self.exam_id}"
        self.total_url = self.base_url + self.end_point
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()["response"]
            return data
        else:
            return []
    
    async def get_exam_subjects(self):
        self.end_point = f"/Exams/get_exam_by_parent_exam_id/?parent_exam_id={self.exam_id}"
        self.total_url = self.base_url + self.end_point
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()["response"]
            return data
        else:
            return []
    
    async def get_student_data(self,class_id):
        self.end_point = f"/Students/get_students_by_field/class_id/{class_id}/"
        self.total_url = self.base_url + self.end_point
        response = requests.get(url=self.total_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            return []
        
    async def call_functions(self):
        parent_exam = await asyncio.gather(self.get_parent_exam())
        exam_subjects = await asyncio.gather(self.get_exam_subjects())
        student_data = await asyncio.gather(self.get_student_data(parent_exam[0]["class_id"]))
        headers = ["Student Id","Student Name","Roll Number"] + [subject["subject"]["subject_name"] for subject in exam_subjects[0]]
        df = pd.DataFrame(columns=headers)
        for student in student_data[0]:
            print(student)
            student_marks ={"Student Id":student["student_id"],"Student Name":student["student_name"],"Roll Number":student["roll_number"]}
            df.loc[len(df)] = student_marks
        payload = {
            "file_name":parent_exam[0]["parent_exam_name"],
            "data":df
        }
        return payload

