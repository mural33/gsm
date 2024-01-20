# import razorpay
# import uuid
# from django.conf import settings
# from GSM_Website.settings import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

# client = razorpay.Client(auth=(RAZOR_KEY_ID, RAZOR_KEY_SECRET))
# def create_order(request):
#     order_id = generate_order_id(request.user.id) 
#     data = {
#         'amount': request.GET.get("amount"),  
#         'currency': 'INR',  
#         'receipt': 'receipt_order_{}'.format(order_id),
#         'payment_capture': 1  
#     }
#     try:
#         order = client.order.create(data=data)
#         return JsonResponse({'order_id': order['id']})
#     except Exception as e:
#         return JsonResponse({'error': str(e)})
    
#     return JsonResponse({'order_id': order['id']})

# def generate_order_id(user_id):
#     unique_id = str(uuid.uuid4()).replace('-', '')[:10]  
#     order_id = f"{user_id}_{unique_id}"
#     return order_id