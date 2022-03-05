from django.apps import AppConfig


class NewsfeedConfig(AppConfig):
    name = 'newsfeed'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('Post'))
        registry.register(self.get_model('Comment'))
