from rest_framework import serializers


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
        A ModelSerializer that takes an additional `fields` argument that
        controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)  # only fields
        excludes = kwargs.pop('excludes', None)  # exclude fields

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields and excludes:
            raise ValueError("Can not pass fields and excludes parameters at the same time")

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        if excludes is not None:
            set_excludes = set(excludes)
            for field_name in set_excludes:
                self.fields.pop(field_name)
