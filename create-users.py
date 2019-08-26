import random
import string

from django.contrib.auth.hashers import make_password

from accounts.models import User

User.objects.bulk_create([
    User(
        username=''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(5)),
        email=''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(5)) + '@email.com',
        password=make_password('123456'),
        is_active=True,
    ) for _ in range(100)
])
