class PageOneClass:
    def __init__(self, x,y):
        self.result = x+y

    def get_submission(self):
        return f"Sum - {self.result} - this is dynamically from class library!"